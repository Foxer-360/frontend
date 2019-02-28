import gql from 'graphql-tag';

const FRONTEND = gql`
  query frontend($url: String!) {
    frontend: frontend( where: { url: $url } ) {
      website @connection(key: "websiteData") {
        id
        title
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
