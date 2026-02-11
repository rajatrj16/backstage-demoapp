# Repo Scaffolder Example (Local)

This directory contains a Backstage Scaffolder template that generates a microservice repository locally using the upstream `scaffolding-templates` cookiecutter templates, then registers the generated component in the Backstage catalog.

## What this example does

- Fetches the upstream cookiecutter repo.
- Generates a repository under `./generated/<repoName>` inside the scaffolder task workspace.
- Adds a `catalog-info.yaml` into the generated repo.
- Persists the generated repo to a stable location on disk (project repo root `generated/` directory).
- Registers the generated component in the Backstage catalog using the persisted `catalog-info.yaml`.

## Files

- `template.yaml`
  - The Backstage Scaffolder template.
- `catalog-info.yaml`
  - Catalog metadata for this template itself.
- `content/catalog-info.yaml`
  - Template file that gets copied into each generated repository.

## Prerequisites

- Node.js / Yarn set up for your Backstage app.
- Backstage app running locally.

## Backstage configuration

This repo is set up to run the template from a local source.

### 1) Enable the local template source

In `app-config.yaml`:

- `scaffolder.sources` includes `examples/scaffolding-repo-template`
- `catalog.locations` includes:
  - `../../examples/scaffolding-repo-template/template.yaml`

### 2) Scaffolder working directory

This project uses:

- `backend.workingDirectory: ${APP_CONFIG_DIR}`

This ensures the scaffolder uses the directory of your config file (typically the repo root) rather than a machine-specific absolute path.

### 3) Allow local file reads

In `app-config.yaml` the backend `reading.allow` list allows reading from the project directory:

- `${APP_CONFIG_DIR}/`

This is required for local file operations in scaffolder actions.

## Local persistence action

This example uses a custom scaffolder action:

- `repo:persist:local`

Implementation lives at:

- `packages/backend/src/plugins/scaffolderPersistRepo.ts`

Behavior:

- `sourcePath` may be absolute or relative to the scaffolder task workspace.
- `targetPath` may be:
  - absolute, or
  - relative (resolved to an absolute path under the project root)

Resolution rules for relative `targetPath`:

- Uses `INIT_CWD` (Yarn sets this to the directory you ran `yarn start` from; typically the repo root)
- Falls back to `APP_CONFIG_DIR`
- Falls back to `process.cwd()`

As a result, the template can use:

- `targetPath: ./generated/${{ parameters.git_repo_name }}`

…and the persisted repo will end up at:

- `<repoRoot>/generated/<repoName>`

## Running the example

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Start Backstage:

   ```bash
   yarn start
   ```

3. In the Backstage UI:

   - Go to `Create...`
   - Choose the `scaffolding-repo-template` (this template)
   - Fill in `git_repo_name` and the other parameters
   - Run the task

4. After the task completes:

   - A repo should exist at `generated/<repoName>` in the project root.
   - The component should be registered in the catalog.

## Notes

- This is a local-development oriented template/action setup.
- For production usage, you typically want to:
  - publish the generated repo to GitHub/GitLab instead of persisting locally
  - use `publish:*` scaffolder actions
  - avoid broad local filesystem read permissions
