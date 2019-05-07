import { LightweightComposer } from '@source/composer';
import { queries, client } from '@source/services/graphql';
import { ComponentsModule, PluginsModule } from '@source/services/modules';
import * as React from 'react';

import { Query } from 'react-apollo';
import { Helmet } from 'react-helmet';
import gql from 'graphql-tag';
import { addContextInformationsFromDatasourceItems } from '@source/composer/utils';
import TagManager from 'react-gtm-module';

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

const GET_ALL_PAGES = gql`
  query localizedPages($languageId: ID! $projectId: ID!) {
    pages(where: { website: { project: { id: $projectId } } }) {
      id
      type {
        id
        name
      }
      tags {
        id
        name
      }
      plugin {
        plugin
        content
      }
      translations(where: {
        language: { id: $languageId }
      }) {
        id
        name
        createdAt
        content
        annotations {
          key
          value
        }
        language {
          id
          code
        }
      }
    }
  }
`;

const GET_PAGES_URLS = gql`
  query pagesUrls($language: ID!, $websiteId: ID!) {
    pagesUrls(where: { language: $language, websiteId: $websiteId }) {
      id
      page
      url
      name
      description
    }
  }
`;

const COMPONENT_TEMPLATE_QUERY = gql`
query componentTemplates(
  $websiteId: ID!,
  $languageId: ID!
){
  componentTemplates(where: {
    website: { id: $websiteId },
    language: { id: $languageId }
  }) {
    id,
    name,
    type,
    content,
  }
}
`;

export interface IProperties {
  server?: string;
  // tslint:disable-next-line:no-any
  location?: any;
  // This is because of SSR
  frontend?: LooseObject;
  content?: LooseObject;
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
  gtmIds: string[]; // already initialized Google Tag Manager codes
}

class Application extends React.Component<IProperties, IState> {

  // tslint:disable-next-line:no-any
  content: any;
  // tslint:disable-next-line:no-any
  project: any;
  // tslint:disable-next-line:no-any
  pageName: any;
  // tslint:disable-next-line:no-any
  seo: any;

  constructor(props: IProperties) {
    super(props);
    let frontend = null;
    if (props.frontend) {
      frontend = { ...props.frontend };
    }

    this.state = {
      gtmIds: []
    };

    this.content = frontend && frontend.page.content;
    this.project = frontend && frontend.project;
    this.pageName = frontend && frontend.page.name;
    this.seo = frontend && frontend.seo;

    this.initGTM = this.initGTM.bind(this);
  }

  componentDidMount() {
    const { location: { pathname } } = this.props;

    this.fetchFrontend(pathname);
  }

