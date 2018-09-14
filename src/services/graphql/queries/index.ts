import gql from 'graphql-tag';

export const FRONTEND = gql`
  query frontend($url: String!) {
    frontend( where: { url: $url } ) {
      website {
        title
      }
      language {
        code
        name
      }
      page {
        name
        content
      }
    }
  }
`;
