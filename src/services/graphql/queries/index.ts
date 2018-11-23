import gql from 'graphql-tag';

const FRONTEND = gql`
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
