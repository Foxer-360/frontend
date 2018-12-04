import { Context, LightweightComposer } from '@foxer360/composer';
import * as queries from '@source/services/graphql/queries';
import { ComponentsModule, PluginsModule } from '@source/services/modules';
import * as React from 'react';
import { Query } from 'react-apollo';
import { Helmet } from 'react-helmet';

export interface IProperties {
  server?: string;
  // tslint:disable-next-line:no-any
  location?: any;
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
  context: Context;
}

class Application extends React.Component<IProperties, IState> {

  constructor(props: IProperties) {
    super(props);

    this.state = {
      context: new Context(),
    };
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
        query={queries.FRONTEND}
        variables={{ url: path }}
      >
        {({ loading, data, error, client }) => {
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

          const seo = this.formatSeoData(data.frontend.seo as ISeoPluginData);
          // tslint:disable
          console.log(seo);

          this.state.context.writeProperty('website', data.frontend.website.id);
          this.state.context.writeProperty('language', data.frontend.language.id);
          this.state.context.writeProperty('languageCode', data.frontend.language.code);

          return (
            <>
              <Helmet>
                <meta name="description" content={seo.description} />
                <meta name="keywords" content={seo.keywords} />
                <title>{seo.title || data.frontend.page.name}</title>

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
                content={data.frontend.page.content}
                componentModule={ComponentsModule}
                pluginModule={PluginsModule}
                context={this.state.context}
                plugins={['navigations', 'languages']}
                client={client}
              />
            </>
          );
        }}
      </Query>
    );
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
