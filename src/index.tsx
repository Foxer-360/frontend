import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route, RouteComponentProps } from 'react-router-dom';

import Application from '@source/components/Application';
import { client } from '@source/services/graphql';
import gql from 'graphql-tag';
// import registerServiceWorker from '@source/services/serviceWorker';

// import '@source/styles/main.scss';

const GET_CONTEXT = gql`
{
  pageData @client
  languageData @client
  websiteData @client
  languagesData @client
  navigationsData @client
  datasourceItems @client
  project @client
}
`;

const startTheShow = async () => {
  const context = await client.cache.readQuery({
    query: GET_CONTEXT
  }) as LooseObject;

  let ApplicationWithDefaultProps = (props: RouteComponentProps) => (<Application {...props} />);
  if (context && context.project) {
    const frontend = {
      language: context.languageData,
      languages: context.languagesData,
      page: context.pageData,
      website: context.websiteData,
      navigations: context.navigationsData,
      datasourceItems: context.datasourceItems,
      project: context.project
    };

    ApplicationWithDefaultProps = (props: RouteComponentProps) => (<Application {...props} frontend={frontend} />);
  }

  ReactDOM.hydrate(
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Route component={ApplicationWithDefaultProps} />
      </BrowserRouter>
    </ApolloProvider>,
    document.getElementById('root') as HTMLElement
  );
};

startTheShow();

// registerServiceWorker();
