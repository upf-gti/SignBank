# SignBank UPD (Frontend)

Frontend application for the SignBank project built with Quasar Framework (Vue.js-based).

## Installation

Install the dependencies:

```bash
yarn
# or
npm install
```

## Development

### Start the app in development mode
Features hot-code reloading, error reporting, etc.

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

## Production Build

```bash
quasar build
```

## Docker

The frontend application can be containerized using:
- For local development: `Dockerfile.local`
- For production: `Dockerfile.prod`

These are typically used through the root docker-compose configuration.

## Configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js) for customizing the Quasar configuration.

## Project Structure

- `src/` - Source code
  - `components/` - Reusable Vue components
  - `pages/` - Application pages
  - `boot/` - Initialization scripts
  - `css/` - Global styles
  - `layouts/` - Page layouts
- `public/` - Static assets
