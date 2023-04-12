# Vite RSC Experiments

## Discussions

- Forum: [GitHUb Discussions](https://github.com/cyco130/vite-rsc/discussions).
- Chat: [Discord](https://discord.gg/AKqMhV6Mwx).

## Goals

### Short term

Wire together all the pieces needed to build a proper app using vite and RSC. Implement the necessary router, bundler plugins and build setup to get an SSR'ed React app with RSC.

### Long term

Eventually we want extract the pieces into modular parts for other vite based frameworks to use. So, implement a Vite plugin for [React Server Components](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components).

Ideally hitting the sweet spot between full-fledged yet flexible. Can we design the plugin so that it works with [Wakuwork](https://github.com/dai-shi/wakuwork), [Astro](https://astro.build/), [Rakkas](https://rakkasjs.org/), and [vite-plugin-ssr](https://vite-plugin-ssr.com/)?

## Things to do

### Rendering

- [x] Server side rendering for RSC (pass initial RSC stream to React's streaming server renderer)
- [x] Hydrate server rendered HTML stream with client side RSC stream
- [x] Inline Server components stream data to SSRed HTML stream and use that for hydration
- [x] Render full HTML page with React components

### Routing

- [x] Client side navigation for path
- [x] Client side navigation for search params
- [x] Proper route matching with path params
- [ ] Nested routing
  - [x] Nested routing on the server (using children prop)
  - [ ] Nested navigation on the client, i.e, only request RSC for the nested route
- [ ] Typed router (ala tanstack router)
- [x] File system routing

### Mutations

- [x] Server functions, ala "use server"
- [x] Mutations via server functions
  - **API**: `useMutation` hook
    ```ts
    function Component({ action }) {
      let mutate = useMutation()
      function handleClick() {
        mutate(() => action())
      }
    }
    ```
- [x] Throw error to nearest ErrorBoundary
- [x] Forms
  - [x] Form submission
  - [x] Form redirects
  - [ ] Form validation
  - [ ] Form submission error handling 




### Head tags

- [ ] Manage metadata/head tags

### CSS/Styling

- [ ] Inline CSS to avoid FOUC
  - [x] Inline imported CSS files in RSC components
  - [ ] Inline imported CSS files in client components
  - [ ] Inline imported CSS Module files
  - [ ] Try to avoid having to send styles as hydration data
- [x] Build CSS manifest (importing CSS files)

### Build

- [x] Build
- [ ] Build-time routing (static RSC output)

## How to run

Currently, the main attraction is the [Contacts Demo](./examples/contacts). To run:

```bash
pnpm install # at root
cd examples/contacts
pnpm dev
```

## Structure

- `app`: User code

  - `root.tsx`: Root server component, declares routes and renders matched route
  - Other server/client components

- `modules`: Framework modules
  - `vite`: Vite plugins for RSC and integrating Hattip
  - `router`: Main framework
    - `server.ts`: Server handler, `/__rsc` endpoint for RSC stream, and other endpoints are per user's routing
    - `client.ts`: Client side router, handles navigation and hydration

## Prior Art

Existing implementations:

- https://github.com/facebook/react/pull/22952 (Shopify's Hydrogen implementation)
- https://github.com/dai-shi/wakuwork
- https://github.com/bholmesdev/simple-rsc (with video of live code stream with Dan Abramov)
- https://github.com/cyco130/vite-rsc (this repo)
- https://github.com/parcel-bundler/parcel/commits/rsc
- Next.js's implementation (PR welcome to add a link to its code)
- Remix Router/React Router
  Related:
- https://github.com/Ephem/rollup-plugin-preserve-directives
