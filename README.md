# Forge Automation Actions

![Thumbnail](thumbnail.png)

Code example for the Forge Dev Dev live coding session. Demonstrates how to build custom Jira automation actions with Custom UI configuration forms.

Each action has its own Custom UI workspace for the configuration form and a shared backend in `src/actions/`.

## Actions

### Get Project Lead

Returns the email address of a project's lead.

- **Inputs:** Project ID or Key
- **Outputs:** `email` (string)

### Get Project Role Members

Returns the email addresses of all members in a given project role.

- **Inputs:** Project ID or Key, Role Name (e.g. Member, Administrator, Viewer)
- **Outputs:** List of `{ email }` objects

## Project Structure

```
src/
  actions/index.js    # Backend action handlers
  resolvers/index.js  # Forge resolver definitions
  index.js            # Entry point (exports)
static/
  project-lead/       # Custom UI for Get Project Lead
  project-roles/      # Custom UI for Get Project Role Members
manifest.yml          # Forge app manifest
```

## Setup

```sh
npm install
```

This installs dependencies for the root project and all workspaces (`static/project-lead`, `static/project-roles`) via npm workspaces.

The `manifest.yml` references `FORGE_APP_ID` as an environment variable. Export it before running any `forge` commands:

```sh
export FORGE_APP_ID=12345678-1234-1234-1234-123456789012
```

## Development

Start all Custom UI dev servers:

```sh
npm run dev
```

Then run the Forge tunnel in a separate terminal:

```sh
forge tunnel
```

## Build and Deploy

```sh
npm run build
forge deploy
```

To install on a new Atlassian site:

```sh
forge install
```

Once installed, subsequent `forge deploy` commands push updates without reinstalling. If you change permission scopes in `manifest.yml`, run `forge install --upgrade` to apply them.
