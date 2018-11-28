import { LightweightComposer } from '@source/composer';

import { queries, client } from '@source/services/graphql';
import { ComponentsModule, PluginsModule } from '@source/services/modules';
import * as React from 'react';

import { Query } from 'react-apollo';
import { Helmet } from 'react-helmet';
import gql from 'graphql-tag';

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
}

class Application extends React.Component<IProperties, IState> {

  constructor(props: IProperties) {
    super(props);
  }

  public componentWillReceiveProps({ location: { pathname: newPath } }: LooseObject) {
    const { location: { pathname: oldPath } } = this.props;

    if (newPath !== oldPath) {
      window.scroll({
        behavior: 'smooth',
        top: 0,
    });
    }
  }

  public render() {
    const path = this.resolvePath(this.props.location.pathname);

    if (!path) {
      return null;
    }

    return (
      <Query
        onCompleted={this.setContext}
        query={queries.FRONTEND}
        variables={{ url: path }}
      >
        {({ loading, data, error }: LooseObject) => {
          
          if (!data) {
            return <span>Loading page...</span>;
          }

          if (error) {
            return <span>Some error occured...</span>;
          }

          if (!data.frontend) {
            return <span>Page not found...</span>;
          }

          if (!data.frontend.page.content) {
            return <span>Content of page was not found...</span>;
          }

          let fullUrl = path;
          if (this.props.server && this.props.server.length > 1) {
            fullUrl = `${this.props.server}${path}`;
          }

          const seo = data.frontend.seo as ISeoPluginData;

          let title = data.frontend.page.name as string;
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
                content={data.frontend.page.content}
                componentModule={ComponentsModule}
                pluginModule={PluginsModule}
                plugins={['navigations', 'languages']}
                client={client}
              />
            </>
          );
        }}
      </Query>
    );
  }

  private setContext = ({ 
    frontend: {
      language,
      page,
      website
    }
  }) => {
    const query = gql`
      query {
        language,
        page,
        website
      }
    `;
    client.writeQuery({
      query,
      data: {
        language,
        page,
        website
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
