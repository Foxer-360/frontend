import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';

import * as queries from './queries';

const cache = new InMemoryCache();

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql'
});

const client = new ApolloClient({
  cache,
  connectToDevTools: true,
  link: ApolloLink.from([
    httpLink
  ]),
  ssrForceFetchDelay: 100,
});

export {
  client,
  queries,
};
