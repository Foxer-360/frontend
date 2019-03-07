import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import Application from '@source/components/Application';
import { client } from '@source/services/graphql';

// import '@source/styles/main.scss';

ReactDOM.hydrate(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Route component={Application} />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('root') as HTMLElement
);
