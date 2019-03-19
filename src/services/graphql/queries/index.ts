import gql from 'graphql-tag';

const FRONTEND = gql`
  query frontend($url: String!, $origin: String) {
    frontend: frontend( where: { url: $url, origin: $origin } ) {
      website @connection(key: "websiteData") {
        id
        title
        urlMask
      }
      language @connection(key: "languageData") {
        id
        code
        name
      }
      page @connection(key: "pageData") {
        id
        name
        content
      }
      navigations @connection(key: "navigationsData") {
        id
        name
        nodes {
          id
          page
          title
          link
          order
          parent
          __typename
        }
        __typename
      },
      languages @connection(key: "languages") {
        id
        code
        name
      },
      datasourceItems @connection(key: "datasourceItems") {
        id
        content
        slug
        datasource {
          type
        }
      },
      seo,
      project {
        id
        components
      }
    }
  }
`;

export {
  FRONTEND
};
