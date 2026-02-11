import { createBackendModule } from '@backstage/backend-plugin-api';
import { catalogLocationsExtensionPoint } from '@backstage/plugin-catalog-node/alpha';

export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'allow-file-location-types',
  register({ registerInit }) {
    registerInit({
      deps: {
        catalogLocations: catalogLocationsExtensionPoint,
      },
      async init({ catalogLocations }) {
        catalogLocations.setAllowedLocationTypes(['url', 'file']);
      },
    });
  },
});
