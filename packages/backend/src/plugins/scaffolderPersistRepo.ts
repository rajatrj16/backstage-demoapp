import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  scaffolderActionsExtensionPoint,
  createTemplateAction,
} from '@backstage/plugin-scaffolder-node';
import fs from 'fs/promises';
import path from 'path';

export default createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'persist-generated-repo',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(
          createTemplateAction({
            id: 'repo:persist:local',
            description:
              'Copies generated repository content from the scaffolder workspace to a stable local path.',
            schema: {
              input: z =>
                z.object({
                  sourcePath: z.string({
                    description:
                      'Path to copy from. May be absolute or relative to the scaffolder workspace.',
                  }),
                  targetPath: z.string({
                    description:
                      'Target path to copy into. May be absolute or relative to APP_CONFIG_DIR. The directory will be created if missing.',
                  }),
                }),
              output: z =>
                z.object({
                  targetPath: z.string(),
                }),
            },
            async handler(ctx) {
              const sourcePath = path.isAbsolute(ctx.input.sourcePath)
                ? ctx.input.sourcePath
                : path.resolve(ctx.workspacePath, ctx.input.sourcePath);

              const baseDir =
                process.env.INIT_CWD ?? process.env.APP_CONFIG_DIR ?? process.cwd();
              const targetPath = path.isAbsolute(ctx.input.targetPath)
                ? ctx.input.targetPath
                : path.resolve(baseDir, ctx.input.targetPath);

              ctx.logger.info(`Persisting repo from ${sourcePath} to ${targetPath}`);

              await fs.mkdir(path.dirname(targetPath), { recursive: true });
              await fs.rm(targetPath, { recursive: true, force: true });
              await fs.cp(sourcePath, targetPath, { recursive: true });

              ctx.output('targetPath', targetPath);
            },
          }),
        );
      },
    });
  },
});
