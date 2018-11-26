import gql from 'graphql-tag';

const LOCAL_SELECT_LANGUAGE = gql`
  mutation selectLanguage($language: Json!) {
    setLanguage(language: $language) @client
  }
`;

const LOCAL_SELECT_PAGE = gql`
  mutation selectPage($page: Json!) {
    setPage(page: $page) @client
  }
`;

const LOCAL_SELECT_PROJECT = gql`
  mutation selectProject($project: Json!) {
    setProject(project: $project) @client
  }
`;

const LOCAL_SELECT_WEBSITE = gql`
  mutation selectWebsite($website: Json!) {
    setWebsite(website: $website) @client
  }
`;

export {
  LOCAL_SELECT_LANGUAGE,
  LOCAL_SELECT_PAGE,
  LOCAL_SELECT_PROJECT,
  LOCAL_SELECT_WEBSITE
}
