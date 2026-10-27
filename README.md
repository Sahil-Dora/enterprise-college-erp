# Enterprise College ERP

**Enterprise College ERP Version 2** is a unified university resource planning platform designed to support academic operations, administration, admissions, placements, parent services, reporting, and institutional integrations.

The project is built around a modular full-stack architecture with centralized authentication, role-based access control, PostgreSQL persistence, and shared API contracts. Version 2 is currently in its maintenance and stabilization phase, with final CI and production-build verification remaining.

---

## Repository Status

| Item | Current status |
|---|---|
| Product | Enterprise College ERP |
| Major version | Version 2 |
| Version label | 2.0.0 |
| Development phase | Maintenance and stabilization |
| Working branch | `fix/admissions-access-20261027-085712` |
| Latest branch commit | `a0a892c` |
| Local regression tests | Passed in the latest reported run |
| Final CI verification | Pending confirmation |
| Production build verification | Pending completion |

> **Release status:** The repository's final release readiness has not yet been established. General Availability and production-readiness claims should be confirmed by the release owner after the outstanding verification checks pass.

## Technology Badges

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-24-339933)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1)

*Technology versions are repository documentation labels; verify them against the current package configuration and deployment environment before release.*

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Capabilities](#key-capabilities)
- [Enterprise Modules](#enterprise-modules)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing and Verification](#testing-and-verification)
- [Production Builds](#production-builds)
- [User Roles and Access Control](#user-roles-and-access-control)
- [Documentation](#documentation)
- [Release and Maintenance Policy](#release-and-maintenance-policy)
- [Roadmap](#roadmap)
- [Screenshots](#screenshots)
- [Support and Security](#support-and-security)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

Enterprise College ERP provides a role-aware, same-origin full-stack application for university administration and academic operations.

The repository contains a React and Vite frontend, an Express API server, shared API contracts and validation packages, and a PostgreSQL data layer using Drizzle ORM.

The architecture includes:

- Authentication and database-backed session management.
- Centralized role-based authorization.
- Protected API routes and domain ownership checks.
- Persistent application data through PostgreSQL.
- Input validation and sanitized error responses.
- Structured logging, rate limiting, and security middleware.
- Shared frontend components and API contracts.
- Documentation for setup, architecture, deployment, and operations.

The current development focus is on preserving existing functionality, validating security-sensitive behavior, and establishing a reliable foundation for future maintenance.

## Key Capabilities

- Role-aware dashboards and navigation.
- Authentication, session lifecycle management, and RBAC.
- Student information and faculty management.
- Academic administration and course-related workflows.
- Attendance, assignments, examinations, and marks.
- Admissions and application management.
- Fees, library, and reporting workflows.
- Placement management and parent-facing services.
- AI-assisted conversations and administrative tools.
- Notifications, analytics, global search, and calendar export.
- Integration-related jobs, webhooks, payments, and audit records.
- Responsive UI components and application-level error handling.
- Health checks and operational logging.

The availability and completeness of individual workflows depend on their current implementation and configuration. Consult the relevant module documentation before relying on a capability in a production environment.

## Enterprise Modules

The repository's documented module scope includes:

| Category | Modules |
|---|---|
| Core platform | Authentication, RBAC, Dashboard |
| Academic operations | Student Information, Faculty, Departments, Courses, Attendance, Assignments, Examinations, Marks |
| Administration | Library, Fees, Reports, Analytics, Notifications |
| Student lifecycle | Admission CRM, Placement Management, Parent Portal |
| Assisted workflows | AI Assistant |
| Integrations | Integration Center |

This list describes the intended product scope; it does not independently certify every module as production-ready.

## Architecture

The project uses a pnpm workspace to organize the frontend, API server, shared libraries, and supporting tools.

At a high level, the application follows this structure:

1. **Frontend:** React and Vite provide the user interface and client-side workflows.
2. **API server:** Express handles API requests and backend application logic.
3. **Shared contracts:** API specification and validation packages support consistent communication between components.
4. **Data layer:** PostgreSQL stores persistent data, with Drizzle ORM and Drizzle Kit supporting database access and schema management.
5. **Security layer:** Authentication, active-session validation, centralized authorization, and domain-specific ownership checks protect supported routes.
6. **Deployment workflow:** The configured full-stack workflow builds the frontend and runs the API server, which is designed to serve the frontend and API from the same origin.

See [Architecture Documentation](docs/ARCHITECTURE.md) for additional details.

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Wouter

### Backend

- Node.js
- Express 5
- TypeScript
- Pino
- Helmet
- Rate-limiting middleware

### Database

- PostgreSQL
- Drizzle ORM
- Drizzle Kit

### Authentication and Security

- Signed JWT credentials
- Database-backed sessions
- bcrypt password hashing
- Centralized permission checks
- Request validation and sanitized errors

### Build and Development Tools

- pnpm workspaces
- TypeScript project references
- Vite
- esbuild
- Drizzle Kit

### Deployment Model

The application is designed for a same-origin full-stack deployment. The frontend build and backend server are managed through the repository's configured workspace scripts.

Deployment requirements and operational considerations are documented in [Deployment](docs/DEPLOYMENT.md).

---

## Repository Structure

```text
.
├── artifacts/
│   ├── college-erp/       # React/Vite frontend
│   └── api-server/        # Express API and regression tests
├── lib/
│   ├── db/                # Database schema and Drizzle client
│   ├── api-spec/          # API contract definitions
│   ├── api-zod/           # Shared validation types
│   └── api-client-react/  # React API hooks
├── scripts/               # Workspace utilities
├── docs/                  # Technical and operational documentation
├── .github/
│   └── workflows/         # CI workflows
├── ROADMAP.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── README.md
```

This is a high-level overview. Refer to [Project Structure](docs/PROJECT_STRUCTURE.md) and [Repository Structure](docs/STRUCTURE.md) for further details.

## Prerequisites

Before setting up the project, ensure the development environment has:

- Node.js 24 or a compatible version supported by the repository.
- pnpm.
- PostgreSQL.
- A configured database connection string.
- Required environment variables for the selected workflow.

Check the root `package.json`, `pnpm-workspace.yaml`, and package-specific manifests for exact version and dependency requirements.

## Installation

Clone the repository and enter its root directory. Then install the workspace dependencies:

```bash
pnpm install --frozen-lockfile
```

Configure the required environment variables before starting database-dependent workflows.

For local development, apply the database schema using the configured workspace command:

```bash
pnpm --filter @workspace/db run push
```

**Important:** The schema push command is intended for development and controlled local environments. Production schema changes must follow an approved migration and backup process.

See [Installation](docs/INSTALLATION.md) and [Database](docs/DATABASE.md) for further guidance.

## Environment Configuration

The following variables are referenced by the documented application workflows. Check the source configuration and [Environment Documentation](docs/ENVIRONMENT.md) for the exact requirements.

| Variable | Requirement | Purpose |
|---|---|---|
| `DATABASE_URL` | Required for database-backed workflows | PostgreSQL connection string |
| `SESSION_SECRET` | Required according to authentication configuration | Session and token signing security |
| `PORT` | Required by the current frontend Vite configuration and runtime workflows | Port configuration |
| `BASE_PATH` | Optional, depending on deployment | Frontend asset base path |
| `CORS_ORIGIN` | Optional | Approved cross-origin origins |
| `DEMO_MODE` | Development only | Server-side demo behavior |
| `VITE_DEMO_MODE` | Development only | Client-side demo controls |

Environment requirements can vary between development, testing, build, and deployment workflows.

**Security requirements:**

- Never commit secrets or production credentials.
- Keep demo features disabled in production.
- Use strong, private secrets and rotate them according to operational policy.
- Restrict database access to approved services.
- Configure allowed origins explicitly where cross-origin access is required.

## Database Setup

The project uses PostgreSQL and Drizzle ORM for persistent data.

For local development:

```bash
pnpm --filter @workspace/db run push
```

Database documentation covers schema definitions, relationships, constraints, indexes, and operational guidance.

- [Database Documentation](docs/DATABASE.md)

Do not use an unrestricted schema push as a substitute for a reviewed production migration strategy.

## Running the Application

Start the configured full-stack workflow from the repository root:

```bash
pnpm --filter @workspace/college-erp run fullstack
```

This workflow builds the frontend and starts the API server according to the package scripts. Ensure the required environment variables are set first.

### Useful Development Checks

```bash
# Workspace typecheck
pnpm run typecheck

# Frontend typecheck
pnpm --filter @workspace/college-erp run typecheck

# Backend typecheck
pnpm --filter @workspace/api-server run typecheck

# Frontend regression tests
pnpm --filter @workspace/college-erp run test

# API regression tests
pnpm --filter @workspace/api-server run test

# Isolated database regression tests
pnpm --filter @workspace/api-server run test:db
```

If the server is running on the configured port, the health endpoint can be checked with:

```bash
curl "http://localhost:${PORT}/api/healthz"
```

The health endpoint and its response should be verified against the current API implementation and runtime configuration.

## Testing and Verification

Regression tests help protect existing behavior as the project evolves.

The latest reported local verification completed successfully for:

| Verification | Result |
|---|---:|
| Workspace typecheck | Passed |
| Frontend typecheck | Passed |
| Frontend test typecheck | Passed |
| API typecheck | Passed |
| API test typecheck | Passed |
| API regression tests | 21 passed |
| Frontend regression tests | 12 passed |
| Isolated PostgreSQL schema test | 1 passed |
| Database-backed API tests | 17 passed |
| `git diff --check` | Passed |

These results reflect the reported local run, not a guarantee that every CI step or production deployment is passing.

### Outstanding Verification

The following items remain to be confirmed:

- GitHub Actions passes with the updated frontend test script.
- The frontend production build completes under the expected environment configuration.
- The backend production build completes successfully.
- Remaining repository and documentation checks pass.

## Production Builds

The frontend Vite configuration currently requires `PORT` to be set when loading its build configuration.

Run the frontend build with an explicit port:

```bash
PORT=22584 BASE_PATH=/ pnpm --filter @workspace/college-erp run build
```

Then build the backend:

```bash
pnpm --filter @workspace/api-server run build
```

Use the port and base path appropriate for the target environment. The example above is a local build configuration, not a production deployment recommendation.

Before publishing a release, review:

- [Deployment](docs/DEPLOYMENT.md)
- [Release Readiness](docs/RELEASE_READINESS.md)
- [Environment](docs/ENVIRONMENT.md)

A successful typecheck or test suite alone does not establish production readiness.

## User Roles and Access Control

The documented platform scope includes database-configured roles such as:

- Super administrator
- Administrator
- Secretary
- Faculty
- Student
- Parent
- Applicant
- Placement officer
- Recruiter
- Alumni

Actual available roles and their permissions depend on the configured database records and implemented authorization rules.

Protected API requests should be validated through the authentication and authorization layers. Domain-specific routes should also enforce the relevant ownership and linked-record restrictions.

Do not treat frontend navigation restrictions as a substitute for server-side authorization.

## Documentation

The repository includes the following technical and operational guides:

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | Application structure and design |
| [API](docs/API.md) | API contracts and endpoint guidance |
| [Database](docs/DATABASE.md) | Database schema and data-layer guidance |
| [Deployment](docs/DEPLOYMENT.md) | Deployment configuration and operations |
| [Environment](docs/ENVIRONMENT.md) | Environment variables and configuration |
| [Installation](docs/INSTALLATION.md) | Setup instructions |
| [Release Readiness](docs/RELEASE_READINESS.md) | Release verification checklist |
| [Documentation Index](docs/INDEX.md) | Documentation navigation |
| [Project Structure](docs/PROJECT_STRUCTURE.md) | Project layout |
| [Repository Structure](docs/STRUCTURE.md) | Repository organization |
| [Roadmap](ROADMAP.md) | Planned work and future direction |
| [Screenshots](docs/SCREENSHOTS.md) | Screenshot guidance and assets |
| [Changelog](CHANGELOG.md) | Recorded project changes |
| [Contributing](CONTRIBUTING.md) | Contribution process |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community standards |
| [Security Policy](SECURITY.md) | Security reporting guidance |
| [License](LICENSE) | Project license |

For a recommended reading path, start with this README, followed by the architecture, installation, environment, database, API, deployment, and release-readiness guides.

## Release and Maintenance Policy

Version 2 maintenance focuses on:

- Correctness and regression prevention.
- Security fixes and access-control reliability.
- Database and session integrity.
- Environment and build stability.
- Documentation accuracy.
- Targeted bug fixes that preserve existing behavior.

New product scope should be evaluated separately through Version 3 planning rather than introduced as part of routine Version 2 stabilization.

Release dates, General Availability status, and production-readiness claims should be published only after they have been confirmed by the release owner.

## Roadmap

Version 3 planning may consider:

- Deeper infrastructure and external-service integrations.
- Expanded observability and operational tooling.
- Additional automation.
- Further university operations and workflow improvements.

These are planning areas, not commitments to implement specific features. Version 2 maintenance and stabilization remain the immediate priority.

## Version Timeline

```text
Version 1
   |
Version 2 Beta
   |
Version 2 Release Candidates
   |
Version 2 Release
   |
Version 3 Planning
```

The timeline represents the documented product progression. Specific release dates and milestones should be maintained in the changelog and roadmap when confirmed.

## Screenshots

Screenshot guidance and any existing repository assets are documented in [docs/SCREENSHOTS.md](docs/SCREENSHOTS.md).

Screenshots should represent the actual application state and should be updated when meaningful UI changes are released.

## Support and Security

For setup and operational questions, consult:

- [Installation](docs/INSTALLATION.md)
- [Environment](docs/ENVIRONMENT.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Release Readiness](docs/RELEASE_READINESS.md)

Report security vulnerabilities privately using the process documented in [SECURITY.md](SECURITY.md). Avoid publishing credentials, private data, or exploitable vulnerability details in public issue reports.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

Contributions should preserve:

- Existing API contracts and business behavior.
- Database relationships and integrity.
- Authentication and authorization requirements.
- Ownership and linked-record restrictions.
- Workspace boundaries and dependency conventions.
- Existing tests and documentation expectations.

Prefer small, targeted changes with appropriate regression coverage.

## License

Enterprise College ERP Version 2 is distributed under the [MIT License](LICENSE).

See the repository's `LICENSE` file for the complete license text.
