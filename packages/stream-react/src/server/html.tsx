import {
	renderToReadableStream as _renderToHTMLStream,
	RenderToReadableStreamOptions,
} from "react-dom/server.edge";
import React, { use, Thenable, useMemo } from "react";
import { renderServerComponent } from "./server-components";
import { sanitize } from "./htmlescape";

import {
	createFromReadableStream as createElementFromStream,
	createFromFetch as createElementFromFetch,
} from "react-server-dom-webpack/client.edge";
import type { Env } from "./env";

export type FlightResponseRef = {
	current: null | Thenable<JSX.Element>;
};
/**
 * Render Flight stream.
 * This is only used for renderToHTML, the Flight response does not need additional wrappers.
 */

export function useServerElement(
	serverElementStream: ReadableStream<Uint8Array>,
	flightResponseRef: FlightResponseRef,
	writable?: WritableStream<Uint8Array>,
	onChunk: (chunk: Uint8Array) => void = () => {},
) {
	if (flightResponseRef.current !== null) {
		return flightResponseRef.current;
	}

	if (writable && !writable.locked) {
		const [renderStream, forwardStream] = serverElementStream.tee();
		const res = createElementFromStream(renderStream, {
			callServer: (method, args) => {
				throw new Error("Not implemented");
			},
			// moduleMap: isEdgeRuntime
			// 	? clientReferenceManifest.edgeSSRModuleMapping
			// 	: clientReferenceManifest.ssrModuleMapping,
		});

		flightResponseRef.current = res;

		// We only attach CSS chunks to the inlined data.
		const forwardReader = forwardStream.getReader();
		const writer = writable.getWriter();

		function read() {
			forwardReader.read().then(({ done, value }) => {
				if (value) {
					onChunk(value);
				}

				if (done) {
					flightResponseRef.current = null;
					writer.close();
				} else {
					writer.write(value);
					read();
				}
			});
		}
		read();

		return res;
	} else {
		return createElementFromStream(serverElementStream, {
			callServer: (method, args) => {
				throw new Error("Not implemented");
			},
			// moduleMap: isEdgeRuntime
			// 	? clientReferenceManifest.edgeSSRModuleMapping
			// 	: clientReferenceManifest.ssrModuleMapping,
		});
	}
}

/**
 * Create a component that renders the Flight stream.
 * This is only used for renderToHTML, the Flight response does not need additional wrappers.
 */

export function createServerComponentRenderer<Props extends any = any>(
	src: string,
	{
		dataStream: writable,
		...env
	}: {
		dataStream: WritableStream;
	} & Env,
): (props: Props) => JSX.Element {
	const flightResponseRef: FlightResponseRef = { current: null };

	return function ServerComponentWrapper(props: Props): JSX.Element {
		const response = useMemo(() => {
			if (!writable || writable.locked) {
				return createElementFromFetch(
					renderServerComponent(src, props, env).then(
						(r) => ({ body: r } as Response),
					),
					{
						callServer: (method, args) => {
							throw new Error("Not implemented");
						},
					},
				);
			}

			const res = createElementFromFetch(
				renderServerComponent(src, props, env).then((r) => {
					const [renderStream, forwardStream] = r.tee();

					// We only attach CSS chunks to the inlined data.
					const forwardReader = forwardStream.getReader();
					const writer = writable.getWriter();

					function read() {
						forwardReader.read().then(({ done, value }) => {
							if (value) {
								// onChunk(value);
							}

							if (done) {
								flightResponseRef.current = null;
								writer.close();
							} else {
								writer.write(value);
								read();
							}
						});
					}
					read();
					return { body: renderStream } as Response;
				}),
				{
					callServer: (method, args) => {
						throw new Error("Not implemented");
					},
				},
			);

			flightResponseRef.current = res;
			return res;
		}, [writable]);

		if (!props) {
			console.log("called with no props");
			throw new Error("");
		}

		return use(response);
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
	component: string,
	props: any,
	renderOptions: RenderToReadableStreamOptions &
		Env & {
			dataStream: WritableStream;
		},
) {
	const ServerComponent = createServerComponentRenderer(
		component,
		renderOptions,
	);

	const htmlStream = await _renderToHTMLStream(
		<ServerComponent {...props} />,
		renderOptions,
	);

	return htmlStream.pipeThrough(bufferedTransformStream());
}

export async function createHTMLResponse(
	component: string,
	props: any,
	renderOptions: RenderToReadableStreamOptions & Env,
	responseInit: ResponseInit = {},
) {
	const transformStream = new TransformStream();
	try {
		const htmlStream = await renderToHTMLStream(component, props, {
			...renderOptions,
			dataStream: transformStream.writable,
		});
		return new Response(
			htmlStream.pipeThrough(
				inlineInitialServerComponent(transformStream.readable),
			),
			{
				...responseInit,
				headers: {
					"Content-Type": "text/html",
					...(responseInit.headers ?? {}),
				},
			},
		);
	} catch (e) {
		const htmlStream = await _renderToHTMLStream(
			<html id="__error__">
				<head></head>
				<body></body>
			</html>,
			renderOptions,
		);
		console.log({ error: e });
		return new Response(
			htmlStream
				.pipeThrough(bufferedTransformStream())
				.pipeThrough(inlineInitialServerComponent(transformStream.readable)),
			{
				headers: { "Content-Type": "text/html" },
			},
		);
	}
}

async function nextMacroTask(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

const closingBodyHtmlText = /*#__PURE__*/ `</body></html>`;
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
 * @param serverElementStream
 * @returns TransformStream
 */

export function inlineInitialServerComponent(
	serverElementStream: ReadableStream<Uint8Array>,
): ReadableWritablePair<Uint8Array, Uint8Array> {
	let removedClosingBodyHtmlText = false;
	let insertingServerElementStreamScripts: Promise<void> | undefined;
	let finishedInsertingServerElementStreamScripts = false;

	const textDecoder = new TextDecoder();
	const textEncoder = new TextEncoder();

	return new TransformStream<Uint8Array, Uint8Array>({
		transform(chunk, controller) {
			const text = textDecoder.decode(chunk);

			if (
				text.endsWith(closingBodyHtmlText) &&
				!finishedInsertingServerElementStreamScripts
			) {
				const [withoutClosingBodyHtmlText] = text.split(closingBodyHtmlText);

				controller.enqueue(textEncoder.encode(withoutClosingBodyHtmlText));

				removedClosingBodyHtmlText = true;
			} else {
				controller.enqueue(chunk);
			}

			if (!insertingServerElementStreamScripts) {
				const reader = serverElementStream.getReader();

				controller.enqueue(
					textEncoder.encode(
						`<script>(()=>{const{writable,readable}=new TransformStream();const writer=writable.getWriter();self.init_server=readable;self.chunk=(text)=>writer.write(new TextEncoder().encode(text))})()</script>`,
					),
				);

				insertingServerElementStreamScripts = new Promise(async (resolve) => {
					try {
						while (true) {
							const result = await reader.read();

							if (result.done) {
								finishedInsertingServerElementStreamScripts = true;

								if (removedClosingBodyHtmlText) {
									controller.enqueue(textEncoder.encode(closingBodyHtmlText));
								}

								return resolve();
							}

							await nextMacroTask();

							controller.enqueue(
								textEncoder.encode(
									`<script>self.chunk(${sanitize(
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
			return insertingServerElementStreamScripts;
		},
	});
}
/**
 * Creates a TransformStream that buffers the text in the stream, and then
 * flushes it all at once at the end of the stream.
 * @returns TransformStream
 */

export function bufferedTransformStream(): ReadableWritablePair<
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
