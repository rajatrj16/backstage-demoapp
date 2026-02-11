import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function findRepoRoot(startDir: string): Promise<string> {
  let current = startDir;
  for (let i = 0; i < 20; i++) {
    const yarnLock = path.join(current, 'yarn.lock');
    const pkg = path.join(current, 'package.json');
    if ((await pathExists(yarnLock)) && (await pathExists(pkg))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return startDir;
}

export default createBackendPlugin({
  pluginId: 'plugin-create',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, httpRouter }) {
        const router = express.Router();

        httpRouter.addAuthPolicy({ path: '/', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/plugins/list', allow: 'unauthenticated' });

        // Mounted by Backstage at /api/plugin-create
        router.post('/', express.json(), (req, res) => {
          (async () => {
            const { name } = req.body || {};
            if (!name || typeof name !== 'string') {
              res.status(400).json({ message: 'name required' });
              return;
            }

            const pluginId = name.trim();
            if (!/^[a-z0-9][a-z0-9-]*$/.test(pluginId)) {
              res.status(400).json({
                message:
                  'invalid plugin name; use lowercase letters, numbers, and dashes (e.g. my-plugin)',
              });
              return;
            }

            try {
              const repoRoot = await findRepoRoot(process.cwd());
              logger.info(`Creating plugin '${pluginId}' using 'yarn new' in ${repoRoot}`);

              const cmd = 'yarn';
              const args = [
                'new',
                '--select',
                'frontend-plugin',
                '--option',
                `pluginId=${pluginId}`,
                '--option',
                'owner=',
              ];

              const child = spawn(cmd, args, { cwd: repoRoot, shell: true });

              let output = '';
              child.stdout.on('data', d => {
                output += d.toString();
              });
              child.stderr.on('data', d => {
                output += d.toString();
              });

              child.on('error', err => {
                logger.error('Failed to start yarn new', err);
                res.status(500).json({ message: 'failed to start yarn new', error: err?.message || String(err) });
              });

              child.on('close', code => {
                if (code === 0) {
                  res.json({ message: `Plugin ${pluginId} created`, id: pluginId, output });
                } else {
                  res.status(500).json({ message: `yarn new failed (code ${code})`, id: pluginId, output });
                }
              });
            } catch (err: any) {
              logger.error('Failed to create plugin', err);
              res.status(500).json({ message: 'failed to create plugin', error: err?.message || String(err) });
            }
          })();
        });

        // Simple plugin discovery endpoint: scans `plugins/`, `packages/`,
        // and external `../plugins-repo/` directories for packages and returns
        // basic metadata. This allows the frontend to render newly created plugins
        // automatically.
        router.get('/plugins/list', async (_req, res) => {
          const fs = await import('fs/promises');
          const path = await import('path');
          
          // Use process.cwd() which is the repo root when running from backstage-cli
          const repoRoot = await findRepoRoot(process.cwd());
          
          logger.info?.(`Scanning plugins from repo root: ${repoRoot}`);
          
          const candidates = [
            { dir: 'plugins', base: repoRoot },
            { dir: 'packages', base: repoRoot },
            { dir: '../plugins-repo', base: repoRoot },
          ];
          const results: Array<{ id: string; name: string; description?: string; path: string }> = [];

          for (const { dir, base } of candidates) {
            try {
              const full = path.resolve(base, dir);
              logger.info?.(`Scanning plugins directory: ${full}`);
              
              const entries = await fs.readdir(full, { withFileTypes: true });
              for (const e of entries) {
                if (!e.isDirectory() || e.name.startsWith('.')) continue;
                const pkgPath = path.join(full, e.name, 'package.json');
                try {
                  const data = await fs.readFile(pkgPath, 'utf8');
                  const pj = JSON.parse(data);
                  const backstage = pj?.backstage;
                  const role = backstage?.role as string | undefined;
                  if (role !== 'frontend-plugin' && role !== 'frontend-plugin-module') {
                    continue;
                  }

                  const id = (backstage?.pluginId as string) ?? e.name;
                  const name = (pj?.name as string) ?? e.name;
                  const description = pj?.description as string | undefined;

                  results.push({
                    id,
                    name,
                    description,
                    path: `/${id}`,
                  });
                  logger.info?.(`Found frontend plugin: ${id} at ${pkgPath}`);
                } catch (err) {
                  // ignore missing or invalid package.json
                }
              }
            } catch (err) {
              // ignore missing directories
              logger.debug?.(`Could not scan ${path.resolve(base, dir)}: ${err}`);
            }
          }
          logger.info?.(`Returning ${results.length} plugins`);
          res.json(results);
        });

        httpRouter.use(router);
      }
    });
  }
});
