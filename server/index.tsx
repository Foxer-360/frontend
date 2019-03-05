import { config } from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import * as React from 'react';
import { ApolloProvider, renderToStringWithData } from 'react-apollo';
import ReactDOM from 'react-dom/server';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, StaticRouter } from 'react-router';
import { Route } from 'react-router-dom';
import Application from '../src/components/Application';
import Html from './components/Html';
import { client, fetchFrontend } from './graphql';
import { clearTerminal, Colors, logger } from './utils';
import gql from 'graphql-tag';
import './utils/document';

// Define log function
const log = (...args) => {
  logger.enable();
  console.log(...args);
  logger.disable();
};

// Define Timer
const getTimerText = (url: string) => {
  return `Response for ${url} in ${Colors.Foregrounds.Green}${Colors.System.Bright}`;
};

const time = (url: string) => {
  console.time(getTimerText(url));
};

const timeEnd = (url: string) => {
  logger.enable();
  console.timeEnd(getTimerText(url));
  console.log(Colors.System.Reset);
  logger.disable();
};

logger.disable();

// Clear terminal
clearTerminal();

// Load configuration from .env file
config();

if (!process.env.SERVER_PORT) {
  // tslint:disable-next-line:no-console
  log(`Server port was not specified. Try to run app on port 8000...`);
}

const app = express();
const port = Number(process.env.SERVER_PORT) || 80 as number;

// Some static routes
app.use('/static', express.static(path.join(process.cwd(), 'build/static')));
app.use('/styles', express.static(path.join(process.cwd(), 'build/styles')));
app.use('/assets', express.static(path.join(process.cwd(), 'build/assets')));
app.use('/favicon.ico', express.static(path.join(process.cwd(), 'favicon.ico')));
app.use('/service-worker.js', express.static(path.join(process.cwd(), 'service-worker.js')));
app.use('/index.html', express.static(path.join(process.cwd(), 'index.html')));

const staticRegexs = [
  /^\/?static\/?.*$/i,
  /^\/?styles\/?.*$/i,
  /^\/?assets\/?.*$/i,
  /^\/?favicon\.ico$/i,
  /^\/?service-worker\.js$/i,
  /^\/?index\.html$/i,
];

// Dynamic route
app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Skip all static urls like /static /styles /assets favicon.ico
  const url = req.url;

  let isStaticRoute = false;
  staticRegexs.find((reg) => {
    if (reg.test(url)) {
      isStaticRoute = true;
      return true;
    }

    return false;
  });

  if (isStaticRoute) {
    log(`${Colors.yellow(`Static route:`)} ${url}`);
    res.end();
    return;
  }

  let serverUrl = process.env.SERVER_URL as string;
  if (!serverUrl || serverUrl === undefined || serverUrl === null) {
    serverUrl = '';
  }
  if (serverUrl[serverUrl.length - 1] === '/') {
    serverUrl = serverUrl.slice(0, -1);
  }

  if (port !== 80 && port !== 443) {
    serverUrl += `:${port}`;
  }

  log(`${Colors.bright(Colors.blue(`\nRequest:`))} ${req.url}`);
  time(req.url);

  // Prepare cachce in client.
  await client.clearStore();

  // Setup origin
  let origin = req.headers.host as string;
  // If not in host, try origin
  if (!origin) {
    origin = req.headers.origin as string;
  }
  // If not in origin, try .env
  if (!origin) {
    origin = process.env.REACT_APP_ORIGIN as string;
  }
  // If origin is localhost and we set REACT_APP_ORIGIN, override it
  if (process.env.REACT_APP_ORIGIN) {
    if (origin) {
      const localhostRegex = /.*localhost.*/gi;
      if (localhostRegex.test(origin)) {
        origin = process.env.REACT_APP_ORIGIN as string;
      }
    }
  }

  // Check if origin has https? and addit if not
  const regex = /^https?.*$/gi;
  if (origin) {
    if (!regex.test(origin)) {
      origin = `http://${origin}`;
    }
  }

  log(Colors.yellow(`Origin in Server: ${Colors.bright(origin)}`));

  const frontend = await fetchFrontend(origin, req.url);
  if (!frontend) {
    log(Colors.red(`Page was not found!`));
    timeEnd(req.url);
    res.status(404);
    res.end();
    return;
  }
  const renderApp = (props: RouteComponentProps) => (<Application server={serverUrl} {...props} frontend={frontend} />);

  const SSR = (
    <ApolloProvider client={client}>
      <StaticRouter location={req.url} context={{}}>
        <Route render={renderApp} />
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
        helmet={Helmet.renderStatic()}
      />
    );
    const staticHtml = ReactDOM.renderToStaticMarkup(html);

    res.send(`<!doctype html>\n${staticHtml}`);
    res.end();
    timeEnd(req.url);
  })
  .catch(err => {
    res.status(500);
    res.end(`Some error occurres ! Message: ${err.message}`);
    timeEnd(req.url);
    log(Colors.bright(Colors.red(err.message)));
    log(err);
  });
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  log(Colors.bright(Colors.green(`Frontend server is running on port ${port}...`)));
});
