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
      seo
    }
  }
`;

export {
  FRONTEND
};
