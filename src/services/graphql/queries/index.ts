import gql from 'graphql-tag';

const FRONTEND = gql`
  query frontend($url: String!) {
    frontend( where: { url: $url } ) {
      website @connection(key: "website") {
        id
        title
      }
      language @connection(key: "language") {
        id
        code
        name
      }
      page @connection(key: "page") {
        id
        name
        content
      }
      navigations @connection(key: "navigations") {
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
      seo,

    }
  }
`;

export {
  FRONTEND
};
