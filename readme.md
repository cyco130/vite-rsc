# Vite RSC Experiments

## Discussions

 - Forum: [GitHUb Discussions](https://github.com/cyco130/vite-rsc/discussions).
 - Chat: [Discord](https://discord.gg/AKqMhV6Mwx).

## Goal

Implement a Vite plugin for [React Server Components](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components).

Ideally hitting the sweet spot between full-fledged yet flexible. Can we design the plugin so that it works with [Wakuwork](https://github.com/dai-shi/wakuwork), [Astro](https://astro.build/), [Rakkas](https://rakkasjs.org/), and [vite-plugin-ssr](https://vite-plugin-ssr.com/)?

## Prior Art

Existing implementations:
 - https://github.com/facebook/react/pull/22952 (Shopify's Hydrogen implementation)
 - https://github.com/dai-shi/wakuwork
 - https://github.com/bholmesdev/simple-rsc (with video of live code stream with Dan Abramov)
 - https://github.com/cyco130/vite-rsc (this repo)
 - https://github.com/parcel-bundler/parcel/commits/rsc
 - Next.js's implementation (PR welcome to add a link to its code)

Related:
 - https://github.com/Ephem/rollup-plugin-preserve-directives

## Things to do

- [x] Server side rendering for RSC (pass initial RSC stream to React's streaming server renderer)
- [x] Hydrate server rendered HTML stream with client side RSC stream
- [x] Inline Server components stream data to SSRed HTML stream and use that for hydration
- [x] Render full HTML page with React components
- [x] Client side navigation for path
- [x] Client side navigation for search params
- [ ] Proper route matching with path params
- [ ] Nested routing
- [ ] Typed router (ala tanstack router)
- [ ] File system routing
- [ ] Build
- [ ] Build-time routing (static RSC output)
- [ ] Server functions, ala "use server"
- [ ] Mutations via server functions
- [ ] Manage metadata/head tags


## How to run

```bash
pnpm install
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
