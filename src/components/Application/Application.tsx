import * as queries from '@source/services/graphql/queries';
import * as React from 'react';
import { Query } from 'react-apollo';

const { Component } = React;

export interface IProperties {
  url?: string;
  // tslint:disable-next-line:no-any
  location?: any;
}

class Application extends Component<IProperties, {}> {

  public render() {
    const path = this.props.location.pathname;
    if (!path) {
      return <span>Bad Pathname</span>;
    }

    const regex = /[\.]{1}.{2,5}$/gi;
    if (regex.test(path)) {
      return <span>Some static file</span>;
    }

    return (
      <div>
        <Query
          query={queries.FRONTEND}
          variables={{ url: path }}
        >
          {({ loading, data, error }) => {
            if (loading) {
              return <span>Loading page...</span>;
            }

            if (error) {
              return <span>Page not found</span>;
            }

            return (
              <div>
                <span><strong>Website: </strong>{data.frontend.website.title}</span>
                <br />
                <span><strong>Language: </strong>{data.frontend.language.name}</span>
                <br />
                <span><strong>Page: </strong>{data.frontend.page.name}</span>
              </div>
            );
          }}
        </Query>
      </div>
    );
  }

}

export default Application;
