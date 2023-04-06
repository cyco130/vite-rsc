import {
	renderToReadableStream as renderToRSCStream,
	decodeReply as decodeActionArgs,
	renderToReadableStream as renderToResultStream,
} from "react-server-dom-webpack/server.edge";
import { createFromReadableStream as createElementFromRSCStream } from "react-server-dom-webpack/client.edge";
import {
	renderToReadableStream as _renderToHTMLStream,
	RenderToReadableStreamOptions,
} from "react-dom/server.edge";
import { ReactElement } from "react";
import { sanitize } from "./htmlescape";
import { asyncLocalStorage } from "./async-storage";

export {
	renderToReadableStream as renderToRSCStream,
	renderToReadableStream as renderToResultStream,
	decodeReply as decodeServerFunctionArgs,
} from "react-server-dom-webpack/server.edge";

async function nextMacroTask(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

const closingBodyHtmlText = `</body></html>`;

/**
 * Creates a TransformStream that inlines the initial RSC stream that is used * produce the HTML stream, as data in script tags at the end of the HTML
 * stream. Note that the RSC stream should be teed before being passed to this
 * function, so that the HTML stream can be read from the first tee, and the
 * RSC stream can be read from the second tee for inlining.
 *
 * It inlines it right before the closing body tag, so that the RSC stream
 * doesn't have to be parsed/processed by the browser until after the HTML
 * stream has been parsed.
 *
 * The API it exposes on the client is:
 * - window.init_rsc: a ReadableStream that is the initial RSC stream,
 * 							  			should be used for hydration
 * - window.rsc_chunk(chunk): a function that can be used to write chunks to
 * 										 the RSC stream, which will be inlined in the HTML stream
 * @param rscStream
 * @returns TransformStream
 */
function inlineRSCTransformStream(
	rscStream: ReadableStream<Uint8Array>,
): ReadableWritablePair<Uint8Array, Uint8Array> {
	let removedClosingBodyHtmlText = false;
	let insertingRscStreamScripts: Promise<void> | undefined;
	let finishedInsertingRscStreamScripts = false;

	const textDecoder = new TextDecoder();
	const textEncoder = new TextEncoder();

	return new TransformStream<Uint8Array, Uint8Array>({
		transform(chunk, controller) {
			const text = textDecoder.decode(chunk);

			if (
				text.endsWith(closingBodyHtmlText) &&
				!finishedInsertingRscStreamScripts
			) {
				const [withoutClosingBodyHtmlText] = text.split(closingBodyHtmlText);

				controller.enqueue(textEncoder.encode(withoutClosingBodyHtmlText));

				removedClosingBodyHtmlText = true;
			} else {
				controller.enqueue(chunk);
			}

			if (!insertingRscStreamScripts) {
				const reader = rscStream.getReader();

				controller.enqueue(
					textEncoder.encode(
						`<script>(()=>{const{writable,readable}=new TransformStream();const writer=writable.getWriter();self.init_rsc=readable;self.rsc_chunk=(text)=>writer.write(new TextEncoder().encode(text))})()</script>`,
					),
				);

				insertingRscStreamScripts = new Promise(async (resolve) => {
					try {
						while (true) {
							const result = await reader.read();

							if (result.done) {
								finishedInsertingRscStreamScripts = true;

								if (removedClosingBodyHtmlText) {
									controller.enqueue(textEncoder.encode(closingBodyHtmlText));
								}

								return resolve();
							}

							await nextMacroTask();

							controller.enqueue(
								textEncoder.encode(
									`<script>self.rsc_chunk(${sanitize(
										JSON.stringify(textDecoder.decode(result.value)),
									)});</script>`,
								),
							);
						}
					} catch (error) {
						controller.error(error);
					}
				});
			}
		},

		async flush() {
			return insertingRscStreamScripts;
		},
	});
}

/**
 * Creates a TransformStream that buffers the text in the stream, and then
 * flushes it all at once at the end of the stream.
 * @returns TransformStream
 */
function bufferedTransformStream(): ReadableWritablePair<
	Uint8Array,
	Uint8Array
> {
	let bufferedText = ``;
	let buffering: Promise<void> | undefined;

	return new TransformStream({
		transform(chunk, controller) {
			bufferedText += new TextDecoder().decode(chunk);

			buffering ||= new Promise(async (resolve) => {
				await nextMacroTask();

				controller.enqueue(new TextEncoder().encode(bufferedText));

				bufferedText = ``;
				buffering = undefined;

				resolve();
			});
		},

		async flush() {
			return buffering;
		},
	});
}

export interface BundleMap {
	[key: string]: {
		id: string;
		chunks: string[];
		name: string;
		async?: boolean;
	};
}

/**
 * Renders a React element to a ReadableStream of HTML. It first renders the
 * element to a ReadableStream of RSC, and then uses the RSC stream to render
 * the HTML stream. It then inlines the RSC stream as data in script tags at
 * the end of the HTML stream.
 *
 * When the RSC stream is rendered to HTML, it also renders the Client
 * components which were skipped during the RSC render.
 *
 * @param element React element to render, should be server component
 * @param renderOptions
 * @returns ReadableStream of HTML
 */
export async function renderToHTMLStream(
	element: ReactElement,
	renderOptions: RenderToReadableStreamOptions & {
		clientModuleMap: ModuleMap;
	},
) {
	const rscStream = renderToRSCStream(element, renderOptions.clientModuleMap);
	const [rscStream1, rscStream2] = rscStream.tee();

	const rscElement = await createElementFromRSCStream(rscStream1);
	const htmlStream = await _renderToHTMLStream(rscElement, renderOptions);
	return htmlStream
		.pipeThrough(bufferedTransformStream())
		.pipeThrough(inlineRSCTransformStream(rscStream2));
}

export async function createHTMLStreamResponse(
	element: JSX.Element,
	renderOptions: RenderToReadableStreamOptions & {
		clientModuleMap: ModuleMap;
	},
	responseInit: ResponseInit = {},
) {
	return new Response(await renderToHTMLStream(element, renderOptions), {
		...responseInit,
		headers: { "Content-Type": "text/html", ...(responseInit.headers ?? {}) },
	});
}

export async function createRSCStreamResponse(
	element: JSX.Element,
	renderOptions: RenderToReadableStreamOptions & {
		clientModuleMap: ModuleMap;
	},
	responseInit: ResponseInit = {},
) {
	return new Response(
		renderToRSCStream(element, renderOptions.clientModuleMap),
		{
			...responseInit,
			headers: {
				"Content-Type": "text/x-component",
				...(responseInit.headers ?? {}),
			},
		},
	);
}

export async function createActionStreamResponse(
	action: any,
	args: any,
	renderOptions: RenderToReadableStreamOptions & {
		clientModuleMap: ModuleMap;
	},
	responseInit: ResponseInit = {},
) {
	return new Response(
		renderToResultStream(
			await action(...args),
			renderOptions.clientModuleMap,
			{},
		),
		{
			...responseInit,
			headers: {
				"Content-Type": "application/json",
				...(responseInit.headers ?? {}),
			},
		},
	);
}

export async function createMutationStreamResponse(
	action: any,
	args: any,
	element: JSX.Element,
	renderOptions: RenderToReadableStreamOptions & {
		clientModuleMap: ModuleMap;
	},
	responseInit: ResponseInit = {},
) {
	try {
		const result = await action(...args);
		console.log(result);

		return new Response(
			renderToRSCStream(element, renderOptions.clientModuleMap, {}),
			{
				...responseInit,
				headers: {
					"Content-Type": "text/x-component",
					...(responseInit.headers ?? {}),
				},
			},
		);
	} catch (e: any) {
		console.log("error", e);
		return new Response(e.message, {
			...responseInit,
			status: 500,
			headers: {
				"Content-Type": "text/plain",
				...(responseInit.headers ?? {}),
			},
		});
	}
}
