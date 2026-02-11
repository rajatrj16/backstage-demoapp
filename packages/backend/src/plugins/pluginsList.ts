import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';

export async function createPluginsListRouter(): Promise<Router> {
  const router = Router();

  router.get('/list', async (_req, res) => {
    try {
      const pluginsDir = path.resolve(__dirname, '../../../plugins');
      
      if (!fs.existsSync(pluginsDir)) {
        res.json([]);
        return;
      }

      const pluginDirs = await fs.readdir(pluginsDir);
      const plugins: any[] = [];

      for (const dir of pluginDirs) {
        const packageJsonPath = path.join(pluginsDir, dir, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = await fs.readJson(packageJsonPath);
            const backstageConfig = packageJson.backstage || {};
            const pluginId = backstageConfig.pluginId || dir;

            plugins.push({
              id: pluginId,
              name: packageJson.name || dir,
              description: packageJson.description || `Plugin: ${dir}`,
              path: `/${pluginId}`,
            });
          } catch (e) {
            console.warn(`Failed to read package.json for ${dir}:`, e);
          }
        }
      }

      res.json(plugins);
    } catch (error) {
      console.error('Error listing plugins:', error);
      res.status(500).json({ error: 'Failed to list plugins' });
    }
  });

  return router;
}
