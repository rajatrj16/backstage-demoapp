import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const demoPluginPlugin = createPlugin({
  id: 'demo-plugin',
  routes: {
    root: rootRouteRef,
  },
});

export const DemoPluginPage = demoPluginPlugin.provide(
  createRoutableExtension({
    name: 'DemoPluginPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
