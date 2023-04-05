# How it works

Rendering the HTML for a React component on the server,

```ts
import { renderToReadableStream as renderToRSCStream } from "react-server-dom-webpack/server.edge";
import { createFromReadableStream as createElementFromRSCStream } from "react-server-dom-webpack/client.browser";
import { renderToReadableStream as renderToHTMLStream } from "react-dom/server.edge";

export async function renderToHTML(
	element: ReactElement,
	options?: RenderToReadableStreamOptions | undefined,
) {
	const rscStream = renderToRSCStream(element, clientModuleMap);
  const rscElement = await createElementFromRSCStream(rscStream1, clientModuleMap);
	const htmlStream = await renderToHTMLStream(rscElement, options);
	return htmlStream
}

```

With inlining the RSC response as scripts tags into the HTML stream:

```ts
import { renderToReadableStream as renderToRSCStream } from "react-server-dom-webpack/server.edge";
import { createFromReadableStream as createElementFromRSCStream } from "react-server-dom-webpack/client.browser";
import { renderToReadableStream as renderToHTMLStream } from "react-dom/server.edge";
import { inlineRSCTransformStream } from "./streams";

export async function renderToHTML(
	element: ReactElement,
	options?: RenderToReadableStreamOptions | undefined,
) {
	const rscStream = renderToRSCStream(element, clientModuleMap);
	const [rscStream1, rscStream2] = rscStream.tee();
  const rscElement = await createElementFromRSCStream(rscStream1, clientModuleMap);
	const htmlStream = await renderToHTMLStream(rscElement, options);
	return htmlStream.pipeThrough(inlineRSCTransformStream(rscStream2));
}

```

## React APIs

```ts
import { renderToReadableStream as renderToRSCStream } from 'react-server-dom-webpack/server.edge'
import App from './App'

const rscStream = renderToRSCStream(<App />, clientModuleMap)
```

* Creates a `ReadableStream` representing the rendered server components.
* The client components are not evaluated during this render. They are left as references (`Symbol('react.client.reference')`) to be resolved by the 'client' of this stream. 
* Async components are allowed here and will be resolved and rendered in order in the stream. 
* Suspense boundaries are recognized and react will send the loading indicators earlier and the actual content once it loads. If no Suspense boundary is found, it will wait for the content to load and then send it. 
* The format of the stream is react's new format (codenamed Flight I think). This format is a new take on JSON but designed for streaming and incrementally sending relavant information
* No components with `useState`, `useReducer`, `useEffect`, etc are allowed here since these are only available on the 'client'.
- Has Node specific version: `import { renderToPipeableStream } from react-server-dom-webpack/server.node`

```ts
import { createFromReadableStream as createFromRSCStream } from 'react-server-dom-webpack/client.browser'

const rscResponse = createFromRSCStream(rscStream, clientModuleMap)
```