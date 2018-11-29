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
  page @client
  language @client
  website @client
  languages @client
  navigations @client
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
}

export interface ISeoPluginData {
  title?: string;
  description?: string;
  focusKeyword?: string;
  url?: string;
  // fb
  facebookTitle?: string;
  facebookPublisher?: string;
  facebookDescription?: string;
  facebookImage?: string;
  // twitter
  twitterTitle?: string;
  twitterPublisher?: string;
  twitterDescription?: string;
  twitterImage?: string;
  // google plus
  googlePlusTitle?: string;
  googlePlusPublisher?: string;
  googlePlusImage?: string;
  seo?: LooseObject;
}

export interface IState {
  frontend?: LooseObject;
}

class Application extends React.Component<IProperties, IState> {

  constructor(props: IProperties) {
    super(props);
    this.state = {
      frontend: null
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
      variables: { url: path}
    }).then(({ data: { frontend } }: LooseObject) => 
      this.setState({ frontend }, () => {
        this.setContext(frontend);
      })
    );
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
          getContext: { 
            page, 
            language,
            navigations,
            languages,
            website
          },
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

          const seo = this.state.frontend.seo as ISeoPluginData;

          let title = this.state.frontend.page.name as string;
          if (seo && seo.title) {
            title = seo.title;
          }
          let description = '';
          if (seo && seo.description) {
            description = seo.description;
          }
          let keywords = '';
          if (seo && seo.focusKeyword) {
            keywords = seo.focusKeyword;
          }

          let facebookTitle = '';
          if (seo && seo.facebookTitle) {
            facebookTitle = seo.facebookTitle;
          }
          let facebookDescription = '';
          if (seo && seo.facebookDescription) {
            facebookDescription = seo.facebookDescription;
          }
          let facebookImage = '';
          if (seo && seo.facebookImage) {
            facebookImage = seo.facebookImage;
          }

          let twitterTitle = '';
          if (seo && seo.twitterTitle) {
            twitterTitle = seo.twitterTitle;
          }
          let twitterDescription = '';
          if (seo && seo.twitterDescription) {
            twitterDescription = seo.twitterDescription;
          }
          let twitterImage = '';
          if (seo && seo.twitterImage) {
            twitterImage = seo.twitterImage;
          }

          let googlePlusTitle = '';
          if (seo && seo.googlePlusTitle) {
            googlePlusTitle = seo.googlePlusTitle;
          }
          let googlePlusImage = '';
          if (seo && seo.googlePlusImage) {
            googlePlusImage = seo.googlePlusImage;
          }

          return (
            <>
              <Helmet>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <title>{title}</title>

                {/* Facebook */}
                <meta property="og:url" content={fullUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={facebookTitle} />
                <meta property="og:description" content={facebookDescription} />
                <meta property="og:image" content={facebookImage} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={twitterTitle} />
                <meta name="twitter:description" content={twitterDescription} />
                <meta name="twitter:image" content={twitterImage} />

                {/* Google */}
                <meta itemProp="name" content={googlePlusTitle} />
                <meta itemProp="image" content={googlePlusImage} />
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
            console.log(getContext);
            return render(data);
          }}
        </Query>
      );
    }
  })

  private setContext = (frontend) => {
    const { 
      language,
      languages,
      page,
      website,
      navigations
    } = frontend;
    const query = gql`
      query {
        language,
        languages,
        page,
        website,
        navigations
      }
    `;
    client.writeQuery({
      query,
      data: {
        language,
        languages,
        page,
        website,
        navigations
      },
    });
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
