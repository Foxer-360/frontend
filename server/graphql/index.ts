import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import { queries } from '../../src/services/graphql';
import gql from 'graphql-tag';
import { withClientState } from 'apollo-link-state';

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

const stateLink = withClientState({
  cache,
  defaults: {
    // websiteData: {},
    // languages: {},
    // languageData: {},
    // pageData: {},
    // navigationsData: {},
    // project: {}
  },
  resolvers: {
    Mutation: {
    }
  }
});

const httpLink = createHttpLink({
  // tslint:disable-next-line:no-any
  // fetch: fetch as any,
  uri: graphqlServer,
});

const client = new ApolloClient({
  cache,
  connectToDevTools: false,
  link: ApolloLink.from([
    stateLink,
    httpLink
  ]),
  ssrMode: true,
});

// Loader for all neccessary data to properly render SSR
const setContext = async (frontend: LooseObject) => {
  if (!frontend) {
    return;
  }

  const {
    language: languageData,
    languages,
    page: pageData,
    website: websiteData,
    navigations: navigationsData,
    datasourceItems,
    project
  } = frontend;

  const query = gql`
    query {
      languageData,
      languagesData,
      pageData,
      websiteData,
      navigationsData,
      datasourceItems,
      project
    }
  `;

  return client.writeQuery({
    query,
    data: {
      languageData,
      languagesData: languages,
      pageData,
      websiteData,
      navigationsData,
      datasourceItems,
      project
    }
  });
};

const fetchPagesUrls = async (languageCode: string) => {
  const query = gql`
    query pagesUrls($languageCode: String) {
      pagesUrls(where: { languageCode: $languageCode }) {
        id
        page
        url
        name
        description
      }
    }
  `;

  return client.query({
    query,
    variables: { languageCode }
  });
};

const fetchFrontend = async (path: string) => {
  const res = await client.query({
    query: queries.FRONTEND,
    variables: { url: path }
  }).then(({ data: { frontend } }: LooseObject) => {
    if (!frontend || frontend === null) {
      return Promise.all([
        Promise.resolve(null)
      ]);
    }

    const { language } = frontend;
    return Promise.all([
      Promise.resolve(frontend),
      setContext(frontend),
      fetchPagesUrls(language.code)
    ]);
  }).then(([frontend]) => {
    return Promise.resolve(frontend);
  });

  return res;
};

export {
  client,
  fetchFrontend,
  queries
};
