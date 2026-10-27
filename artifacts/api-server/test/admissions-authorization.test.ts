import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { configureTestEnvironment, jsonBody, startRouterServer } from "./helpers.ts";

configureTestEnvironment();

const { default: admissionsRouter } = await import("../src/routes/admissions.ts");

let server: Awaited<ReturnType<typeof startRouterServer>>;

before(async () => {
  server = await startRouterServer(admissionsRouter);
});

after(async () => {
  await server.close();
});

const protectedPaths = [
  "/admissions/applications/APP-TEST/dashboard",
  "/admissions/applications/APP-TEST/documents",
  "/admissions/documents/1/download",
  "/admissions/applications/APP-TEST/letter",
];

for (const path of protectedPaths) {
  test(`admissions endpoint rejects missing authentication: ${path}`, async () => {
    const response = await server.request(path, {
      method: path.endsWith("/documents") ? "POST" : "GET",
    });

    assert.equal(response.status, 401);
    assert.deepEqual(await jsonBody(response), {
      error: "Authentication required",
    });
  });
}
