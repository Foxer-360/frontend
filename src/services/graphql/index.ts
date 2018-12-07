import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { withClientState } from 'apollo-link-state';

import * as queries from './queries';

let graphqlServer = process.env.REACT_APP_GRAPHQL_SERVER;
if (!graphqlServer) {
  // tslint:disable-next-line:no-console
  console.log(`Server for GraphQL is not set. Please setup .env file correctly...`);
  graphqlServer = 'http://localhost:8000/graphql'; // Something like default value
}

const cache = new InMemoryCache();

const stateLink = withClientState({
  cache,
  defaults: {
    websiteData: null,
    languages: null,
    languageData: null,
    pageData: null,
    navigationsData: null
  },
  resolvers: {
    Mutation: {
    }
  }
});

const httpLink = new BatchHttpLink({
  uri: graphqlServer,
});

const client = new ApolloClient({
  cache,
  connectToDevTools: true,
  link: ApolloLink.from([
    stateLink,
    httpLink
  ]),
  ssrForceFetchDelay: 100,
});

export {
  client,
  queries
};
