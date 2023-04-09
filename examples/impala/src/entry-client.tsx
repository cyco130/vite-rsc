import { Root, mount } from "stream-react/web/entry";
// Load the route modules as RSC and export for impala
import("./components/button");
mount(<Root />);
