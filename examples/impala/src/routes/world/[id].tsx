import { DynamicRouteProps } from "@impalajs/core";
import { App } from "../../App";
// import { Head } from "@impalajs/react-rsc/head";

export default function Hello({
  path,
  params,
  data,
}: DynamicRouteProps<typeof import("./[id].data")>) {
  return (
    <App title={data?.title}>
      {/* <Head>
        <meta name="description" content={data.description || "A page"} />
      </Head> */}
      <div>
        Hello {path} {params.id}!
      </div>
    </App>
  );
}
