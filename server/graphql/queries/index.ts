import gql from 'graphql-tag';

// export const GET_PAGE_BY_URL = gql`
//   query getPageByUrl($url: String!) {
//     pageByUrl( where: { url: $url } ) {
//       id
//     }
//   }
// `;

export const GET_PAGE_BY_URL = gql`
  query getPageByUrl($url: String!) {
    pages {
      id
    }
  }
`;

export const FRONTEND = gql`
  query frontend($url: String!) {
    frontend(
      where: {
        url: $url
      }
    ) {
      website: {
        title
      }
      language: {
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
