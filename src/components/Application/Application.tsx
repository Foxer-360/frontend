import { LightweightComposer } from '@foxer360/composer';
import * as queries from '@source/services/graphql/queries';
import { ComponentsModule, PluginsModule } from '@source/services/modules';
import * as React from 'react';
import { Query } from 'react-apollo';

export interface IProperties {
  url?: string;
  // tslint:disable-next-line:no-any
  location?: any;
}

class Application extends React.Component<IProperties, {}> {

  public render() {
    const path = this.resolvePath(this.props.location.pathname);

    if (!path) {
      return null;
    }

    return (
      <Query
        query={queries.FRONTEND}
        variables={{ url: path }}
      >
        {({ loading, data, error }) => {
          if (loading) {
            return <span>Loading page...</span>;
          }

          if (error) {
            return <span>Some error occured...</span>;
          }

          if (!data.frontend) {
            return <span>Page not found...</span>;
          }

          if (!data.frontend.page.content) {
            return <span>Content of page was not found...</span>;
          }

          return (
            <LightweightComposer
              content={data.frontend.page.content}
              componentModule={ComponentsModule}
              pluginModule={PluginsModule}
            />
          );
        }}
      </Query>
    );
  }

  private resolvePath(path: string) {
    if (!path) {
      return null;
    }

    const regex = /[\.]{1}.{2,5}$/gi;
    if (regex.test(path)) {
      return null;
    }

    return path;
  }

}

export default Application;
