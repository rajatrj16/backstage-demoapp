import { Typography, Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { ExampleFetchComponent } from '../ExampleFetchComponent';

export const ExampleComponent = () => (
  <Page themeId="tool">
    <Header title="This is a lovely demo-plugin!" subtitle="Testing this one locally">
      <HeaderLabel label="Owner" value="Rajat" />
      <HeaderLabel label="Lifecycle" value="demo" />
    </Header>
    <Content>
      <ContentHeader title="Hey Plugin!">
        <SupportButton>Hey! This is a test plugin here.</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard title="Information card">
            <Typography variant="body1">
              All content should be wrapped in a card like this. Any and All.
            </Typography>
          </InfoCard>
        </Grid>
        <Grid item>
          <ExampleFetchComponent />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
