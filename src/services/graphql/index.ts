import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { withClientState } from 'apollo-link-state';
import { setContext } from 'apollo-link-context';

import * as queries from './queries';

let graphqlServer = process.env.REACT_APP_GRAPHQL_SERVER;
if (!graphqlServer) {
  // tslint:disable-next-line:no-console
  console.log(`Server for GraphQL is not set. Please setup .env file correctly...`);
  graphqlServer = 'http://localhost:8000/graphql'; // Something like default value
}

const cache = new InMemoryCache();

if (window && (window as LooseObject).__APOLLO_STATE__) {
  cache.restore((window as LooseObject).__APOLLO_STATE__);
}

const stateLink = withClientState({
  cache,
  defaults: {
    // websiteData: null,
    // languages: null,
    // languageData: null,
    // pageData: null,
    // navigationsData: null,
    // project: null
  },
  resolvers: {
    Mutation: {
    }
  }
});

const httpLink = new HttpLink({
  uri: graphqlServer,
});

const originLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'x-origin': process.env.REACT_APP_ORIGIN,
    }
  }));

  return forward(operation);
});

const client = new ApolloClient({
  cache,
  connectToDevTools: true,
  link: ApolloLink.from([
    stateLink,
    ...process.env.REACT_APP_ORIGIN ? [originLink] : [],
    httpLink,
  ]),
  ssrForceFetchDelay: 100,
});

export {
  client,
  queries
};
