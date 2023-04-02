# Vite RSC Experiments

## Things to do

- [ ] Server side rendering for RSC (pass initial RSC stream to React's streaming server renderer)
- [ ] Hydrate server rendered HTML stream with client side RSC stream
- [ ] Inline Server components stream data to SSRed HTML stream and use that for hydration
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
