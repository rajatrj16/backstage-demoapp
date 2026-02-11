import { createBackendModule } from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import {
  scaffolderActionsExtensionPoint,
  createTemplateAction,
} from '@backstage/plugin-scaffolder-node';
import { stringifyEntityRef } from '@backstage/catalog-model';
import path from 'path';

export default createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'register-file-location',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        catalog: catalogServiceRef,
      },
      async init({ scaffolder, catalog }) {
        scaffolder.addActions(
          createTemplateAction({
            id: 'catalog:register:file',
            description:
              'Registers entities from a local catalog descriptor file in the workspace into the software catalog using a file location.',
            schema: {
              input: z =>
                z.object({
                  path: z.string({
                    description:
                      'A path to the catalog-info.yaml file. May be absolute, or relative to the scaffolder workspace.',
                  }),
                  optional: z
                    .boolean({
                      description:
                        'Permit the registered location to optionally exist. Default: false',
                    })
                    .optional(),
                }),
              output: z =>
                z.object({
                  entityRef: z.string().optional(),
                  locationTarget: z.string(),
                }),
            },
            async handler(ctx) {
              const rawPath = ctx.input.path;
              const locationTarget = path.isAbsolute(rawPath)
                ? rawPath
                : path.resolve(ctx.workspacePath, rawPath);

              ctx.logger.info(
                `Registering file location ${locationTarget} in the catalog`,
              );

              try {
                await catalog.addLocation(
                  {
                    type: 'file',
                    target: locationTarget,
                  },
                  { credentials: await ctx.getInitiatorCredentials() },
                );
              } catch (e) {
                if (!ctx.input.optional) {
                  throw e;
                }
              }

              try {
                const result = await catalog.addLocation(
                  {
                    dryRun: true,
                    type: 'file',
                    target: locationTarget,
                  },
                  { credentials: await ctx.getInitiatorCredentials() },
                );

                if (result.entities?.length) {
                  const entity =
                    result.entities.find(
                      e =>
                        !e.metadata.name.startsWith('generated-') &&
                        e.kind === 'Component',
                    ) ??
                    result.entities.find(
                      e => !e.metadata.name.startsWith('generated-'),
                    ) ??
                    result.entities[0];

                  if (entity) {
                    ctx.output('entityRef', stringifyEntityRef(entity));
                  }
                }
              } catch (e) {
                if (!ctx.input.optional) {
                  throw e;
                }
              }

              ctx.output('locationTarget', locationTarget);
            },
          }),
        );
      },
    });
  },
});
