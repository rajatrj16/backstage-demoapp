import React from 'react';
import { Grid, Card, CardContent, CardActions, Button, Typography, makeStyles } from '@material-ui/core';
import { Header, Page, Content, ContentHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import ExtensionIcon from '@material-ui/icons/Extension';
import PluginCreator from '../PluginCreator/PluginCreator';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: theme.spacing(1),
  },
}));

interface Plugin {
  id: string;
  name: string;
  description: string;
  path: string;
  icon?: React.ReactNode;
}

const STATIC_PLUGINS: Plugin[] = [
  {
    id: 'demo-plugin',
    name: 'Demo Plugin',
    description: 'A sample Backstage plugin showcasing core concepts including routing, data fetching, and component composition.',
    path: '/demo-plugin',
    icon: <ExtensionIcon />,
  },
  {
    id: 'test-plug',
    name: 'Test Plugin',
    description: 'Another test plugin to demonstrate plugin integration.',
    path: '/docs',
    icon: <ExtensionIcon />,
  },
];

export const DemoAppHomePage = () => {
  const classes = useStyles();
  const [plugins, setPlugins] = React.useState<Plugin[]>(STATIC_PLUGINS);
  const configApi = useApi(configApiRef);
  const [query, setQuery] = React.useState('');

  const fetchPlugins = async () => {
    try {
      const backendBaseUrl = configApi.getString('backend.baseUrl');
      const resp = await fetch(`${backendBaseUrl}/api/plugin-create/plugins/list`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        setPlugins(data.map((p: any) => ({ 
          id: p.id, 
          name: p.name, 
          description: p.description || 'Plugin',
          path: p.path || `/${p.id}`,
          icon: <ExtensionIcon />
        })));
      }
    } catch (e) {
      console.warn('Failed to fetch plugins:', e);
      // Keep static plugins if API fails
    }
  };

  React.useEffect(() => {
    fetchPlugins();
  }, []);

  const filteredPlugins = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return plugins;
    return plugins.filter(p => {
      return (
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    });
  }, [plugins, query]);

  return (
    <Page themeId="home">
      <Header title="Welcome to Plugin's page" subtitle="Browse and access available plugins" />
      <Content>
        <ContentHeader title="Plugins Directory">
          <Typography variant="body2" color="textSecondary">
            Discover and access all available plugins in your Backstage instance
          </Typography>
        </ContentHeader>
        <div style={{ maxWidth: 640, marginBottom: 12 }}>
          <input
            placeholder="Search plugins (id, name, description)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <Grid container spacing={3} className={classes.root}>
          {filteredPlugins.map(plugin => (
            <Grid item xs={12} sm={6} md={4} key={plugin.id}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {plugin.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {plugin.description}
                  </Typography>
                </CardContent>
                <CardActions className={classes.cardActions}>
                  <Button
                    size="small"
                    color="primary"
                    href={plugin.path}
                  >
                    Open Plugin
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <div style={{ marginTop: 24 }}>
          <PluginCreator onCreated={fetchPlugins} />
        </div>
        {filteredPlugins.length === 0 && (
          <Typography variant="body1" color="textSecondary">
            No plugins available yet. Check back soon!
          </Typography>
        )}
      </Content>
    </Page>
  );
};
