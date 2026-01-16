# @repo/eslint-config

Shared ESLint configurations for the monorepo.

## Configurations

- **base.js** — Base ESLint rules for all projects
- **react-internal.js** — React-specific rules for internal apps
- **next.js** — Next.js-specific rules (if needed)

## Usage

Import in your `eslint.config.js`:

```js
import baseConfig from '@repo/eslint-config/base';

export default [...baseConfig];
```
