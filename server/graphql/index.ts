import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';

import * as queries from './queries';

const cache = new InMemoryCache();

const httpLink = createHttpLink({
  // tslint:disable-next-line:no-any
  fetch: fetch as any,
  uri: 'http://localhost:8000/graphql',
});

const client = new ApolloClient({
  cache,
  connectToDevTools: false,
  link: ApolloLink.from([
    httpLink
  ]),
  ssrMode: true,
});

export {
  client,
  queries,
};
