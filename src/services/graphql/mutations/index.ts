import gql from 'graphql-tag';

const LOCAL_SELECT_LANGUAGE = gql`
  mutation selectLanguage($id: ID!) {
    setLanguage(id: $id) @client
  }
`;

const LOCAL_SELECT_PAGE = gql`
  mutation selectPage($id: ID!) {
    setPage(id: $id) @client
  }
`;

const LOCAL_SELECT_PROJECT = gql`
  mutation selectProject($id: ID!) {
    setProject(id: $id) @client
  }
`;

const LOCAL_SELECT_WEBSITE = gql`
  mutation selectWebsite($id: ID!) {
    setWebsite(id: $id) @client
  }
`;

const LOCAL_SELECT_PROJECT_WEBSITE = gql`
  mutation selectProjectWebsite($project: ID!, $website: ID!) {
    setProject(id: $project) @client
    setWebsite(id: $website) @client
  }
`;

export {
  LOCAL_SELECT_LANGUAGE,
  LOCAL_SELECT_PAGE,
  LOCAL_SELECT_PROJECT,
  LOCAL_SELECT_PROJECT_WEBSITE,
  LOCAL_SELECT_WEBSITE
}
