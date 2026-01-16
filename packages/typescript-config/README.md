# @repo/typescript-config

Shared TypeScript configurations for the monorepo.

## Configurations

- **base.json** — Base TypeScript config for all projects
- **react-library.json** — Config for React libraries
- **nextjs.json** — Config for Next.js projects (if needed)

## Usage

Extend in your `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    // Project-specific options
  }
}
```
