import gql from 'graphql-tag';

export const FRONTEND = gql`
  query frontend($url: String!) {
    frontend( where: { url: $url } ) {
      website {
        id
        title
      }
      language {
        id
        code
        name
      }
      page {
        name
        content
      }
      seo
    }
  }
`;