  fetchFrontend = async (path) => {
    const { data }: LooseObject = await client.query({
      query: GET_CONTEXT
    });
    let frontend = null;

    // In case that context is available, try to look for page in cache.
    if (data && data.languageData && data.languageData.id && data.project && data.project.id && data.websiteData && data.websiteData.id) {
      const { data: { pagesUrls } }: LooseObject = await client.query({
        query: GET_PAGES_URLS,
        variables: { language: data.languageData.id, websiteId: data.websiteData.id }
      });
      if (pagesUrls) {
        const pUrl = pagesUrls.find(p => p.url === path);

        if (pUrl) {
          const { data: { pages } }: LooseObject = await client.query({
            query: GET_ALL_PAGES,
            variables: {
              languageId: data.languageData.id,
              projectId: data.project.id,
            }
          });
          if (pages) {
            const localizedPage = pages.find(page => page.id === pUrl.id.split('/')[0]);
            if (localizedPage) {
              this.content = localizedPage.translations[0].content;
              this.seo = localizedPage.plugin && localizedPage.plugin === 'seo' ? localizedPage.plugin.content : null;
              this.project = data.project;
              this.pageName = localizedPage.translations[0].name;

              client.writeQuery({
                query: gql`
                query {
                  pageData,
                }`,
                data: {
                  pageData: localizedPage.translations[0],
                }
              });

              if (data.websiteData.googleTrackingPixel) {
                this.initGTM(data.websiteData.googleTrackingPixel);
              }

              this.forceUpdate();
              return;
            }
          }
        }
      }
    }

    // In other cases fetch frontend
    let origin = null;
    if (window) {
      // Simulate SSR origin variable into Query
      origin = window.location.host;
      const originRegex = /.*localhost.*/gi;
      if (origin && originRegex.test(origin)) {
        // Override localhost with defined origin in .env
        if (process.env.REACT_APP_ORIGIN) {
          origin = process.env.REACT_APP_ORIGIN;
        }
      }
    }

    if (origin) {
      const httpRegex = /^https?.*/gi;
      if (!httpRegex.test(origin)) {
        origin = `http://${origin}`;
      }
    }

    client.writeData({ data: { origin: { origin: origin, url: path } } });
    console.log(`%cOrigin in frontend query: %c${origin}`, 'color: orange', 'color: orange; font-weight: bold');

    const { data: { frontend: frontendFromQuery } }: LooseObject = await client.query({
      query: queries.FRONTEND,
      variables: { url: path, origin }
    });
    frontend = frontendFromQuery;

    return this.setContext(frontend, data);
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

  public render() {
    const path = this.resolvePath(this.props.location.pathname);

    if (!path) {
      return null;
    }

    if (
      !(this.content) ||
      !this.project
    ) {
      return <span>Page not found...</span>;
    }

    const content = this.content;

    if (!content) {
      return <span>Content of page was not found...</span>;
    }

    let fullUrl = path;
    if (this.props.server && this.props.server.length > 1) {
      fullUrl = `${this.props.server}${path}`;
    }

    let seo = this.formatSeoData(this.seo as ISeoPluginData);

    let favicon = `${process.env.REACT_APP_SERVER_URL}/favicon.ico`;

    if (this.project && this.project.components) {
      const components = this.project.components.split(',') as string[] | [] as string[];
      if (components.length > 0) {
        favicon = `${process.env.REACT_APP_SERVER_URL}/assets/${components[0]}/favicon.png`;
      }
    }

    return (
      <>
         <Query query={GET_CONTEXT}>
         {({ error, loading, data }) => {

            if (error) { return 'Error...'; }
            if (loading) { return 'Loading...'; }

            const { datasourceItems } = data;

            seo = addContextInformationsFromDatasourceItems(datasourceItems || [], seo);
            const styles = ComponentsModule.getStyles();
            return (
              <>
                <Helmet>
                  <meta name="description" content={seo.description} />
                  <meta name="keywords" content={seo.keywords} />
                  <meta name="theme-color" content={seo.themeColor} />
                  <title>{seo.title || this.pageName}</title>

                  {/* Styles and favicon selected per project */}
                  {styles.map((style: string) => (
                    <link rel="stylesheet" key={style} href={`${style}`} />
                  ))}
                  <link rel="shortcut icon" type="image/png" href={favicon} />

                  {/* Facebook
                  <meta property="og:url" content={fullUrl} />
                  */}
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

               <Query query={COMPONENT_TEMPLATE_QUERY} variables={{ websiteId: data.websiteData.id, languageId: data.languageData.id }}>
                {({ error: cError, loading: cLoading, data: cData }) => {
                  if (cError || cLoading) {
                    return null;
                  }
                  let templates = [];
                  if (cData && cData.componentTemplates) {
                    templates = cData.componentTemplates;
                  }

                  return (
                    <LightweightComposer
                      content={content}
                      componentModule={ComponentsModule}
                      pluginModule={PluginsModule}
                      plugins={['navigations', 'languages']}
                      client={client}
                      componentTemplates={templates}
                    />
                  );
                }}
              </Query>
            </>
            );
         }}</Query>
      </>
    );
  }
  /**
   * Setting context to be provided through the app + initialize GTM if exists
   */
  private setContext = async (frontend, oldContext) => {
    if (!frontend) { return; }
    const {
      language: languageData,
      languages,
      page: pageData,
      website: websiteData,
      navigations: navigationsData,
      datasourceItems,
      project,
      project: projectData,
    } = frontend;

    if (!oldContext || JSON.stringify(oldContext) === '{}') {
      await client.writeQuery({
        query: gql`
          query {
            languageData,
            languagesData,
            pageData,
            websiteData,
            navigationsData,
            datasourceItems,
            project,
            projectData
          }
        `,
        data: {
          languageData,
          languagesData: languages,
          pageData,
          websiteData,
          navigationsData,
          datasourceItems,
          project,
          projectData
        },
      });
    } else {
      await client.writeQuery({
        query: gql`
        query {
          pageData,
          datasourceItems,
        }`
      ,
        data: {
          pageData,
          datasourceItems,
        },
      });
    }
    this.content = frontend.page.content;
    this.seo = frontend.seo;
    this.project = project;
    this.pageName = frontend.page.name;
    this.forceUpdate();

    if (websiteData.googleTrackingPixel) {
      this.initGTM(websiteData.googleTrackingPixel);
    }
  }

  private initGTM(gtmId: string) {
    if (!document) { 
      return;
    }

    if (!document.head || !document.body || !document.createElement) {
      return;
    }
    
    if (!document.head.insertBefore || !document.body.insertBefore || !document.head.appendChild) {
      return;
    }

    if (this.state.gtmIds.includes(gtmId)) {
      return;
    }

    const gtmIds = [...this.state.gtmIds, gtmId];
    this.setState({ gtmIds }, () => {
      TagManager.initialize({
        gtmId
      });
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
