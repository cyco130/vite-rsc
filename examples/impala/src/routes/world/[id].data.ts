// Use this function to define pages to build, and load data for each page.
export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: "1" }, data: { title: "One", description: "Page one" } },
      { params: { id: "2" }, data: { title: "Two", description: "Page two" } },
      {
        params: { id: "3" },
        data: { title: "Three", description: "Page three" },
      },
    ],
  };
}

// This data is shared by all pages in the route.

export function getRouteData() {
  return {
    msg: "hello world",
  };
}
