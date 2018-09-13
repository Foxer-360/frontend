import express from 'express';
import fs from 'fs';
import path from 'path';
import * as React from 'react';
import { ApolloProvider, renderToStringWithData } from 'react-apollo';
import ReactDOM from 'react-dom/server';
import Application from '../src/components/Application';
import Html from './components/Html';
// import { client } from './graphql';

import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import { StaticRouter } from 'react-router';
import { Route } from 'react-router-dom';

const app = express();
const port = 8001;

app.use('/static', express.static(path.join(process.cwd(), 'build/static')));
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // To Do

  const cache = new InMemoryCache();

  const httpLink = createHttpLink({
    // tslint:disable-next-line:no-any
    fetch: fetch as any,
    // headers: req.headers,
    uri: 'http://localhost:8000/graphql',
  });

  const client = new ApolloClient({
    cache,
    connectToDevTools: false,
    link: ApolloLink.from([
      httpLink
    ]),
    ssrForceFetchDelay: 100,
    ssrMode: true,
  });

  const SSR = (
    <ApolloProvider client={client}>
      <StaticRouter location={req.url} context={{}}>
        <Route component={Application} />
      </StaticRouter>
    </ApolloProvider>
  );

  Promise.all([
    renderToStringWithData(SSR),
    fs.readFileSync('./build/asset-manifest.json').toString()
  ])
  .then(([content, manifest]) => {
    res.status(200);
    const html = (
      <Html
        content={content}
        client={client}
        manifest={JSON.parse(manifest)}
      />
    );
    const staticHtml = ReactDOM.renderToStaticMarkup(html);

    res.send(`<!doctype html>\n${staticHtml}`);
    res.end();
  })
  .catch(err => {
    res.status(500);
    res.end(`Some error occurres ! Message: ${err.message}`);
    // tslint:disable-next-line:no-console
    console.log(err.message);
  });
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Frontend server is running on port ${port}...`);
});
