import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load config from .env file
config();

let graphqlServer = process.env.REACT_APP_GRAPHQL_SERVER;
if (!process.env.REACT_APP_GRAPHQL_SERVER) {
  // tslint:disable-next-line:no-console
  console.log(`Server for GraphQL is not set. Please setup .env file correctly...`);
  // process.exit(1);
  graphqlServer = 'http://localhost:8000/graphql';
}

const cache = new InMemoryCache();

const httpLink = createHttpLink({
  // tslint:disable-next-line:no-any
  fetch: fetch as any,
  uri: graphqlServer,
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
};
