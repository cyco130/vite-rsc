import { Root, mount } from "fully-react/web/entry";
// Load the route modules as RSC and export for impala
import("./components/button");
mount(<Root />);
