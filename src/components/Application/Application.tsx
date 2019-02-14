import { LightweightComposer } from '@source/composer';

import { queries, client } from '@source/services/graphql';
import { ComponentsModule, PluginsModule } from '@source/services/modules';
import * as React from 'react';

import { Query } from 'react-apollo';
import { Helmet } from 'react-helmet';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';

const GET_CONTEXT = gql`
{
  pageData @client
  languageData @client
  websiteData @client
  languagesData @client
  navigationsData @client
  datasourceItems @client
  project @client
}
`;

const GET_PAGES_URLS = gql`
  query pagesUrls($languageCode: String) {
    pagesUrls(where: { languageCode: $languageCode }) {
      id
      page
      url
      name
      description
    }
  }
`;

export interface IProperties {
  server?: string;
  // tslint:disable-next-line:no-any
  location?: any;
  // This is because of SSR
  frontend?: LooseObject;
}

export interface ISeoPluginData {
  title: string;
  description: string;
  themeColor: string;
  keywords: string;
  focusKeyword: string;
  defaultImage: string;
  facebook: {
    title: string;
    description: string;
    image: string;
  };
  twitter: {
    title: string;
    description: string;
    image: string;
  };
}

export interface IState {
  frontend?: LooseObject;
}

class Application extends React.Component<IProperties, IState> {

  constructor(props: IProperties) {
    super(props);
    let frontend = null;
    if (props.frontend) {
      frontend = { ...props.frontend };
    }
    this.state = {
      frontend,
    };
  }

  public componentDidMount() {
    const { location: { pathname } } = this.props;
    this.fetchFrontend(pathname);
  }

  public componentWillReceiveProps({ location: { pathname: newPath } }: LooseObject) {
    const { location: { pathname: oldPath } } = this.props;

    if (newPath !== oldPath) {
      window.scroll({
        behavior: 'smooth',
        top: 0,
      });
      this.fetchFrontend(newPath);
    }
  }

  fetchFrontend = (path) => {
    client.query({
      query: queries.FRONTEND,
      variables: { url: path }
    }).then(async ({ data: { frontend } }: LooseObject) => {
      await this.setContext(frontend);
      this.setState({ frontend });
    });
  }

  public render() {
    const path = this.resolvePath(this.props.location.pathname);

    if (!path) {
      return null;
    }
    const ComposedQuery = this.getComposedQuery();

    return (
      <ComposedQuery
        variables={{ url: path }}
      >
        {({
          getPagesUrls: {
            loading: getPagesUrlsLoading,
            error: getPagesUrlsError
          }
          }: LooseObject) => {

          if (!this.state.frontend) {
            return <span>Page not found...</span>;
          }

          if (!this.state.frontend.page.content) {
            return <span>Content of page was not found...</span>;
          }

          let fullUrl = path;
          if (this.props.server && this.props.server.length > 1) {
            fullUrl = `${this.props.server}${path}`;
          }

          const seo = this.formatSeoData(this.state.frontend.seo as ISeoPluginData);

          let favicon = `${process.env.REACT_APP_SERVER_URL}/favicon.ico`;

          if (this.state.frontend && this.state.frontend.project && this.state.frontend.project.components) {
            const components = this.state.frontend.project.components.split(',') as string[] | [] as string[];
            if (components.length > 0) {
              favicon = `${process.env.REACT_APP_SERVER_URL}/assets/${components[0]}/favicon.png`;
            }
          }

          const styles = ComponentsModule.getStyles();

          return (
            <>
              <Helmet>
                <meta name="description" content={seo.description} />
                <meta name="keywords" content={seo.keywords} />
                <meta name="theme-color" content={seo.themeColor} />
                <title>{seo.title || this.state.frontend.page.name}</title>

                {/* Styles and favicon selected per project */}
                {styles.map((style: string) => (
                  <link rel="stylesheet" key={style} href={`${process.env.REACT_APP_SERVER_URL}${style}`} />
                ))}
                <link rel="shortcut icon" type="image/png" href={favicon} />

                {/* Facebook */}
                <meta property="og:url" content={fullUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={seo.facebook.title} />
                <meta property="og:description" content={seo.facebook.description} />
                <meta property="og:image" content={seo.facebook.image || seo.defaultImage} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seo.twitter.title} />
                <meta name="twitter:description" content={seo.twitter.description} />
                <meta name="twitter:image" content={seo.twitter.image || seo.defaultImage} />
              </Helmet>

              <LightweightComposer
                content={this.state.frontend.page.content}
                componentModule={ComponentsModule}
                pluginModule={PluginsModule}
                plugins={['navigations', 'languages']}
                client={client}
              />
            </>
          );
        }}
      </ComposedQuery>
    );
  }

  private getComposedQuery = () => adopt({
    getContext: ({ render }) => (
      <Query query={GET_CONTEXT} >
        {({ data }) => render(data)}
      </Query>
    ),
    getPagesUrls: ({ render, getContext: { language }, getContext }) => {

      if (!language) { return render({}); }

      return(
        <Query query={GET_PAGES_URLS} variables={{ languageCode: language.code }}>
          {(data) => {
            return render(data);
          }}
        </Query>
      );
    }
  })

  private setContext = async (frontend) => {

    if (!frontend) { return; }
    const {
      language: languageData,
      languages,
      page: pageData,
      website: websiteData,
      navigations: navigationsData,
      datasourceItems,
      project
    } = frontend;
    const query = gql`
      query {
        languageData,
        languagesData,
        pageData,
        websiteData,
        navigationsData,
        datasourceItems,
        project
      }
    `;
    await client.writeQuery({
      query,
      data: {
        languageData,
        languagesData: languages,
        pageData,
        websiteData,
        navigationsData,
        datasourceItems,
        project
      },
    });
  }

  private formatSeoData(seo: ISeoPluginData): ISeoPluginData {
    return {
      defaultImage: seo && seo.defaultImage || '',
      description: seo && seo.description || '',
      facebook: {
        description: seo && seo.facebook && seo.facebook.description || '',
        image: seo && seo.facebook && seo.facebook.image || '',
        title: seo && seo.facebook && seo.facebook.title || ''
      },
      focusKeyword: seo && seo.focusKeyword || '',
      keywords: seo && seo.keywords || '',
      themeColor: seo && seo.themeColor || '',
      title: seo && seo.title || '',
      twitter: {
        description: seo && seo.twitter && seo.twitter.description || '',
        image: seo && seo.twitter && seo.twitter.image || '',
        title: seo && seo.twitter && seo.twitter.title || '',
      }
    };
  }

  private resolvePath(path: string) {
    if (!path) {
      return null;
    }

    const regex = /[\.]{1}.{2,5}$/gi;
    if (regex.test(path)) {
      return null;
    }

    return path;
  }
}

export default Application;
