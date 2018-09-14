import { config } from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import * as React from 'react';
import { ApolloProvider, renderToStringWithData } from 'react-apollo';
import ReactDOM from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Route } from 'react-router-dom';
import Application from '../src/components/Application';
import Html from './components/Html';
import { client } from './graphql';

// Load configuration from .env file
config();

if (!process.env.SERVER_PORT) {
  // tslint:disable-next-line:no-console
  console.log(`Server port was not specified. Try to run app on port 8000...`);
}

const app = express();
const port = process.env.SERVER_PORT || 8000;

app.use('/static', express.static(path.join(process.cwd(), 'build/static')));
app.use('/styles', express.static(path.join(process.cwd(), 'build/styles')));
app.use('/assets', express.static(path.join(process.cwd(), 'build/assets')));
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
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
