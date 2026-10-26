---
name: OpenAPI email validation
description: Keep generated email validators compatible with the workspace's installed Zod version.
---

Use an OpenAPI email pattern for input validation unless the generated validator is compatible with the workspace's installed Zod version.

**Why:** The current Orval output for `format: email` used a top-level `zod.email()` call that was unavailable in the workspace's Zod 3 package, stopping codegen's chained library typecheck.

**How to apply:** After changing OpenAPI email fields, regenerate the clients and inspect the generated Zod schema. Prefer a regex `pattern` over upgrading the shared Zod version as part of an unrelated CRUD change.
