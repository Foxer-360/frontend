import * as React from 'react';
import { HelmetData } from 'react-helmet';

// tslint:disable:no-any

interface IProperties {
  content: string;
  client: {
    cache: any;
  };
  manifest: any;
  helmet: HelmetData;
}

const Html = ({ content, client: { cache }, manifest, helmet }: IProperties) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      {helmet.meta.toComponent()}

      <link href={`/${manifest['main.css']}`} rel="stylesheet" type="text/css"/>
      <link href="/styles/kohinoor.css" rel="stylesheet" type="text/css" />
      {helmet.link.toComponent()}

      {helmet.title.toComponent()}
    </head>
    <body>
      <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
      <script
        charSet="UTF-8"
        dangerouslySetInnerHTML={{
          __html: `window.__APOLLO_STATE__=${JSON.stringify(cache.extract())};`,
        }}
      />
      <script src={`/${manifest['main.js']}`} charSet="UTF-8" />
    </body>
  </html>
);

export default Html;
