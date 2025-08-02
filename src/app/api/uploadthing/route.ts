import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

console.log("UploadThing route handler initialized");

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
