<br />
<img style="width: 200px;" src="https://cheatcode-assets.s3.amazonaws.com/logo-transparent.png" alt="CheatCode">

## Joystick (Beta)

The full-stack JavaScript framework.

[Join the Discord](https://discord.gg/UTy4Fpy)

---

#### Table of Contents

0. ⚠️ [Beta Warning](#beta-warning)
1. [What is Joystick?](#what-is-joystick)
2. [Joystick vs. Other Frameworks](#joystick-vs-other-frameworks)
3. [In the Wild](#in-the-wild)
4. [Installation](#installation)
5. [Getting Started](#getting-started)
   - [Tutorials](#tutorials)
6. [Folder and file structure](#folder-and-file-structure)
   - [/api](#api)
   - [/fixtures](#fixtures)
   - [/email](#email)
   - [/i18n](#i18n)
   - [/lib](#lib)
   - [/node_modules](#node_modules)
   - [/public](#public)
   - [/private](#private)
   - [/ui](#ui)
   - [/routes](#routes)
   - [index.client.js](#indexclientjs)
   - [index.css](#indexcss)
   - [index.html](#indexhtml)
   - [index.server.js](#indexserverjs)
   - [package.json](#packagejson)
   - [settings.env.json](#settingsenvjson)
7. [Settings](#settings)
   - [Defining settings per environment](#defining-settings-per-environment)
   - [Defining Joystick configuration](#defining-joystick-configuration)
   - [Defining global settings](#defining-global-settings)
   - [Defining public settings](#defining-public-settings)
   - [Defining server settings](#defining-private-settings)
8. [@joystick.js/cli](#joystickjscli)
   - [joystick create](#joystick-create)
   - [joystick start](#joystick-start)
   - [joystick build](#joystick-build)
   - [joystick update](#joystick-update)
9. [Databases](#databases)
   - [Adding a database](#adding-a-database)
   - [Users database](#users-database)
   - [MongoDB](#mongodb)
   - [PostgreSQL](#postgresql)
   - [Adding a remote database](#adding-a-remote-database)
10. [Accounts](#accounts)
   - [accounts.signup](#accountssignup)
   - [accounts.login](#accountslogin)
   - [accounts.logout](#accountslogout)
   - [accounts.authenticated](#accountsauthenticated)
   - [accounts.user](#accountsuser)
   - [accounts.recoverPassword](#accountsrecoverpassword)
   - [accounts.resetPassword](#accountsresetpassword)
   - [accounts.roles](#accountsroles)
     - [accounts.roles.add](#accountsrolesadd)
     - [accounts.roles.remove](#accountsrolesremove)
     - [accounts.roles.grant](#accountsrolesgrant)
     - [accounts.roles.revoke](#accountsrolesrevoke)
     - [accounts.roles.userHasRole](#accountsrolesuserhasrole)
11. [@joystick.js/ui](#joystickjsui)
    - [Writing a component](#writing-a-component)
    - [Render functions](#render-functions)
      - [component() and c()](#component-and-c)
      - [each() and e()](#each-and-e)
      - [when() and w()](#when-and-w)
      - [i18n() and i()](#i18n-and-i)
    - [Props](#props)
    - [State](#state)
    - [Data](#data)
      - [Refetching Data](#refetching-data)
    - [Lifecycle methods](#lifecycle-methods)
    - [Methods](#methods)
    - [DOM Events](#dom-events)
    - [CSS](#css)
    - [Global State](#global-state)
      - [Setting](#updating-the-cache)
      - [Unsetting](#unsetting-the-cache)
      - [Getting](#getting-data-from-the-cache)
      - [Listening for Changes](#listening-for-cache-changes) 
    - [Form Validation](#form-validation)
    - [Accessing URL and query params](#accessing-url-and-query-params)
    - [Writing comments](#writing-comments)
    - [Accessing a Component's DOM Node](#accessing-the-dom-node)
12. [@joystick.js/node](#joystickjsnode)
    - [Defining an app](#defining-an-app)
    - [Middleware](#middleware)
      - [Configuring built-in middleware](#configuring-built-in-middleware)
      - [Adding custom middleware](#adding-custom-middleware)
    - [Routes](#node-routes)
      - [Defining routes](#defining-routes)
      - [Defining routes for specific HTTP methods](#defining-routes-for-specific-http-methods)
      - [req.context.ifLoggedIn()](#reqcontextifloggedin)
      - [req.context.ifNotLoggedIn()](#reqcontextifnotloggedin)
      - [res.render()](#resrender)
        - [Rendering a page](#rendering-a-page)
        - [Rendering in a layout](#rendering-in-a-layout)
        - [Passing props to res.render()](#passing-props-to-resrender)
        - [Setting SEO metadata in rendered HTML](#setting-seo-metadata-in-rendered-html)
    - [API](#api-1)
      - [Getters](#getters)
      - [Setters](#setters)
      - [Accessing getters and setters as HTTP endpoints](#accessing-getters-and-setters-as-http-endpoints)
      - [Validating inputs](#validating-inputs)
      - [Authorization](#authorization)
      - [Schema](#schema)
      - [get()](#get)
      - [set()](#set)
      - [Customizing outputs](#customizing-outputs)
    - [Internationalization](#internationalization)
      - [Adding a language file](#adding-a-language-file)
      - [Accessing translations](#accessing-translations)
    - [Handling process events](#handling-process-events)
    - [__filename and __dirname](#__filename-and-__dirname)
13. [Deployment](#deployment)
    - [Setting and utilizing a ROOT_URL](#setting-and-utilizing-a-ROOT_URL)
    - [Joystick Deploy](#joystick-deploy)

---

## Beta Warning

⚠️

Joystick is currently in **beta** and _should not_ be used for production software. Expect bugs and issues to be common as we work toward a 1.0 release.

## What is Joystick?

Joystick is a full-stack JavaScript framework for building web apps comprised of three NPM packages:

- `@joystick.js/ui` - A JavaScript library for building user interfaces with HTML, CSS, and JavaScript.
- `@joystick.js/node` - A Node.js library for building back-ends.
- `@joystick.js/cli` - A command-line interface for creating and running Joystick applications and their databases in development.

The first package represents the "front-end" of the stack, while the second represents the "back-end" of the stack. The `cli` package ties those two together. While the first two packages can be used independently, they're intended to be and best used together.

Joystick includes:

- A full, pre-configured build system in `@joystick.js/cli`.
- A UI component framework in `@joystick.js/ui`.
- The ability to run multiple databases in development (and have them wired to your app).
- A pre-configured HTTP server via Express.js in `@joystick.js/node`.
- An accounts system that's database agnostic and can map to any of Joystick's supported databases.
- An API layer that includes input validation and the ability to customize the output of responses.
- Built-in server-side rendering of components built with `@joystick.js/ui` and automatic, no code, client-side hydration.
- Hot module reloading in development.

## Joystick vs. Other Frameworks

A quick comparison table of Joystick vs. other frameworks can be [found here](https://tinyurl.com/joystick-comparison).

### What distinguishes Joystick from other frameworks?

Joystick is a full-stack framework, not front-end only. The UI part (@joystick.js/ui) is designed to snap in to the back-end/server part (@joystick.js/node). The advantage is that you're not wasting time trying to stitch together disparate parts that may or may not work together (or even worse, may or may not be supported long-term).

Further, the current crop of frameworks seeks to overcomplicate APIs and are indecisive about how things should be done (as evidenced by the introduction of patterns that are "the way" one day and then a few months later are "deprecated"). This leads to a lot of confusion at the community level which makes it hard to build software that can endure over time.

Even worse, these frameworks introduce their own languages/syntax which are foreign to what a beginner would learn (HTML, CSS, and JavaScript). This not only creates confusion and slows down the learning process, but it also creates the long-term nightmare of developers not understanding the fundamentals of the tools they use to build. Eventually, you hit a drop-off point where people think that, for example, JSX is HTML and in a pinch where they can't use React, are ineffective or incapable of completing the task properly.

By contrast, Joystick is designed to be stable, long-term, from the beginning (i.e., no random "hey, we're deprecating all this stuff you depend on for this more confusing API that's less descriptive"). It's also based on the core technologies of the web: HTML, CSS, and JavaScript. Joystick doesn't introduce any hacks or syntax tricks to render the component. It's plain HTML, CSS, and JavaScript. This means that the transition from learning the basics of the web to shipping apps is far smoother (and an individual developer is less likely to make mistakes/get confused as everything looks consistent with where they started).

Joystick's front-end component API and back-end API are designed to be fixed long-term. So, an app you write in Joystick today will look the same 10 years from now (features will be added/improved over time, but core APIs will not be deprecated unless there is a major security or performance issue). We like to refer to Joystick as "The Honda Civic of JavaScript Frameworks."

### Who should use Joystick?

SMBs, startups, and freelancers/contractors.

For SMBs/startups, it's a solid framework for shipping custom software for your business (or a consumer/b2b SaaS) that you can rely on long-term. So, build it today and maintenance is limited to some patch upgrades and new features/improving existing features. Never a surprise refactor being plopped on the roadmap, distracting you and your team from delivering value to customers. Joystick also broadens your talent pool for hires as it's not using a proprietary language or set of conventions for working with it (if they understand HTML, CSS, and JavaScript, they'll understand Joystick).

For freelancers/contractors, remove the overwhelm of juggling a bunch of disparate codebases across clients that each have their own shifting requirements (i.e., standardize what you ship, full-stack). This allows you to take on more work, but also, make your long-term support more predictable as the framework you're building on isn't going to rug pull you down the road. This allows you to build a better business with happier clients.

Joystick is offered by CheatCode, an independent (not venture-backed) business. We understand the importance of long-term viability of technological bets and the effect surprise "rug pulls" can have on profits. Venture-backed startups are less-focused on the long-term as their existence is based on short-term ROI (return on investment) for investors. Even if CheatCode goes away, Joystick will continue to exist and be maintained by its creator, Ryan, for the sake of enjoyment/fun and use on his own projects. When we say "long-term," we mean it—[the bus factor](https://en.wikipedia.org/wiki/Bus_factor) withstanding. Even then, Joystick's stable-by-design and FOSS/MIT-licensure means a willing party can take the torch and run if Ryan merges with the infinite.

### What does Joystick do? What doesn't it do?

It allows you to define routes on the server which when matched, render some HTML, CSS, and JavaScript using a component framework that's a light abstraction over those core technologies (think what Rails or Django do but with JavaScript). It also makes it easy to define a JSON-RPC API that can be called directly from components, giving you complete transparency into the flow of data between the client and server without any ambiguity. In addition, it adds the necessary wiring to start and connect drivers for databases to your app with a few lines of configuration in the app's `settings.development.json` file, piping those drivers to where you need them (namely, your routes and your API endpoints/handlers).

The back-end is just a plain Express.js/Node.js app so anything you can do in a standalone Node project, you can do in Joystick without any limitations. So, if you want to use a third-party package, just run npm install <blah> and it will work.

All of this is backed by a built-in SSR/hydration implementation so all you have to do is write your routes, API, and components. No time wasted on wiring the front to the back-end. All of that is automated via the lightning-fast build system built around esbuild (which is implemented/configured out-of-the-box) so you can just run `joystick start` and get to work in a few seconds.

What Joystick _doesn't_ do is get in your way and it isn't a ticking time bomb of deprecation. It allows you to actually focus on the product you're building, long-term.

## In the Wild

Check out Joystick apps that are live in production today:
   
**[Moumint](https://moumint.com)** - https://moumint.com

Moumint offers the most entertaining creator support and monetisation platform. It enables creators and their supporters to create, collect and share the best streaming moments and content pieces.
   
**[CheatCode](https://cheatcode.co)** - https://cheatcode.co

The official website of Joystick's creator, CheatCode.

## Installation

To get started with Joystick, install the CLI via NPM:

```javascript
npm i -g @joystick.js/cli
```

**Note**: the `-g` flag here is important as you want to install the CLI as part of your computer's _global_ NPM packages.

> **Node Warning**: Joystick is best used with Node.js 16+. If you don't have Node.js installed, or, want to learn how to manage multiple versions on one computer: [read this tutorial](https://cheatcode.co/tutorials/how-to-install-node-js-and-manage-versions-with-nvm).

## Getting Started

To get started, create a new Joystick app via the CLI:

```javascript
joystick create <app>
```

After a few seconds, a folder with the name you pass for `<app>` will be created, containing a fresh Joystick app. To start the app, `cd` into the folder and run `joystick start`:

```javascript
cd <app> && joystick start
```

This will build your app and start it at `http://localhost:2600`.

> Questions about Joystick? [Join the Discord](https://discord.gg/UTy4Fpy).

### Tutorials

A great way to get familiar with Joystick beyond this documentation is to check out some of the tutorials walking through the basics over on CheatCode:

- [Building and Rendering Your First Joystick Component](https://cheatcode.co/tutorials/building-and-rendering-your-first-joystick-component)
- [How to Implement an API Using Getters and Setters in Joystick](https://cheatcode.co/tutorials/how-to-implement-an-api-using-getters-and-setters-in-joystick)
- [How to Fetch and Render Data in Joystick Components](https://cheatcode.co/tutorials/how-to-fetch-and-render-data-in-joystick-components)
- [How to Wire Up User Accounts and Authenticated Routing in Joystick](https://cheatcode.co/tutorials/how-to-wire-up-user-accounts-and-authenticated-routing-in-joystick)
- [How to Upload Files to Multiple Locations Simultaneously with Joystick](https://cheatcode.co/tutorials/how-to-upload-files-to-multiple-locations-simultaneously-with-joystick)
- [How to Define Templates and Send Email with Joystick](https://cheatcode.co/tutorials/how-to-define-templates-and-send-email-with-joystick)

## Folder and file structure

Joystick takes an opinionated approach to file structure. It is _not_ designed to be a one-size-fits-all framework which means that the structure of your project **must** follow Joystick's guidelines.

**The file structure below is enforced by Joystick**. If it doesn't fit your wants/needs, Joystick isn't for you.

The default structure for a Joystick app consists of the following:

```javascript
├── /api
│   ├── index.js
├── /fixtures
├── /email
│   ├── base.html
├── /i18n
│   ├── en-US.js
├── /lib
│   ├── /browser
│   ├── /node
├── /node_modules
├── /public
│   ├── apple-touch-icon-152x152.png
│   ├── favicon.ico
│   ├── manifest.json
│   ├── service-worker.js
│   ├── splash-screen-1024x1024.png
├── /private
├── /ui
│   ├── /components
│   ├── /layouts
│   ├── /pages
├── /routes
├── index.client.js
├── index.css
├── index.html
├── index.server.js
├── package.json
├── settings.<env>.json
```

This gives you everything you need to build a web app while staying organized and consistent with the expectations of Joystick, its community, and the learning materials available at [CheatCode](https://cheatcode.co) (the creator of Joystick).

### /api

This folder contains the data API for your web app in the form of a Joystick schema (stored in `/api/index.js`) and a series of folders named by resource (e.g., `/api/posts` or `/api/customers`).

Inside of each resource folder, there should be a `getters.js` file and a `setters.js` file. Both files export an object containing the getter and setter endpoints that will make up your API.

Inside of `/api/index.js`, all of your getters and setters are imported from each resource and added to the main `getters` and `setters` objects on your schema.

Your `/api/index.js` file is then imported in your `index.server.js` file and passed as the `api` property on your call to `node.app()`.

### /fixtures

An optional folder for storing database fixtures. Files here can be imported into `/index.server.js` and called via the `fixtures` function on the options passed to `node.app()`. 

### /email

This folder contains the `base.html` file for all of the emails in your app and your email templates defined as Joystick components in `.js` files (e.g., `/email/welcome.js` or `/email/reset-password.js`).

### /i18n

This folder contains all of the internationalization or translation files for your app as `.js` files using the standard ISO language code as the name (e.g., `en-US.js` for English or `es-ES.js` for Spanish).

### /lib

This folder contains all of these miscellaneous/shared functions and data for your application. For example, a function like `lib/formatEmailAddress.js` or some generic data like `/lib/animals.json`.

> Files located at the root of `/lib` are treated as browser (universal) JavaScript. If you have modules that need to be built specifically for the browser or specifically for Node.js, you can place them in the /lib/browser or /lib/node directory, respectively.

### /node_modules

All of the currently installed NPM modules for the application.

### /public

Any public-facing, static assets for your application like your `favicon.ico` file or your app's logo. All files in this folder are mapped to the root `/` URL in your application (e.g., `/public/favicon.ico` would map to `http://localhost:2600/favicon.ico` in development).

### /private

Any private assets that you _do not_ want to expose to the public (e.g., a `.pem` file). This folder is only accessible on the server.

### /ui

This folder contains all of the Joystick components for your app. Components are organized into subfolders depending on their role in your UI:

- `components` - Miscellaneous components that are used throughout the entire application.
- `layouts` - Components that render fixed UI elements (like navigation), allowing for a dynamic "yield" target that can be populated with the page matching the current route/URL.
- `pages` - Components that are intended to be rendered by your router. A page components consists of some HTML and a composition of _other_ components (e.g., components that live in your `/ui/components` directory).

Regardless of type, components should be organized into their own folders containing an `index.js` file (e.g., `ui/components/toggleSwitch/index.js` or `ui/pages/notifications/index.js`).

### /routes

An optional folder for storing files containing route definitions. Helpful if you're building a large application with several routes and you want to avoid defining them all together in `/index.server.js`.

### index.client.js

JavaScript file that's loaded for all pages rendered using the `res.render()` function in your routes. Includes miscellaneous JavaScript to run first in the browser when the page loads (e.g., Fathom Analytics script, initializing a Redux store, etc.).

### index.css

Any global CSS for your entire application. Automatically loaded in the browser for all pages rendered using the `res.render()` function in your routes. This CSS is loaded _before_ the CSS for your Joystick components.

### index.html

The base HTML for your app. Automatically loaded in the browser for all pages rendered using the `res.render()` function in your routes. This is where you can load CDN-based libraries or set other global HTML that applies to your entire app.

### index.server.js

The JavaScript file loaded by `@joystick.js/cli` as the server for your application. This file should contain your instance of `node.app()` from the `@joystick.js/node` package and any other code you'd like to run on server startup.

**Warning**: without this file, your app will not work.

### package.json

The NPM `package.json` file which describes the dependencies for your app along with any NPM scripts and other configuration.

### settings.env.json

Environment specific settings for your app. There are currently four environments supported by Joystick: `development`, `staging`, `production`, and `test`.

Joystick anticipates files for each of these environments and loads them based on the value of `process.env.NODE_ENV` when your app is started (by default, `@joystick.js/cli` automatically sets this to `development` on your behalf).

Each file contains the settings intended for _that environment only_ (e.g., `settings.development.json` contains your development settings and `settings.production.json` contains your production settings).

## Settings

To aid in configuring your application and supplying settings for things like third-party APIs used in your app, Joystick provides a built-in settings feature.

Settings files follow a standardized structure split into four different groups:

```javascript
{
  config: {},
  global: {},
  public: {},
  private: {},
}
```

The `config` object contains Joystick-specific configuration for your app. The `global` object contains settings that should be accessible to both the browser (client) _and_ the server. The `public` object contains settings that should be accessible only to the browser. The `private` object contains settings that should only be accessible on the server.

When your app starts up, settings are made accessible via the `joystick.settings` global object both in the browser and on the server.

### Defining settings per environment

When your app starts up, settings are loaded on a per-environment basis, meaning, the file loaded into `joystick.settings` is influenced by the current value of `process.env.NODE_ENV`. By default, `@joystick.js/cli` sets this to `development`, meaning the contents of your `settings.development.json` will be loaded by default.

There are currently four environments supported by Joystick: `development`, `staging`, `production`, and `test`. This means you can have the following files, with each file containing the settings specific to that environment:

- `settings.development.json`
- `settings.staging.json`
- `settings.production.json`
- `settings.test.json`

Any or all of these files should be stored at the root of your project folder. **If you store them elsewhere, Joystick will not see them**.

### Defining Joystick configuration

Configuration specific to Joystick is stored in the `config` object within your settings file. Currently, Joystick anticipates the following properties under config:

- `build` an object of settings for build configuration (more information below).
- `databases` an array of objects describing the databases you want Joystick to start for you in development and load drivers for in _all_ environments.
- `i18n` an object containing configuration related to Joystick's internationalization feature.
- `middleware` configuration for the built-in, third-party middleware implemented by Joystick when starting your app.
- `email` configuration for Joystick's `email.send()` function.

For specific configuration properties, see the corresponding section in the documentation below.

#### Defining build settings

To configure builds of your app, the `config.build` object should be utilized in your `settings.<env>.json` file. Currently, the only configuration option for builds are paths to exclude during the build process:

```javascript
{
  "config": {
    "build": {
      "excludedPaths": ["repos/", "downloads/"]
    }
  }
}
```

Paths in the `excludedPaths` array will be filtered out of the build process. **Note**: all paths listed should _not_ include a preceeding slash (i.e, write `repos/` not `/repos`).

### Defining global settings

Global settings can be stored in the `global` object in your settings file:

```javascript
{
  "global": {
    "appName": "Spotify"
  }
}
```

Global settings are accessible in the browser _and_ the server.

### Defining public settings

Public settings can be stored in the `public` object in your settings file:

```javascript
{
  "public": {
    "googleAnalytics": {
      "propertyId": "UA-1234567890"
    }
  }
}
```

Public settings are accessible in the browser.

### Defining private settings

Private settings can be stored in the `private` object in your settings file:

```javascript
{
  "private": {
    "stripe": {
      "secretKey": "sk_test_abcdefg1234567"
    }
  }
}
```

Public settings are accessible in the browser.

## @joystick.js/cli

In development, `@joystick.js/cli` is the command line interface that you install globally via NPM. It's used to create new Joystick apps, start an existing app, or build an app for production.

### joystick create

To create a new Joystick project, run:

```javascript
joystick create <app>
```

For example, to create an app called "Spotify," run:

```javascript
joystick create spotify
```

After this command runs, instructions on next steps will be printed to the console.

### joystick start

To start an existing Joystick project, run the following from the root of the project on your computer:

```javascript
joystick start
```

For example, assuming your project lives at `~/projects/spotify` on your computer:

```javascript
cd ~/projects/spotify && joystick start
```

`joystick start` can be passed two flags:

`-e <env>` or `--environment <env>` which is the value to set for `process.env.NODE_ENV` on startup. For example: `joystick start --environment production`.

`-p <port>` or `--port <port>` which is the value to set for `process.env.PORT` on startup and where your app will be accessible on localhost. For example: `joystick start --port 1337` to run your app at `http://localhost:1337`.

### joystick build

To build an existing Joystick project, from the root of the project, run:

```javascript
joystick build
```

For example, assuming your project lives at `~/projects/spotify` on your computer:

```javascript
cd ~/projects/spotify && joystick build
```

This will build your application to the `.joystick/build` folder at the root of the project.

**Note**: this feature is not well-tuned for production environments yet. **Use with caution and low expectations**.

### joystick update

To update an existing Joystick project, from the root of the project, run:

```javascript
joystick update
```

For example, assuming your project lives at `~/projects/spotify` on your computer:

```javascript
cd ~/projects/spotify && joystick update
```

This will update `@joystick.js/node` and `@joystick.js/ui` in the project and `@joystick.js/cli` globally on your computer.

## Databases

One of the flagship features of Joystick is the ability to run one or more databases in development and connect the Node.js drivers for those databases to your Joystick app. This allows you to run multiple databases alongside your app simultaneously.

**Warning**: during the beta release, **any databases added using the convention below _must be installed by you_ on your computer**. `@joystick.js/cli` will provide instructions as necessary in your command line if a database you wish to use it _not_ installed.

### Adding a database

Databases are added via the `config.databases` array in your `settings.env.json` file.

Joystick starts and connects to databases based on the contents of the `config.databases` array. If a database isn't in this array, **it will not be started alongside your app and its driver will not be connected in your app**.

The table below showcases which databases Joystick currently supports (and which features each database supports):

<table>
  <thead>
    <tr>
      <th>Database</th>
      <th>Autostart via CLI</th>
      <th>User Accounts</th>
      <th>Node.js Driver</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>MongoDB</td>
      <td style="text-align:center;">✅</td>
      <td style="text-align:center;">✅</td>
      <td style="text-align:center;">✅</td>
      <td style="text-align:left;"></td>
    </tr>
    <tr>
      <td>PostgreSQL</td>
      <td style="text-align:center;">✅</td>
      <td style="text-align:center;">✅</td>
      <td style="text-align:center;">✅</td>
      <td style="text-align:left;"><code>metadata</code> field passed to <code>accounts.signup()</code> only supports the <code>language</code> property.</td>
    </tr>
  </tbody>
</table>

To specify databases:

```javascript
{
  "config": {
    "databases": [
      {
        "provider": "mongodb",
        "options": {}
      },
      {
        "provider": "postgresql",
        "options": {}
      }
    ]
  }
}
```

Databases are specified as objects with a minimum of two properties: `provider` set equal to a string containing the lowercase name of one of Joystick's supported database providers and an `options` object which are the options for the official Node.js driver for that database (loaded and wired into your app by Joystick).

In the above example, our app is loading _two_ databases simultaneously: MongoDB and PostgreSQL.

### Users database

A unique feature of Joystick is that it's set up to map your users to any of Joystick's supported databases. This means that you can store your user's in one database (e.g., PostgreSQL) and the data for your application in another database (e.g., MongoDB).

To specify the database where your users will live, set the `users` property on the database's object in the `config.databases` array:

```javascript
{
  "config": {
    "databases": [
      {
        "provider": "mongodb",
        "users": true,
        "options": {}
      }
    ]
  }
}
```

**Note**: Joystick only supports one users database and will throw an error on startup if more than one database is marked as `users: true` in `config.databases`.

### MongoDB

To add support for MongoDB, add an object to the `config.databases` array in your settings file with the following properties:

```javascript
{
  "config": {
    "databases": [
      {
        "provider": "mongodb"
      }
    ]
  }
}
```

When you run `joystick start`, Joystick will automatically detect the database, start it locally (or warn you if it's not installed on your computer), and then start your app and connect the driver for that database.

### PostgreSQL

> NOTE: In order for PostgreSQL to work, it must be installed on your computer and available via your operating system's PATH variable. For MacOS users, this is automatically set up for you when installing PostgreSQL. For Windows users, [read the instructions here](https://cheatcode.co/tutorials/how-to-use-postgresql-with-node-js#installing-and-configuring-postgresql) for adding PostgreSQL to your PATH variable.

To add support for PostgreSQL, add an object to the `config.databases` array in your settings file with the following properties:

```javascript
{
  "config": {
    "databases": [
      {
        "provider": "postgresql"
      }
    ]
  }
}
```

When you run `joystick start`, Joystick will automatically detect the database, start it locally (or warn you if it's not installed on your computer), and then start your app and connect the driver for that database.

### Adding a remote database

> NOTE: When running Joystick in a production environment (not on your own computer), a remote database is **required**. Joystick does *not* start up a database for you in production.

If you do _not_ want Joystick to start a database on your behalf but you _do_ want Joystick to connect the driver for your database to a remote database (running on your computer or in the cloud), pass a `connection` object with your database:

```javascript
{
  "config": {
    "databases": [
      {
        "provider": "postgresql",
        "options": {},
        "connection": {
          "username": "username",
          "password": "password",
          "hosts": [{
            hostname: "127.0.0.1",
            port: "5432"
          }],
          "database": "databaseName"
        }
      }
    ]
  }
}
```

When you start your app with `joystick start`, Joystick will test this `connection` to verify it works. If a connection cannot be established, a warning will be printed to your command line.

## Accounts

Joystick includes a basic email address/password accounts system that you can use to create users in your app.

To facilitate in the management of accounts `@joystick.js/ui` exports an object `accounts` that includes a handful of methods for managing users: `accounts.signup`, `accounts.login`, `accounts.logout`, `accounts.authenticated`, `accounts.user`, `accounts.recoverPassword`, and `accounts.resetPassword`.

### accounts.signup

To create a new user account, call `accounts.signup()` from a Joystick component.

```javascript
import ui, { accounts } from "@joystick.js/ui";

const Signup = ui.component({
  events: {
    "submit form": (event) => {
      accounts
        .signup({
          emailAddress: event.target.emailAddress.value,
          password: event.target.password.value,
        })
        .then(() => {
          // Redirect after signup.
          location.pathname = "/dashboard";
        });
    },
  },
  render: () => {
    return `
      <form>
        <label for="emailAddress">Email Address</label>
        <input type="email" name="emailAddress" />
        <label for="password">Password</label>
        <input type="password" name="password" />
        <button type="submit">Signup</button>
      </form>
    `;
  },
});

export default Signup;
```

If a signup is succesful, two HTTP-only cookies will be created in the user's browser: `joystickLoginToken` and `joystickLoginTokenExpiresAt`. Once this exists, Joystick will automatically retrieve the user from your users database and include them in every HTTP request to the server.

#### Setting a username

If you'd like to set a username for your users, this field is supported in _addition_ to the `emailAddress` field. This is intentional as it ensures your users always have a means for resetting their password.

```javascript
import ui, { accounts } from "@joystick.js/ui";

const Signup = ui.component({
  events: {
    "submit form": (event) => {
      accounts
        .signup({
          emailAddress: event.target.emailAddress.value,
          username: event.target.username.value,
          password: event.target.password.value,
        })
        .then(() => {
          // Redirect after signup.
          location.pathname = "/dashboard";
        });
    },
  },
  render: () => {
    return `
      <form>
        <label for="emailAddress">Email Address</label>
        <input type="email" name="emailAddress" />
        <label for="username">Username</label>
        <input type="text" name="username" />
        <label for="password">Password</label>
        <input type="password" name="password" />
        <button type="submit">Signup</button>
      </form>
    `;
  },
});

export default Signup;
```

**Note**: when logging in, a `username` can be used as an alternative to an `emailAddress` if you wish.

#### Setting a language

If you'd like to use Joystick's i18n (internationalization) feature with your users, you can pass an additional `metadata` field containing a `language` field with the [ISO language code](https://gist.github.com/rglover/23d9d10d788c87e7fc5f5d7d8629633f) matching your user's preference.

```javascript
import ui, { accounts } from "@joystick.js/ui";

const Signup = ui.component({
  events: {
    "submit form": (event) => {
      accounts
        .signup({
          emailAddress: event.target.emailAddress.value,
          password: event.target.password.value,
          metadata: {
            language: "es-ES",
          },
        })
        .then(() => {
          // Redirect after signup.
          location.pathname = "/dashboard";
        });
    },
  },
  render: () => {
    return `
      <form>
        <label for="emailAddress">Email Address</label>
        <input type="email" name="emailAddress" />
        <label for="password">Password</label>
        <input type="password" name="password" />
        <button type="submit">Signup</button>
      </form>
    `;
  },
});

export default Signup;
```

**Note**: though Joystick checks for the `language` field in the metadata object, _any_ field you'd like to add to your user can be set on this object (e.g., `metadata.firstName`). Any fields you pass here will be added directly to the user object in the database.

> WARNING: Only `metadata.language` is supported by SQL databases (e.g., PostgreSQL). Additional metadata fields should be added independently in your code as part of a separate table in your database.

### accounts.login

To login to an existing account, pass either an `emailAddress` or `username` along with a `password` to `accounts.login()`.

```javascript
import ui, { accounts } from "@joystick.js/ui";

const Login = ui.component({
  events: {
    "submit form": (event) => {
      accounts
        .login({
          emailAddress: event.target.emailAddress.value,
          password: event.target.password.value,
        })
        .then(() => {
          // Redirect after login.
          location.pathname = "/dashboard";
        });
    },
  },
  render: () => {
    return `
      <form>
        <label for="emailAddress">Email Address</label>
        <input type="email" name="emailAddress" />
        <label for="password">Password</label>
        <input type="password" name="password" />
        <button type="submit">Login</button>
      </form>
    `;
  },
});

export default Login;
```

If a login is succesful, two HTTP-only cookies will be created in the user's browser: `joystickLoginToken` and `joystickLoginTokenExpiresAt`. Once this exists, Joystick will automatically retrieve the user from your users database and include them in every HTTP request to the server.

### accounts.logout

If you'd like to log out an existing user, just call the `accounts.logout()` function.

```javascript
import ui, { accounts } from "@joystick.js/ui";

const Navigation = ui.component({
  events: {
    "click .logout": (event) => {
      accounts.logout();
    },
  },
  render: () => {
    return `
      <nav>
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/documents">Documents</a></li>
          <li><a href="/settings">Settings</a></li>
          <li class="logout">Logout</li>
        </ul>
      </nav>
    `;
  },
});

export default Navigation;
```

Once called, Joystick will unset the `joystickLoginToken` and `joystickLoginTokenExpiresAt` in the user's cookies.

### accounts.authenticated

If you'd like to check the authenicated status of a user, call the `accounts.authenticated()` function.

```javascript
import ui, { accounts } from "@joystick.js/ui";

const Navigation = ui.component({
  state: {
    authenticated: false,
  },
  lifecycle: {
    onMount: async (component) => {
      const authenticated = await accounts.authenticated();
      component.setState({ authenticated });
    },
  },
  render: ({ state }) => {
    return `
      <nav>
        ${state.authenticated ? `
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/documents">Documents</a></li>
            <li><a href="/settings">Settings</a></li>
            <li class="logout">Logout</li>
          </ul>
        ` : `
          <ul>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Signup</a></li>
          </ul>
        `}
      </nav>
    `;
  },
});

export default Navigation;
```

Once called, `accounts.authenticated()` will return a `true` or `false` value indicating the user's authentication status.

### accounts.user

If you'd like to retrieve the currently logged in user, call the `accounts.user()` function.

```javascript
import ui, { accounts } from "@joystick.js/ui";

const Navigation = ui.component({
  state: {
    user: null,
  },
  lifecycle: {
    onMount: async (component) => {
      const user = await accounts.user();
      component.setState({ user });
    },
  },
  render: ({ state }) => {
    return `
      <nav>
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/documents">Documents</a></li>
          <li><a href="/settings">Settings</a></li>
          <li>${state?.user?.emailAddress}</li>
        </ul>
      </nav>
    `;
  },
});

export default Navigation;
```

Once called, `accounts.user()` will return a browser-safe copy of the currently logged in user as an object. This object is identical to what's in the database with known-sensitive data removed like the `password` and `sessions`.

### accounts.recoverPassword

If a user needs to reset their password, a recovery attempt can be started using the `accounts.recoverPassword()` method. This will generate a reset token and add it to the user's `passwordResetTokens` array in your users database.

```javascript
import ui, { accounts } from "@joystick.js/ui";

const RecoverPassword = ui.component({
  events: {
    "submit form": (event) => {
      const emailAddress = event.target.emailAddress.value;
      accounts
        .recoverPassword({
          emailAddress,
        })
        .then(() => {
          window.alert(
            `Check your email address at ${emailAddress} for a reset link!`
          );
        });
    },
  },
  render: () => {
    return `
      <form>
        <label for="emailAddress">Email Address</label>
        <input type="email" name="emailAddress" />
        <button type="submit">Recover Password</button>
      </form>
    `;
  },
});

export default RecoverPassword;
```

If SMTP settings are configured in your settings.env.json file at `config.email.smtp`, Joystick will attempt to send a password reset email. **Note**: the URL used in the email assumed that you've added a route at `/reset-password/:token` and are rendering a page with a form to perform the reset.

In development, Joystick will automatically console.log() the reset token and URL to your command line for easy access during testing.

### accounts.resetPassword

Once a password reset token has been received (either via the URL sent in an email, or, logged to the command line in development).

```javascript
import ui, { accounts } from "@joystick.js/ui";

const ResetPassword = ui.component({
  events: {
    "submit form": (event, component) => {
      const password = event.target.password.value;
      const repeatPassword = event.target.repeatPassword.value;

      if (password !== repeatPassword) {
        window.alert("Passwords must match.");
        return;
      }

      accounts
        .resetPassword({
          token: component.url.params.token,
          password,
        })
        .then(() => {
          location.pathname = "/dashboard";
        });
    },
  },
  render: () => {
    return `
      <form>
        <label for="password">Password</label>
        <input type="email" name="password" />
        <label for="repeatPassword">Repeat Password</label>
        <input type="email" name="repeatPassword" />
        <button type="submit">Reset Password</button>
      </form>
    `;
  },
});

export default ResetPassword;
```

If a reset is succesful, two HTTP-only cookies will be created in the user's browser: `joystickLoginToken` and `joystickLoginTokenExpiresAt`. Once this exists, Joystick will automatically retrieve the user from your users database and include them in every HTTP request to the server.

### accounts.roles

Joystick ships with a basic roles system for performing authorization checks on users in your database. All roles are stored in the `roles` collection/table in your database. Roles granted to users are stored in the `roles` array on a user's document/row in the `users` database.

#### accounts.roles.add

Creates a new role, adding it to the `roles` collection/table in the database (a convenience so you can see which roles you've granted across all users). You do not have to call `accounts.roles.add()` before granting a role to a user. Joystick will automatically add unrecognized roles to the `roles` collection/table when they're passed to `accounts.roles.grant()`.

```javascript
import { accounts } from '@joystick.js/node';

export default {
  adminCreateRole: {
    input: {
      role: {
        type: "string",
        required: true,
      }
    },
    set: (input = {}) => {
      return accounts.roles.add(input?.role);
    },
  },
}
```

Here, we create a fictitious [setter](#setters) endpoint `adminCreateRole` which receives a role to add as an input.

#### accounts.roles.remove

Removes an existing role from the `roles` collection/table in the database as well as any users with that role in their `roles` array.

```javascript
import { accounts } from '@joystick.js/node';

export default {
  adminDeleteRole: {
    input: {
      role: {
        type: "string",
        required: true,
      }
    },
    set: (input = {}) => {
      return accounts.roles.remove(input?.role);
    },
  },
}
```

Here, we create a fictitious [setter](#setters) endpoint `adminDeleteRole` which receives a role to remove as an input.

#### accounts.roles.list

Returns a list of roles in the roles collection in the database.

```javascript
import { accounts } from '@joystick.js/node';

export default {
  adminGetRoles: {
    get: (input = {}) => {
      return accounts.roles.list();
    },
  },
}
```

Here, we create a fictitious [getter](#getters) endpoint `adminGetRoles` which retrieves a list of roles.

#### accounts.roles.grant

Adds a role to the `roles` array on a user in the database and to the `roles` collection/table if it doesn't already exist there.

```javascript
import { accounts } from '@joystick.js/node';

export default {
  signup: {
    input: {
      emailAddress: {
        type: "string",
        required: true,
      },
      password: {
        type: "string",
        required: true,
      },
      role: {
        type: "string",
        required: true,
      }
    },
    set: async (input = {}) => {
      const user = await accounts.signup({ emailAddress: input?.emailAddress, password: input?.password });
      await accounts.roles.grant(user?.userId, input?.role);
      return user;
    },
  },
}
```

Here, we create a fictitious [setter](#setters) endpoint `signup` which receives an email address, password, and role for a new user, creating the user and granting them the role passed in the input.

#### accounts.roles.revoke

Remove a role from the `roles` array on a user in the database.

```javascript
import { accounts } from '@joystick.js/node';

export default {
  demoteManager: {
    input: {
      userId: {
        type: "string",
        required: true,
      },
    },
    set: async (input = {}) => {
      await accounts.roles.revoke(input?.userId, 'manager');
      await accounts.roles.grant(input?.userId, 'employee');
      return user;
    },
  },
}
```

Here, we create a fictitious [setter](#setters) endpoint `demoteManager` which receives a `userId` and revokes the `manager` role and then grants the `employee` role.

#### accounts.roles.userHasRole

Returns true or false as to whether or not a user has a role.

```javascript
import { accounts } from '@joystick.js/node';

export default {
  adminGetRoles: {
    authorized: (input, context) => {
      return accounts.roles.userHasRole(context?.user?._id, 'admin');
    },
    get: (input = {}) => {
      return accounts.roles.list();
    },
  },
}
```

Here, we create a fictitious [getter](#getters) endpoint `adminGetRoles` which retrieves a list of roles if the logged in user—available via `context.user`—is in the admin role (the getter will only serve the request if the `authorized` function returns `true`).

## @joystick.js/ui

`@joystick.js/ui` is a standalone package for building user interfaces, designed to work on its own, or ideally, in tandem with `@joystick.js/node`.

### Writing a component

Components in `@joystick.js/ui` can be defined in one way: using the `.component()` method defined on the object exported by the package (imported in the examples here as `ui` with `ui.component()` being the function called to define a component).

```javascript
import ui from "@joystick.js/ui";

const Books = ui.component({
  render: () => {
    return `
      <div class="books">
        <h2>Bookshelf</h2>
      </div>
    `;
  },
});

export default Books;
```

The most important part of a Joystick component is the `render` property, set to a function (arrow optional as JavaScript scope is not utilized) that returns a string of HTML, written using backticks to enable JavaScript string interpolation.

The HTML written in the string is plain HTML. Any HTML that you'd write in a normal `.html` file will work and be rendered by Joystick.

To enable advanced functionality in the `render` function, JavaScript string interpolation is utilized. This allows for the evaluation (output) and execution (calling) of JavaScript variables and functions from _within_ a component's HTML.

The `render` function is passed a single argument as an object: the component instance. This gives you access to the `props` and `state` for the component as well as some render functions to aid in the rendering process.

### Render functions

Render functions are special functions in Joystick that are passed to the `render` function on a component. These help you to nest other Joystick components, render lists of content, conditionally render HTML, or, when using components in conjunction with `@joystick.js/node`, render internationalization strings.

#### component() and c()

Joystick components can be composed together using the `component()` render function (alias: `c()`):

```javascript
import ui from "@joystick.js/ui";
import Book from "../../components/Book";

const Books = ui.component({
  render: ({ component }) => {
    return `
      <div class="books">
        <h2>Bookshelf</h2>
        ${component(Book)}
      </div>
    `;
  },
});

export default Books;
```

Alternatively, an alias of `component()`, `c()`, is also passed to `render` if you wish to use a shorthand version:

```javascript
import ui from "@joystick.js/ui";
import Book from "../../components/Book";

const Books = ui.component({
  render: ({ c }) => {
    return `
      <div class="books">
        <h2>Bookshelf</h2>
        ${c(Book)}
      </div>
    `;
  },
});

export default Books;
```

Components rendered using the `component()` render function can be passed properties as an object which are assigned to the `props` property of that component's instance:

```javascript
import ui from "@joystick.js/ui";
import Book from "../../components/Book";

const Books = ui.component({
  render: ({ component }) => {
    return `
      <div class="books">
        <h2>Bookshelf</h2>
        ${component(Book, {
          title: "Awareness",
          author: "Anthony DeMello",
          year: "1992",
        })}
      </div>
    `;
  },
});

export default Books;
```

Any property (or, "prop" if you prefer) you wish can be passed to a component via the `component()` render function. Joystick does not modify or limit these values; they behave within the rules of JavaScript without exception.

#### each() and e()

To render lists of content, Joystick includes an `each()` render function:

```javascript
import ui from "@joystick.js/ui";
import Book from "../../components/Book";

const Books = ui.component({
  render: ({ each }) => {
    return `
      <div class="books">
        <h2>Bookshelf</h2>
        ${each(
          [
            { title: "Atlas Shrugged", author: "Ayn Rand", year: "1957" },
            { title: "Awareness", author: "Anthony DeMello", year: "1992" },
            {
              title: "The Rape of the Mind",
              author: "Joost Meerloo",
              year: "1961",
            },
          ],
          (book) => {
            return `
              <li>${book.title} by ${book.author} (${book.year})</li>
            `;
          }
        )}
      </div>
    `;
  },
});

export default Books;
```

The first argument to `each()` is the array or "list" of items you want to render and the second argument is a function to call for each item in the list. This function—similar to the main `render` function for the component—returns a string using backticks, within which any HTML can be rendered, or, render function can be called (e.g., if you wanted to render another Joystick component for each item in the list).

Alternatively, an alias of `component()`, `c()`, is also passed to `render` if you wish to use a shorthand version:

```javascript
import ui from "@joystick.js/ui";
import Book from "../../components/Book";

const Books = ui.component({
  render: ({ e }) => {
    return `
      <div class="books">
        <h2>Bookshelf</h2>
        ${e(
          [
            { title: "Atlas Shrugged", author: "Ayn Rand", year: "1957" },
            { title: "Awareness", author: "Anthony DeMello", year: "1992" },
            {
              title: "The Rape of the Mind",
              author: "Joost Meerloo",
              year: "1961",
            },
          ],
          (book) => {
            return `
              <li>${book.title} by ${book.author} (${book.year})</li>
            `;
          }
        )}
      </div>
    `;
  },
});

export default Books;
```

#### when() and w()

To conditionally render content, the `when()` render function can be utilized:

```javascript
import ui from "@joystick.js/ui";
import Book from "../../components/Book";

const Books = ui.component({
  render: ({ when }) => {
    const books = [];

    return `
      <div class="books">
        <h2>Bookshelf</h2>
        ${when(
          books.length === 0,
          `
          <p>No books yet.</p>
        `
        )}
      </div>
    `;
  },
});

export default Books;
```

Alternatively, an alias of `when()`, `w()`, is also passed to `render` if you wish to use a shorthand version:

```javascript
import ui from "@joystick.js/ui";
import Book from "../../components/Book";

const Books = ui.component({
  render: ({ w }) => {
    const books = [];

    return `
      <div class="books">
        <h2>Bookshelf</h2>
        ${w(
          books.length === 0,
          `
          <p>No books yet.</p>
        `
        )}
      </div>
    `;
  },
});

export default Books;
```

#### i18n() and i()

When using [internationalization]() in `@joystick.js/node`, internationalization values (or i18n for short) can be rendered via the `i18n()` render function:

```javascript
import ui from "@joystick.js/ui";
import Book from "../../components/Book";

const Books = ui.component({
  render: ({ i18n }) => {
    return `
      <div class="books">
        <h2>${i18n("books")}</h2>
      </div>
    `;
  },
});

export default Books;
```

Alternatively, an alias of `i18n()`, `i()`, is also passed to `render` if you wish to use a shorthand version:

```javascript
import ui from "@joystick.js/ui";

const Books = ui.component({
  render: ({ i }) => {
    return `
      <div class="books">
        <h2>${i("books")}</h2>
      </div>
    `;
  },
});

export default Books;
```

### Props

When rendering Joystick components, properties or "props" can be passed down to the component and accessed via the component instance.

```javascript
import ui from "@joystick.js/ui";

const Book = ui.component({
  render: ({ props }) => {
    return `
      <div class="book">
        <h2>${props.title} (${props.year})</h2>
        <h4>by ${props.author}</h4>
      </div>
    `;
  },
});

export default Book;
```

Optionally, `defaultProps` can be set on a component in the event that a prop you expected to be passed is not:

```javascript
import ui from "@joystick.js/ui";

const Book = ui.component({
  defaultProps: {
    title: 'No Title',
    year: 'Unknown Year',
    author: 'No Author',
  },
  render: ({ props }) => {
    return `
      <div class="book">
        <h2>${props.title} (${props.year})</h2>
        <h4>by ${props.author}</h4>
      </div>
    `;
  },
});

export default Book;
```

In the example above, if `title`, `year`, or `author` is not defined on `props`, Joystick will automatically assign their value to the corresponding value in `defaultProps`. Here, if `props.title` was undefined, we'd expect it to be set to "No Title."

### State

When rendering Joystick components, state can be used to render arbitrary data and control the display of the component. There are three options for interacting with state in a Joystick component:

- Setting a default value for state via the `state` property on the component.
- Setting state dynamically via the `.setState()` method on the component instance.
- Reading the current value of `state` via the component instance.

```javascript
import ui from "@joystick.js/ui";

const Books = ui.component({
  state: {
    tab: "favorites",
  },
  events: {
    "click [data-tab]": (event, component) => {
      component.setState({ tab: event.target.getAttribute("data-tab") });
    },
  },
  render: ({ state }) => {
    return `
      <div class="books">
        <ul class="tabs">
          <li data-tab="favorites" class="${
            state.tab === "favorites" ? "active" : ""
          }">Favorites</li>
          <li data-tab="recommended" class="${
            state.tab === "recommended" ? "active" : ""
          }">Recommended</li>
        </ul>
      </div>
    `;
  },
});

export default Books;
```

Changes to state automatically trigger a re-render.

If you'd like to access props or other parts of the component instance in the `state` property, you can assign it as a function returning an object:

```javascript
import ui from "@joystick.js/ui";

const Books = ui.component({
  state: ({ props }) => {
    return {
      tab: props.defaultTab,
    };
  },
  events: {
    "click [data-tab]": (event, component) => {
      component.setState({ tab: event.target.getAttribute("data-tab") });
    },
  },
  render: ({ state }) => {
    return `
      <div class="books">
        <ul class="tabs">
          <li data-tab="favorites" class="${
            state.tab === "favorites" ? "active" : ""
          }">Favorites</li>
          <li data-tab="recommended" class="${
            state.tab === "recommended" ? "active" : ""
          }">Recommended</li>
        </ul>
      </div>
    `;
  },
});

export default Books;
```

### Data

When rendering Joystick components via `@joystick.js/node`'s `res.render()` function, the `data` option on the component can be used to fetch data on the server from within a component.

This is useful for:

1. Developers that want to keep data fetching close to their components.
1. Apps that have reusable components that need to fetch the same data over and over (e.g., a navigation component that fetches the logged in user).

While this *can* be done by passing props to a component, `data` simplifies the process significantly.

```javascript
import ui from "@joystick.js/ui";

const Books = ui.component({
  data: async (api = {}, req = {}) => {
    const books = await api.get('books', {
      input: {
        category: 'non-fiction',
      },
    });

    return {
      books,
    };
  },
  render: ({ data }) => {
    return `
      <div class="books">
        ${data?.books?.length > 0 ? `
          <ul>
            ${each(data.books, (book) => {
              return `<li>${book}</li>`;
            })}
          </ul>
        ` : ''}
      </div>
    `;
  },
});

export default Books;
```

Here, we've added `data` as a function to our `Books` component. Inside of that function, as the first argument we anticipate an object `api` which gives us access to `@joystick.js/node`'s `get()` and `set()` functions and as the second argument, the inbound HTTP request as `req`.

> Note: this function _will only be called when rendering the component on the server_. **The `data` option is completely ignored in the browser.** Joystick automatically hydrates components on the client with the data it retrieves on the server.

Inside, we call to `api.get()` to retrieve the data we need, returning an object from the `data` function. In our `render()` function now (and anywhere the `component` instance is accessible to us), we'll have access to the data we fetched via the `data` property on the component instance.

Here, we treat `data.books` just like we would `state.books` or `props.books` in our `render()`. The difference is that our data is coming from the value returned by the `data` function.

#### Refetching Data

The `data` option is designed to only fetch data once on render. If you're building a dynamic app with Joystick (e.g., an internal dashboard or a social media site with live data), you can refetch data on-demand via the  `data.refetch` function:

```javascript
import ui from "@joystick.js/ui";

const Books = ui.component({
  data: async (api = {}, req = {}, input = {}) => {
    const books = await api.get('books', {
      input: {
        category: 'non-fiction',
        page: input?.page || 1,
      },
    });

    return {
      books,
    };
  },
  events: {
    'click .refetch': (event, component) => {
      // NOTE: Here, we're simulating a pagination call saying "go get page 2" of
      // the books list. The object passed here is available as the the third
      // argument to the data function on your component when calling data.refetch.
      component.data.refetch({ page: 2 });
    },
  },
  render: ({ data }) => {
    return `
      <div class="books">
        ${data?.books?.length > 0 ? `
          <ul>
            ${each(data.books, (book) => {
              return `<li>${book}</li>`;
            })}
          </ul>
        ` : ''}
        <button class="refetch">Get the latest books</button>
      </div>
    `;
  },
});

export default Books;
```

Here, we've added a button with the class `refetch` and event listener for that button's `click` event. When clicked, we call to `data.refetch` (here, we're pulling `data` from the component instance passed to event handlers), passing in an object of `input` that we can reference from within our `data` function (helpful for passing new input/params to get different data on the server).

### Lifecycle methods

There are three lifecycle methods (functions that are called at different stages of a component's life):

- `onBeforeMount` which is called before a component's HTML is mounted to the DOM.
- `onMount` immediately after a component's HTML is mounted to the DOM.
- `onBeforeUnmount` immediately before a component is unloaded from the DOM.

Lifecycle methods can be assigned via the `lifecycle` property on a component:

```javascript
import ui from "@joystick.js/ui";

const Books = ui.component({
  lifecycle: {
    onBeforeMount: () => {
      console.log("About to mount!");
    },
    onMount: () => {
      console.log("Mounted!");
    },
    onBeforeUnmount: () => {
      console.log("About to unmount!");
    },
  },
  render: () => {
    return `
      <div class="books">
        <h2>Books</h2>
      </div>
    `;
  },
});

export default Books;
```

All lifecycle method functions are passed the component instance as their first argument. Keep in mind: values available to properties on the component instance may vary based on the current stage of the component's lifecycle.

### Methods

Arbitrary functions can be assigned to a Joystick component and called via the `.methods` property on the component instance.

```javascript
import ui from "@joystick.js/ui";

const Greeting = ui.component({
  state: {
    name: "Merritt",
  },
  methods: {
    handleSayHello: (component) => {
      window.alert(`Hello, ${component.state.name}!`);
    },
  },
  events: {
    "click button": (event, component) => {
      component.methods.handleSayHello();
    },
  },
  render: () => {
    return `
      <button>Say Hello</button>
    `;
  },
});

export default Greeting;
```

### DOM Events

DOM events can be handled by assigning functions via the `events` property on a component.

```javascript
import ui from "@joystick.js/ui";

const Form = ui.component({
  events: {
    "keyup input": (event) => {
      console.log(event.target.value);
    },
    "click button": () => {
      window.alert("Clicked the button!");
    },
  },
  render: () => {
    return `
      <form>
        <input type="text" />
        <button>Add name</button>
      </form>
    `;
  },
});

export default Form;
```

DOM events are assigned by passing a string containing a type of DOM event to listen for, followed by a space, and then a DOM selector (e.g., a class name, an element, etc.) as the key on the events object, assigned a function to call when the event occurs.

In the example above, when a keyup event occurs on the input rendered in the `render` function, the function assigned to `keyup input` will be called.

All DOM events are automatically scoped to your component.

### CSS

Styles can be added to the HTML rendered by your component via the `css` property.

```javascript
import ui from "@joystick.js/ui";

const Form = ui.component({
  css: `
    form {
      background: #eee;
      padding: 20px;
      border-radius: 3px;
    }

    form input {
      border: none;
      background: #fff;
      padding: 20px;
      border-radius: 3px;
      border: 1px solid #eee;
    }

    form button {
      background: #333;
      border: none;
      padding: 15px;
      font-size: 16px;
      color: #fff;
      border-radius: 3px;
    }
  `,
  render: () => {
    return `
      <form>
        <input type="text" />
        <button>Add name</button>
      </form>
    `;
  },
});

export default Form;
```

CSS is dynamically scoped to your component, isolating styles to the component (avoiding issues with cascading or "leaky" styles).

If you need to access the component instance to influence your styles, you can set the `css` property to a function returning a string (using backticks to interpolate any values in your CSS).

```javascript
import ui from "@joystick.js/ui";

const Form = ui.component({
  state: {
    enabled: true,
  },
  css: ({ state }) => `
    form {
      background: ${state.enabled ? "#fff" : "#eee"};
      padding: 20px;
      border-radius: 3px;
    }

    form input {
      border: none;
      background: #fff;
      padding: 20px;
      border-radius: 3px;
      border: 1px solid #eee;
    }

    form button {
      background: #333;
      border: none;
      padding: 15px;
      font-size: 16px;
      color: #fff;
      border-radius: 3px;
    }
  `,
  render: () => {
    return `
      <form>
        <input type="text" />
        <button>Add name</button>
      </form>
    `;
  },
});

export default Form;
```

### Global State

`@joystick.js/ui` includes a global state library called Cache. Similar to popular libraries like Redux, Cache allows you to create a "store" or "cache" for storing global data. It features a simple API for getting, setting, and unsetting data from a cache as well as listening for changes to a cache.

A cache can be defined by importing the named `cache` export from `@joystick.js/ui`:

```javascript
import ui, { cache } from '@joystick.js/ui';

const appCache = cache('app', {});

const Count = ui.component({
  state: {
    count: 0,
  },
  render: ({ state }) => {
    return `
      <div>
        <p>Count: ${state.count}</p>
        <button class="add">Add</button>
        <button class="subtract">Subtract</button>
        <button class="delete">Delete</button>
      </div>
    `;
  },
});

export default Count;
```

Above, we create our cache with `cache('app', {});`, passing `'app'` as the name of the cache and `{}` as a default value. Here, we store our cache instance in a variable `appCache` that we can access throughout our component.

> NOTE: The root value of a cache should always be an object.

#### Updating the cache

A cache can be updated via the `.set()` method defined on the cache instance:

```javascript
import ui, { cache } from '@joystick.js/ui';

const appCache = cache('app', {});

const Count = ui.component({
  state: {
    count: 0,
  },
  events: {
    'click .add': (event, component) => {
      appCache.set((state = {}) => {
        return {
          ...state,
          count: (state.count || 0) + 1,
        };
      }, 'ADD');
    },
    'click .subtract': (event, component) => {
      appCache.set((state = {}) => {
        return {
          ...state,
          count: state?.count > 0 ? state.count - 1 : 0,
        };
      }, 'SUBTRACT');
    },
  },
  render: ({ state }) => {
    return `
      <div>
        <p>Count: ${state.count}</p>
        <button class="add">Add</button>
        <button class="subtract">Subtract</button>
        <button class="delete">Delete</button>
      </div>
    `;
  },
});

export default Count;
```

The `.set()` method receives a callback function as its first argument. That callback function receives the current `state` of the cache. To update the cache, return an object representing the modified state of the cache from the callback function.

In the example above, we use the `...` spread operator to "copy" the contents of the existing state onto the new object being returned from our callback function, modifying the `count` field in response to either the `.add` or `.subtract` button being clicked.

> NOTE: Optionally, the `.set()` function can receive a second argument which is a string containing the name of the event. This can be any name you'd like (above we're using `'ADD'` and `'SUBTRACT'`) and is intended as a means for identifying specific changes to a cache when listening for changes *to* that cache (more on this below).

#### Unsetting the cache

To unset a specific value, the `.unset()` method can be called on a cache with a specific path like `appCache.unset('count')` (nested values can be accessed via dot notation like `appCache.unset('thing.i.want.to.unset')`). 

Alternatively, to unset the _entire_ cache, just call `appCache.unset()` without a path.

#### Getting data from the cache

Getting data from the cache can be done via the `.get()` method on the cache instance. For example, calling `appCache.get()` will get the entire cache, or, if you want to retrieve a specific value, a path can be passed like `appCache.get('count')` (dot notation can be used to access nested paths like `appCache.get('path.to.thing.i.want')`). 

#### Listening for cache changes

If you need to listen for or "subscribe" to changes to a cache, you can utilize a cache's `.on()` method:

```javascript
import ui, { cache } from '@joystick.js/ui';

const appCache = cache('app', {});

const Count = ui.component({
  state: {
    count: 0,
  },
  lifecycle: {
    onMount: (component = {}) => {
      appCache.on('change', (state = {}, event = '', typeOfChange = '') => {
        console.log({ state, event, typeOfChange });

        // NOTE: As an example, take the count value from appCache and put it on
        // to the local component state whenever a change occurs.
        component.setState({ count: state?.count || 0 });
      });
    },
  },
  events: { ... },
  render: ({ state }) => {
    return `
      <div>
        <p>Count: ${state.count}</p>
        <button class="add">Add</button>
        <button class="subtract">Subtract</button>
        <button class="delete">Delete</button>
      </div>
    `;
  },
});

export default Count;
```

Above, in our component's `lifecycle.onMount` function, we've added a call to `appCache.on('change')`. Whenever there's a change to a cache, the callback function passed as the second argument to `.on()` will be called, passing three values:

1. The new `state` of the cache.
2. If passed, the `event` that took place (e.g., `ADD` or `SUBTRACT`).
3. The `typeOfChange` (either `set` or `unset`).

In the example above, we copy the global `count` from our `appCache` over to our component's local state, rendering the value in the component.

> NOTE: If you only want to listen for a _specific_ type of change, you can also listen to `appCache.on('set')` and `appCache.on('unset')` with the above behavior being the same.

### Form Validation

If you need to validate a user's form input in your components, `@joystick.js/ui` includes a built-in, real-time form validator with several built in validation functions and dynamic error message rendering.

```javascript
import ui, { accounts } from '@joystick.js/ui';

const Login = ui.component({
  events: {
    'submit form': (event, component) => {
      event.preventDefault();
      component.validateForm(event.target, {
        rules: {
          emailAddress: {
            required: true,
          },
          password: {
            required: true,
          },
        },
        messages: {
          emailAddress: {
            required: 'Email address is required.',
          },
          password: {
            required: 'Password is required.',
          }
        },
      }).then(() => {
        accounts.login({
          emailAddress: event.target.emailAddress.value,
          password: event.target.password.value,
        }).then(() => {
          location.pathname = '/dashboard';
        });
      }).catch(() => {});
    },
  },
  render: () => {
    return `
      <form>
        <div class="row">
          <div class="col-xs-12 col-lg-5 col-xl-4">
            <div class="mb-3">
              <label class="form-label">Email Address</label>
              <input class="form-control" type="email" name="emailAddress" placeholder="Email Address" />
            </div>
            <div class="mb-4">
              <label class="form-label">Password</label>
              <input class="form-control" type="password" name="password" placeholder="Email Address" />
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-primary">
                Log In
              </button>
            </div>
          </div>
        </div>
      </form>
    `;
  },
});

export default Login;
```

The form validator is accessed via the component instance as `component.formValidator()`. It takes two arguments: the DOM element representing the `<form></form>` you wish to validate and an options object containing the validation rules and error messages to render if the user's input fails validation.

On the options object, the `rules` property is set to an object where each of its properties corresponds to the `name` attribute on some input in your form. Set to that property is another object containing the rules for that field.

When `component.validateForm()` is called, it will attempt to validate the form per the rules you've specified. If it succeeds, it will resolve the JavaScript Promise it returns (meaning you can handle any post-validation work in the `.then()` callback of `component.validateForm()`). If it fails, error messages will automatically be rendered beneath the offending inputs and the JavaScript Promise returned is rejected (meaning you can handle any failure in the `.catch()` callback of `component.validateForm()`).

Currently, `component.validateForm()` offers the following validation rules:

<table>
  <thead>
    <tr>
      <th>Rule name</th>
      <th>Possible value(s)</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>creditCard</td>
      <td>Boolean <code>true</code> or <code>false</code></td>
      <td>Validates whether the field's input contains a valid credit card number.</td>
    </tr>
    <tr>
      <td>email</td>
      <td>Boolean <code>true</code> or <code>false</code></td>
      <td>Validates whether the field's input contains a valid email address.</td>
    </tr>
    <tr>
      <td>equals</td>
      <td>Some value to compare with the user's input (e.g., a string).</td>
      <td>Validates whether the field's input is equal to the rule's value.</td>
    </tr>
    <tr>
      <td>matches</td>
      <td>Some value to compare with the user's input (e.g., a string).</td>
      <td>Validates whether the field's input matches (in value and type) the rule's value.</td>
    </tr>
    <tr>
      <td>maxLength</td>
      <td>An integer</td>
      <td>Validates whether the field's input is less than or equal to the rule's value.</td>
    </tr>
    <tr>
      <td>minLength</td>
      <td>An integer</td>
      <td>Validates whether the field's input is greater than or equal to the rule's value.</td>
    </tr>
    <tr>
      <td>phone</td>
      <td>Boolean <code>true</code> or <code>false</code></td>
      <td>Validates whether the field's input is a telephone number.</td>
    </tr>
    <tr>
      <td>postalCode</td>
      <td>Boolean <code>true</code> or <code>false</code> or <code>Object</code> with an <code>ISO</code> property as a <code>String</code> and <code>rule</code> property as a Boolean <code>true</code> or <code>false</code>.</td>
      <td>Validates whether the field's input is a postal code (zip code). If defined as an object, regex will be set to the postal code pattern for the specified <a href="https://gist.github.com/jamesbar2/1c677c22df8f21e869cca7e439fc3f5b">ISO code</a>.</td>
    </tr>
    <tr>
      <td>required</td>
      <td>Boolean <code>true</code> or <code>false</code></td>
      <td>Validates whether the field's input exists or not.</td>
    </tr>
    <tr>
      <td>semVer</td>
      <td>Boolean <code>true</code> or <code>false</code></td>
      <td>Validates whether the field's input is a <a href="https://semver.org/">semantic version</a>.</td>
    </tr>
    <tr>
      <td>slug</td>
      <td>Boolean <code>true</code> or <code>false</code></td>
      <td>Validates whether the field's input is a slug <code>a-slug-like-this</code>.</td>
    </tr>
    <tr>
      <td>strongPassword</td>
      <td>Boolean <code>true</code> or <code>false</code></td>
      <td>Validates whether the field's input confirms to the <a href="https://www.npmjs.com/package/validator"><code>isStrongPassword</code> function from the <code>validator</code> dependency</a> used by <code>validateForm</code>.</td>
    </tr>
    <tr>
      <td>url</td>
      <td>Boolean <code>true</code> or <code>false</code></td>
      <td>Validates whether the field's input is a valid URL.</td>
    </tr>
    <tr>
      <td>vat</td>
      <td>Boolean <code>true</code> or <code>false</code> or <code>Object</code> with an <code>ISO</code> property as a <code>String</code> and <code>rule</code> property as a Boolean <code>true</code> or <code>false</code>.</td>
      <td>Validates whether the field's input is a valid VAT code. If defined as an object, regex will be set to the postal code pattern for the specified <a href="https://gist.github.com/marcinlerka/630cc05d11bb10c5f1904506ff92abcd">ISO code</a>.</td>
    </tr>
  </tbody>
</table>

### Accessing URL and query params

When using `@joystick.js/ui` with `@joystick.js/node`, current URL information is available via the `url` property on the component instance.

There are three properties available on `url`:

- `url.params` an object containing any route parameters and their values (determined by the route rendering the current component on the server). For example, a route like `/posts/:postId` would get a params value like `{ postId: 'abc123' }` when visting the URL `/posts/abc123` in your app.
- `url.query` an object containing any query parameters from the URL, irrespective of the current route. For example, a URL like `/posts?category=featured` would get a query value like `{ category: 'featured' }`.
- `url.isActive()` a function that takes a path to compare the current active URL against, returning a boolean `true` if there is a match or `false` if there is not.

Example usage of `url` in a Joystick component:

```javascript
import ui from "@joystick.js/ui";

const Navigation = ui.component({
  render: ({ url }) => {
    return `
      <nav>
        <ul>
          <li class="${url.isActive("/") ? "active" : ""}">
            <a href="/">Home</a>
          </li>
          <li class="${url.isActive("/about") ? "active" : ""}">
            <a href="/about">About</a>
          </li>
        </ul>
      </nav>
    `;
  },
});

export default Navigation;
```

### Writing comments

If you need to add a comment for clarification to your code, or, temporarily remove some HTML rendered by your component, you can wrap it with a standard HTML comment (`<!-- <code to comment here> -->`):

```javascript
import ui from "@joystick.js/ui";

const Navigation = ui.component({
  render: ({ url }) => {
    return `
      <nav>
        <ul>
          <!-- <li class="${url.isActive("/") ? "active" : ""}">
            <a href="/">Home</a>
          </li> -->
          <li class="${url.isActive("/about") ? "active" : ""}">
            <a href="/about">About</a>
          </li>
        </ul>
      </nav>
    `;
  },
});

export default Navigation;
```

### Accessing the DOM Node

If you're working with third-party packages or trying to manipulate the DOM directly, you may need to access the rendered DOM node that represents your component in the browser. In `@joystick.js/ui`, all components are rendered inside of a wrapper `<div></div>` with a `js-c` attribute set to a unique ID for that component. This `<div></div>` represents the "boundary" for your component in the rendered HTML (what Joystick sets as the DOM node).

The DOM node for your component can be accessed via the component instance's `DOMNode` property, like this:

```javascript
import ui from '@joystick.js/ui';

const Map = ui.component({
  lifecycle: {
    onMount: (component) => {
      const map = component.DOMNode.querySelector('#map');
    },
  },
  render: () => {
    return `
      <div>
        <div id="map"></div>
      </div>
    `;
  },
});
```

The `component.DOMNode` property is accessible in _all_ locations where the `component` instance is passed, however, it's best utilized in the `lifecycle.onMount` method and `events` handler methods. **The one exception to this is the `lifecycle.onBeforeMount` method where the DOM node does not yet exist**.

## @joystick.js/node

`@joystick.js/node` is a standalone package for building a back-end with Node.js and Express.js, designed to work on its own, or ideally, in tandem with `@joystick.js/ui`.

### Defining an app

The `@joystick.js/node` package exports an object containing a `app` property equal to a function (typically acessed as `node.app()` in code). This function automatically starts an Express.js server, registering your routes and API endpoints in the process.

```javascript
import node from "@joystick.js/node";

node.app({
  api: {
    getters: {
      posts: {
        input: {
          category: {
            type: "string",
            required: false,
          },
        },
        get: (input, context) => {
          return context.mongodb.collection("Documents").findOne();
        },
      },
    },
    setters: {
      createPost: {
        input: {
          title: {
            type: "string",
            required: true,
          },
        },
        set: (input) => {
          return context.mongodb.collection("posts").insertOne(input);
        },
      },
    },
  },
  routes: {
    "/": (req, res) => {
      res.render("ui/pages/index/index.js");
    },
  },
});
```

#### Accessing the Express instance

If you need to access the Express.js instance that Joystick creates for you (e.g., for attaching a GraphQL API or a Websocket server), the `node.app()` function returns a JavaScript Promise which is passed an object containing the Express.js `app` instance and `http` server.

```javascript
import node from '@joystick.js/node';

node.app({
  ...
}).then((express) => {
  // Write any code that utilizes the Express instance here...
});
```

### Middleware

There are two types of middleware (functions that run before an HTTP request is handed off to one of your matching routes) supported in `@joystick.js/node`: built-in middleware and custom middleware that you add on your own.

`@joystick.js/node` currently runs the following Middleware on your behalf:

<table>
  <thead>
    <tr>
      <th>Middleware Name</th>
      <th>Version</th>
      <th>Package/Proprietary</th>
      <th>Settings Path</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>compression</td>
      <td>1.7.4</td>
      <td><a href="https://www.npmjs.com/package/compression">View on NPM</a></td>
      <td>config.middleware.compression</td>
      <td>Attempts to compress response bodies for all request that traverse through the middleware.</td>
    </tr>
    <tr>
      <td>serve-favicon</td>
      <td>2.5.0</td>
      <td><a href="https://www.npmjs.com/package/serve-favicon">View on NPM</a></td>
      <td>N/A</td>
      <td>Properly maps all requests for your favicon.ico file to avoid HTTP 404 errors.</td>
    </tr>
    <tr>
      <td>cookie-parser</td>
      <td>1.4.5</td>
      <td><a href="https://www.npmjs.com/package/cookie-parser">View on NPM</a></td>
      <td>N/A</td>
      <td>Parses the HTTP `cookie` header into a JavaScript object and makes it accessible on the Express `req` object.</td>
    </tr>
    <tr>
      <td>body-parser</td>
      <td>N/A</td>
      <td><a href="https://expressjs.com/en/resources/middleware/body-parser.html">View Documentation</a></td>
      <td>config.middleware.bodyParser</td>
      <td>Parses the HTTP request `body` into the format specified in the `application/content-type` header. Note: version used is the one bundled with Express.js, not the standalone package.</td>
    </tr>
    <tr>
      <td>cors</td>
      <td>2.8.5</td>
      <td><a href="https://www.npmjs.com/package/cors">View on NPM</a></td>
      <td>config.middleware.cors</td>
      <td>Aids in the configuration of the CORS (cross-origin resource sharing) policy for the server. This defines what URLs can access the server remotely and blocks unauthorized access.</td>
    </tr>
  </tbody>
</table>

#### Configuring built-in middleware

Built-in middleware listed in the table above can be configured via your application's `settings.<env>.json` file at the root of your project (where `<env>` is replaced with the name of the environment those settings apply to).

All built-in middleware can be configured via the `config.middleware` object in your settings file (see the "Settings Path" column in the table above for the correct name/path as well as which middleware are configurable):

```javascript
{
  "config": {
    ...
    "middleware": {
      bodyParser: {
        limit: '50mb',
      },
    },
    ...
  },
  "global": {},
  "public": {},
  "private": {}
}
```

For middleware that _are_ configurable, please refer to the documentation for that middleware for configuration options (Joystick just passes these along without modification).

#### Adding custom middleware

If you wish, custom middleware can be added as an option passed to `node.app()` when setting up your Joystick app:

```javascript
import node from "@joystick.js/node";

node.app({
  middleware: [
    (req, res, next) => {
      // Custom implementation here...
    },
    someMiddleWarePackage(),
  ],
});
```

`middleware` should be passed as an array containing functions which expect to be called receiving the standard Express.js route arguments: `req`, `res`, and `next`. Middleware can be from a third-party package, or, a custom middleware that you implement yourself.

<h3 id="node-routes">Routes</h3>

Routes are the URLs supported by your application. In Joystick, the only routes you will need to define for your app will be on the server here as part of your `node.app()` options (i.e., Joystick does not have a separate client and server router—just one set of routes that rely on the traditional behavior of HTTP).

#### Defining routes

Routes are defined on the server-side as part of the options you pass to your `node.app()` instance, inside of your app's `index.server.js` file (generated by `@joystick.js/cli` when running `joystick create <app>`).

```javascript
import node from "@joystick.js/node";

node.app({
  routes: {
    "/dashboard": (req, res) => {
      res.send("Dashboard");
    },
  },
});
```

By default, all routes are defined as HTTP GET requests using the Express `app.get()` method. No changes are made to how Express handles the route, save for a hijacking of the `res.render()` method (more on this below) for rendering Joystick components.

#### Defining routes for specific HTTP methods

If you want to define routes in your app that use another HTTP method other than GET, your route can be defined as an object with an accompanying `method` (single HTTP method) or `methods` (multiple HTTP methods) field:

```javascript
import node from "@joystick.js/node";

node.app({
  routes: {
    "/newsletter": {
      method: "POST",
      handler: (req, res) => {
        console.log(req.body.emailAddress);
        res.send("Subscribed!");
      },
    },
  },
});
```

If you want to support more than one custom HTTP method:

```javascript
import node from "@joystick.js/node";

node.app({
  routes: {
    "/newsletter": {
      methods: ["POST", "PUT"],
      handler: (req, res) => {
        // Check req.method here to decide which code to run.
        console.log(req.body.emailAddress);
        res.send("Subscribed!");
      },
    },
  },
});
```

#### req.context.ifLoggedIn()

If you need to respond to a request to a route based on the user's "logged in" status, you can use the `req.context.ifLoggedIn()` helper:

```javascript
import node from "@joystick.js/node";

node.app({
  routes: {
    "/login": (req, res) => {
      req.context.ifLoggedIn("/dashboard", () => {
        res.send("Login");
      });
    },
  },
});
```

This helper is best read as "if the user is already logged in, redirect them to this route, otherwise, run the code in the callback (i.e., respond to the request as normal)."

#### req.context.ifNotLoggedIn()

If you need to respond to a request to a route based on the user's "logged out" status, you can use the `req.context.ifNotLoggedIn()` helper:

```javascript
import node from "@joystick.js/node";

node.app({
  routes: {
    "/dashboard": (req, res) => {
      req.context.ifNotLoggedIn("/login", () => {
        res.send("Dashboard");
      });
    },
  },
});
```

This helper is best read as "if the user is NOT logged in, redirect them to this route, otherwise, run the code in the callback (i.e., respond to the request as normal)."

#### res.render()

As a full-stack framework, `@joystick.js/node` is designed to work exclusively with `@joystick.js/ui` components. The `res.render()` method is the "magic" that connects the two together.

##### Rendering a page

In order to render a Joystick component that represents a page (typically, placed in the `ui/pages` directory in your app), call `res.render()` passing the full, relative path to your component:

```javascript
import node from "@joystick.js/node";

node.app({
  routes: {
    "/dashboard": (req, res) => {
      res.render("ui/pages/dashboard/index.js");
    },
  },
});
```

When this code runs, Joystick will automatically server-side render the component at that path and bundle the necessary JavaScript files together, injecting the end result into your app's `index.html` file and responding to the request with the resulting HTML.

As part of the server-side rendering process, Joystick will automatically build out the scoped CSS for your components and inject it into the `<head></head>` tag for your HTML to ensure users get the experience you intend on first paint in the browser (read: no Flash of Unstyled Content).

##### Rendering in a layout

As part of Joystick's file structure, you will find a `/ui/layouts` folder. This folder should contain Joystick components that represent layouts for your app. A layout is a "wrapper" component that contains always-visible elements like a navigation bar or footer with a space to render the contents of the current page.

> WARNING: Layouts should only be rendered by the res.render() function's layout option. Though they *can* be nested inside of other Joystick components (e.g., a page), this breaks Joystick's rendering model leading to unwanted bugs.
>
> If you need to create a reusable layout that's nestable, it's recommended that you create a component in `/ui/components` that receives a page prop and renders it via the component render function, like this: `${component(props.page, props)}`.

```javascript
import node from "@joystick.js/node";

node.app({
  routes: {
    "/dashboard": (req, res) => {
      res.render("ui/pages/dashboard/index.js", {
        layout: "ui/layouts/authenticated/index.js",
      });
    },
  },
});
```

In this example, we assume a `ui/layouts/authenticated/index.js` file exists which is the layout used when a user is _logged in_ or _authenticated_ (just an example here; this is NOT built in to Joystick). In that file, we'd expect to see something like this:

```javascript
import ui from "@joystick.js/ui";

const Authenticated = ui.component({
  render: ({ props, url, component }) => {
    return `
      <nav>
        <ul>
          <li class="${url.isActive("/dashboard") ? "active" : ""}">
            <a href="/dashboard">Dashboard</a>
          </li>
          <li class="${url.isActive("/documents") ? "active" : ""}">
            <a href="/documents">Documents</a>
          </li>
          <li class="${url.isActive("/settings") ? "active" : ""}">
            <a href="/settings">Settings</a>
          </li>
        </ul>
      </nav>
      ${component(props.page, props)}
    `;
  },
});

export default Authenticated;
```

Here, we anticipate a `props.page` prop to be passed to the layout by Joystick (this contains the component passed to `res.render()` when a `layout` is set). Notice that we re-use the standard `component()` render function to output the respective page into the layout.

##### Passing props to res.render()

Initial props to include in the server-side rendered HTML returned by `res.render()` can be passed via the options object.

```javascript
import node from "@joystick.js/node";

node.app({
  routes: {
    "/dashboard": (req, res) => {
      res.render("ui/pages/dashboard/index.js", {
        props: {
          stats: [
            { value: "100", label: "Active Customers" },
            { value: "$28,798", label: "30-Day Revenue" },
            { value: "3", label: "Open Support Requests" },
          ],
        },
      });
    },
  },
});
```

##### Setting SEO metadata in rendered HTML

For pages rendered with `res.render()` that require custom SEO metadata in the `<head></head>` tag of the rendered HTML, the `head` property can be leveraged in the options object passed to `res.render()`. The `head` property supports three properties: `title`, `tags`, and `jsonld`.

`title`

The `head.title` property contains the value to be set in the `<title></title>` tag inside of the `<head></head>` tag.

`tags`

The `head.tags` property contains an object supporting three properties: `meta`, `link`, and `script`. Each property is set to an array of objects, with each object representing the HTML attributes to set on a tag of that type (e.g., objects in the `head.tags.meta` array represent `<meta />` tags to add to the `<head></head>`).

`jsonld`

The `head.jsonld` property contains an object containing [JSON-LD](https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data) properties to be rendered into a `<script></script>` tag with a `type` attribute equal to `application/ld+json`.

```javascript
node.app({
  api,
  routes: {
    "/recipes": (req, res) => {
      res.render("ui/pages/recipes/index.js", {
        layout: "ui/layouts/site/index.js",
        head: {
          title: "Sushi Recipes",
          tags: {
            meta: [
              { name: 'description', content: 'Recipes for preparing authentic Japanese sushi at home.' },
            ],
            link: [
              { rel: 'stylesheet', href: '/fonts.css' },
            ],
            script: [
              { src: 'https://kit.fontawesome.com/d91Zfc923L.js', crossorigin: 'anonymous' },
            ],
          },
          jsonld: {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            name: "Sushi Recipes",
            author: {
              "@type": "Person",
              name: "Oliver Nguyen",
            },
            datePublished: "2021-11-10",
            description:
              "Recipes for preparing authentic Japanese sushi at home.",
          },
        },
      });
    },
  },
});
```

When a user visits `/recipes` in the example above, the data in the `head` object will be automatically rendered into the `<head></head>` tag of the HTML for that page.

### API

To simplify the process of defining an API, Joystick includes a thin abstraction layer over Express.js for creating endpoints. It's based on the idea that all data in your application is either you "getting" something or "setting" something in a database.

Following this logic, Joystick introduce a concept called "getters" and "setters." The former helps you define HTTP GET endpoints for _reading_ data from your database while the latter helps you define HTTP POST endpoints for _creating, updating, and removing_ data from your database.

Getters are available at `/api/_getters/<getterName>` and setters are available at `/api/_setters/<setterName>`. This means that, if you wish, you can access getters and setters via `fetch()`, curl, or any other HTTP request tool with ease.

#### Getters

A getter is nothing more than a JavaScript object set to a property with the name of the getter you'd like to make accessible on the server.

```javascript
export default {
  posts: {
    input: {
      category: {
        type: "string",
      },
    },
    get: async (input, context) => {
      const query = {};

      if (input.category) {
        query.category = input.category;
      }

      const posts = await context.mongodb.collection("posts").find().toArray();

      return posts;
    },
  },
};
```

Here, we define a getter called `posts` with two properties: `input`, set to an object that defines validation for any input values passed from the browser when calling the getter and `get`, a function which receives the validated `input` as its first argument and a `context` object as the second argument.

A getter is intended to retrieve and return data. Once inside the body of the `get()` function, you can retrieve your data from any data source you wish (typically a database, but could also be from a third-party API or a static data file on the server).

Once your data is retrieved, you return it from the `get()` function and Joystick sends it back to the originating request as a JSON body.

#### Setters

A setter is nothing more than a JavaScript object set to a property with the name of the setter you'd like to make accessible on the server.

```javascript
export default {
  createPost: {
    input: {
      title: {
        type: "string",
        required: true,
      },
    },
    set: async (input, context) => {
      const postId = joystick.id();

      await context.mongodb.collection("posts").insertOne({
        _id: joystick.id(),
        ...input,
      });

      return {
        _id: postId,
      };
    },
  },
};
```

Here, we define a setter called `createPost` with two properties: `input`, set to an object that defines validation for any input values passed from the browser when calling the setter and `set`, a function which receives the validated `input` as its first argument and a `context` object as the second argument.

A setter is intended to create, update, and delete data, and optionally return data. Once inside the body of the `set()` function, you can call to any data source you wish (typically a database, but could also be from a third-party API or a static data file on the server).

Once your data is set, you can optionally return a value from the `set()` function and Joystick will send it back to the originating request as a JSON body.

#### Accessing getters and setters as HTTP endpoints

As hinted above, getters and setters can be accessed as plain HTTP endpoints. While in most cases you'll want to use Joystick's `get()` and `set()` methods for interacting with endpoints, if you're building a separate app (e.g., a mobile app) and using Joystick as a backend, it can be helpful to rely on this access method.

For getters, the inbound request must be an HTTP GET request. Any `input` or `output` parameters must be passed via the _query_ parameters in the URL. For example, if we had a getter called `books` in our app that expected an input value `category`, we could perform a direct URL request like this:

```javascript
http://localhost:2600/api/_getters/books?input={"category":"non-fiction"}
```

Similarly, an `output` query parameter can be added to customize the return value from the getter.

For setters, the inbound request must be an HTTP POST request. Any `input` or `output` parameters must be pased via the _body_ of the request. This means that, unlike in the getters example above, if we expected input, we would have to use a tool like cURL or another HTTP library instead of accessing the URL directly in the browser.

#### Validating inputs

Joystick uses a built-in validation library for validating inputs passed from the browser to the server as part of a call to a getter or setter.

Validation rules are defined using a nested object structure (written to mimic the structure of the data you're passing from the browser) along with a few different properties to set the rules for your inputs.

A validation object looks like this:

```javascript
{
  title: {
    type: "string",
    required: true,
  }
}
```

Here, `title` is the name of the field we want to validate. We expect it to have a data type of `string` and require it to be passed in the input.

The object assigned to the field name is known as the validator, while the properties on that object are known as the rules _for_ that validator.

Currently, a validator can define the following rules:

<table>
  <thead>
    <tr>
      <th>Rule name</th>
      <th>Values</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>allowedValues</td>
      <td>An array of values as: strings, integers, floats, or booleans.</td>
      <td>An enumerable (enum) list of values that are allowed to be passed for the field.</td>
    </tr>
    <tr>
      <td>element</td>
      <td>A validator object that describes the contents of each item in an array.</td>
      <td>Only required when `type` is equal to `array`. Defines the shape of an element expected in the array.</td>
    </tr>
    <tr>
      <td>fields</td>
      <td>A validator object that describes the contents of an object.</td>
      <td>Only required when `type` is equal to `object`. Defines the shape of an object passed as the value for an input field.</td>
    </tr>
    <tr>
      <td>max</td>
      <td>A maximum value expressed as an integer or float.</td>
      <td>Set a maximum value for the field as a number (integer or float).</td>
    </tr>
    <tr>
      <td>min</td>
      <td>A minimum value expressed as an integer or float.</td>
      <td>Set a minimum value for the field as a number (integer or float).</td>
    </tr>
    <tr>
      <td>optional</td>
      <td>A boolean `true` or `false`.</td>
      <td>Specifies whether or not a field is optional. If set to `false`, a value is required.</td>
    </tr>
    <tr>
      <td>regex</td>
      <td>A regular expression expressed as a `/thing/g` regular expression, or, a JavaScript RegExp object.</td>
      <td>Validates whether the field value conforms to the regular expression.</td>
    </tr>
    <tr>
      <td>required</td>
      <td>A boolean `true` or `false`.</td>
      <td>Specifies whether or not a field is required. If set to `false`, a value is optional.</td>
    </tr>
    <tr>
      <td>type</td>
      <td>As a JavaScript string, one of: <code>any</code>,<code>array</code>, <code>boolean</code>, <code>float</code>, <code>integer</code>, <code>number</code>, <code>object</code>, or <code>string</code>.</td>
      <td>The expected type of data for the field to contain.</td>
    </tr>
  </tbody>
</table>

Validator objects can be composed together to create complex validation. For example, consider the following input:

```javascript
input: {
  name: "Trent Rezor",
  instruments: ["piano", "guitar", "vocals", "kazoo"],
  albums: [
    { title: 'The Downward Spiral', year: '1994' },
    { title: 'The Fragile', year: '1999' },
    { title: 'Broken EP', year: '1995' },
  ],
},
```

The validation for this could take shape as:

```javascript
input: {
  name: {
    type: "string",
    required: true,
  },
  instruments: {
    type: "array",
    allowedValues: ["piano", "guitar", "vocals", "bass"],
  },
  albums: {
    type: "array",
    element: {
      type: "object",
      fields: {
        title: {
          type: "string",
          required: true,
        },
        year: {
          type: "string",
          optional: true,
        },
      },
    },
  },
},
```

While your data should be kept shallow for the sake of clarity and simplicity, Joystick's validation can technically be nested infinitely as it runs recursively to an arbitrary depth.

#### Authorization

Depending on your app, you may need to authorize access to your API conditionally. To do this, all getters and setters in Joystick support an `authorized()` function which will return an HTTP 403 Fordbidden error to the original request when returning `false`:

```javascript
export default {
  createPost: {
    input: {
      title: {
        type: "string",
        required: true,
      },
    },
    authorized: (input, context) => {
      return !!context?.user;
    },
    set: async (input, context) => {
      const postId = joystick.id();

      await context.mongodb.collection("posts").insertOne({
        _id: joystick.id(),
        ...input,
      });

      return {
        _id: postId,
      };
    },
  },
};
```

The `authorized()` function receives two arguments: the validated `input` for the getter or setter request and the `context` object for the request (identical to the `get()` and `set()` function of the getter or setter itself).

If the function returns a Boolean `true`, the request runs as normal. If the function returns a Boolean `false`, the request is rejected and returns an HTTP 403 Forbidden error along with a "Not authorized to access" error message.

#### Schema

The schema is the name for the object where you load all of your app's getters and setters. This should be exported from the `/api/index.js` file. A schema object has two properties: `getters` and `setters`.

```javascript
export default {
  getters: {
    posts: {
      input: {
        category: {
          type: "string",
        },
      },
      get: async (input, context) => {
        const query = {};

        if (input.category) {
          query.category = input.category;
        }

        const posts = await context.mongodb
          .collection("posts")
          .find()
          .toArray();

        return posts;
      },
    },
  },
  setters: {
    createPost: {
      input: {
        title: {
          type: "string",
          required: true,
        },
      },
      set: async (input, context) => {
        const postId = joystick.id();

        await context.mongodb.collection("posts").insertOne({
          _id: joystick.id(),
          ...input,
        });

        return {
          _id: postId,
        };
      },
    },
  },
};
```

While you can certainly define all of your getters and setters in the schema file, it's recommended to separate them off into their own files, organized by folders named after the resource they relate to:

```javascript
import postGetters from "./posts/getters.js";
import postSetters from "./posts/setters.js";

export default {
  getters: {
    ...postGetters,
  },
  setters: {
    ...postSetters,
  },
};
```

Above, we assume that `postGetters` and `postSetters` are objects and use the JavaScript spread operator `...` to "unpack" those objects on to the `getters` and `setters` objects on the schema.

#### Loading your schema

Your schema is loaded into your app by adding it as a property on the options passed to your `node.app()` instance:

```javascript
import node from '@joystick.js/node';
import api from './api/index.js';

node.app({
  api,
  routes: {
    '/': (req, res) => { ... }
  },
});
```

If you do _not_ pass `api` as a property to `node.app()` your schema will _not_ be loaded in the app.

#### get()

Although getters are defined as Express.js routes that you can call via `fetch()` or another HTTP library, it's easier and recommended to use `@joystick.js/ui`'s built-in `get()` method to perform your get request.

```javascript
import ui, { get } from "@joystick.js/ui";

const Profile = ui.component({
  state: {
    name: "",
    age: "",
    location: "",
  },
  lifecycle: {
    onMount: (component) => {
      get("profile", {
        output: ["name", "age", "location"],
      }).then((data) => {
        component.setState({
          name: data.name,
          age: data.age,
          location: data.location,
        });
      });
    },
  },
  render: ({ state }) => {
    return `
      <div>
        <p>Name: ${state.name}</p>
        <p>Age: ${state.age}</p>
        <p>Location: ${state.location}</p>
      </div>
    `;
  },
});

export default Profile;
```

When using the `get()` method, you pass the name of the getter as defined on the server as string for the first argument, followed by an options object as the second argument.

The options object accepts two properties: `input` and `output`. `input` collects the values from the UI as an object that you want to send the server and includes them as query params on the resulting HTTP GET request. `output` takes an array of strings using JavaScript dot notation `like.this` that specify the data and the shape of that data you expect in return.

For example, assuming our `profile` getter returned a value like this:

```javascript
{
  name: 'Trent Reznor',
  age: '52',
  location: 'Los Angeles, California',
  band: 'Nine Inch Nails',
  favoriteMusician: 'David Bowie',
}
```

Using the `output` array in the example `get()` request above, we'd only get back:

```javascript
{
  name: 'Trent Reznor',
  age: '52',
  location: 'Los Angeles, California',
}
```

This means that you can write multi-purpose getters and tailor the output of those getters based on the current UI _without_ having to wire up an additional endpoint.

#### set()

Although setters are defined as Express.js routes that you can call via `fetch()` or another HTTP library, it's easier and recommended to use `@joystick.js/ui`'s built-in `set()` method to perform your set request.

```javascript
import ui, { set } from "@joystick.js/ui";

const Profile = ui.component({
  state: {
    name: "",
    age: "",
    location: "",
  },
  events: {
    "submit form": (event) => {
      set("updateProfile", {
        input: {
          name: {
            first: event.target.firstName.value,
            last: event.target.lastName.value,
          },
        },
        output: ["name.first"],
      }).then((data) => {
        // Expect only data.name.first to be defined based on the output array above.
        component.setState({
          name: data.name,
        });
      });
    },
  },
  render: ({ state }) => {
    return `
      <form>
        <label for="firstName">First Name</label>
        <input type="text" name="firstName" />
        <label for="lastName">Last Name</label>
        <input type="text" name="lastName" />
      </form>
    `;
  },
});

export default Profile;
```

When using the `set()` method, you pass the name of the setter as defined on the server as string for the first argument, followed by an options object as the second argument.

The options object accepts two properties: `input` and `output`. `input` collects the values from the UI as an object that you want to send the server and includes them as body params on the resulting HTTP POST request. `output` takes an array of strings using JavaScript dot notation `like.this` that specify the data and the shape of that data you expect in return.

#### Customizing outputs

As part of the `get()` and `set()` methods included in `@joystick.js/ui`, an option exists to control the `output` of calls to those functions using a technology we refer to as SelectiveFetch.

SelectiveFetch allows us to tailor the output from a getter or setter to meet the needs of our UI. This means that we can define endpoints that return large sets of data, however, can be scaled down to fit the needs of each unique UI _without_ having to wire up additional endpoints.

To utilize SelectiveFetch, as part of the options object passed to a `get()` or `set()` call, include the `output` property, set to an array of strings describing the data you want to get back in return.

For example, imagine one of our getters returned data like this:

```javascript
{
  profile: {
    get: () => {
     return {
        name: {
          first: 'Max',
          last: 'Keiser',
        },
        emailAddress: 'max.keiser@rt.com',
        bitcoinAddress: 'mqW5mA5gghdTa9QcEn8aW4FcLAJWctWVVZ',
        address: {
          street: '1234 Fake St.',
          city: 'Wherever',
          state: 'NY',
          zipCode: '10001',
        },
      };
    },
  }
}
```

If our UI only called for the `bitcoinAddress` field and the `zipCode` under `address`, returning the entire response would be wasteful. Using SelectiveFetch, we can tailor this output to only the fields we need:

```javascript
get("profile", {
  output: ["bitcoinAddress", "address.zipCode"],
});
```

That's it. Now, when Joystick runs the `get()` request, it will take the response it receives and filter it down to only these two fields, giving us something like this:

```javascript
{
  bitcoinAddress: 'mqW5mA5gghdTa9QcEn8aW4FcLAJWctWVVZ',
  address: {
    zipCode: '10001',
  },
}
```

All of the other data is omitted.

### Internationalization

If you're building an app for a multi-lingual audience, Joystick helps you by connecting translations you author on the server with the Joystick components in your UI.

#### Adding a language file

Translations should be placed in the `/i18n` folder at the root of your project. In this folder, `.js` files should be added with names matching the [ISO code for the language you'd like to support](https://gist.github.com/rglover/23d9d10d788c87e7fc5f5d7d8629633f), for example: `en-US.js`.

Inside of that file, Joystick expects a JavaScript object to be exported with properties set to paths matching one of the components in your `/ui` folder:

```javascript
export default {
  "ui/pages/index/index.js": {
    quote: `There is no excuse to not endlessly continue to try and make everything that you want to do as wonderful as your vision.`,
    attribute: "Jeremiah Tower",
  },
};
```

Here, we have a page component at `ui/pages/index/index.js` that we want to define translations for. **Note**: this is important. When using the `res.render()` function, Joystick will automatically try to match the path you pass to that function with one of the properties (e.g., `ui/pages/index/index.js`) in the active translation file. If there's a match, it will load the translation object for that specific page. If it _cannot_ find a match, it will load the entire translation file.

Keep in mind: paths are **absolute** and must specify the full path in order to work.

#### Accessing translations

Translations loaded when using the `res.render()` function to render a page can be accessed by utilizing the `i18n()` render function in a Joystick component.

```javascript
import ui from "@joystick.js/ui";

const Index = ui.component({
  render: ({ i18n }) => {
    return `
      <blockquote>
        <p>${i18n("quote")}</p>
        <p>&mdash; ${i18n("attribute")}</p>
      </blockquote>
    `;
  },
});

export default Index;
```

If there was a matching path for the page rendered in your language file, Joystick will load it as the "root" or starting point for the `i18n()` function. Above, passing `quote` or `attribute` to the `i18n()` function as a string is equivalent to saying `ui/pages/index/index.js.quote` or `ui/pages/index/index.js.attribute`.

Again, keep in mind: **if there was not a matching path in your language file, this short-hand will _not_ work. Instead you will have to specify the full path to the translation you want to render**.

If for whatever reason you _prefer_ this functionality, you can author your language file like this:

```javascript
export default {
  Index: {
    quote: `There is no excuse to not endlessly continue to try and make everything that you want to do as wonderful as your vision.`,
    attribute: "Jeremiah Tower",
  },
};
```

And then load the translations into your UI like this:

```javascript
import ui from "@joystick.js/ui";

const Index = ui.component({
  render: ({ i18n }) => {
    return `
      <blockquote>
        <p>${i18n("Index.quote")}</p>
        <p>&mdash; ${i18n("Index.attribute")}</p>
      </blockquote>
    `;
  },
});

export default Index;
```

### Handling process events

While Joystick does its best to handle Node.js process events on the server, it can be helpful to be able to "plug in" to these events and implement custom logic. As part of the `node.app()` function in `@joystick.js/node`, an `events` object can be passed with functions/methods for handling specific Node.js process events:

```javascript
import node from "@joystick.js/node";
import api from "./api";

node
  .app({
    api,
    events: {
      error: (error) => {
        console.log(error);
      },
      beforeExit: (error) => {
        console.log("beforeExit", error);
      },
      disconnect: (error) => {
        console.log("disconnect", error);
      },
      exit: (error) => {
        console.log("exit", error);
      },
      message: (error) => {
        console.log("message", error);
      },
      rejectionHandled: (error) => {
        console.log("rejectionHandled", error);
      },
      uncaughtException: (error) => {
        console.log("uncaughtException", error);
      },
      uncaughtExceptionMonitor: (error) => {
        console.log("uncaughtExceptionMonitor", error);
      },
      unhandledRejection: (error) => {
        console.log("unhandledRejection", error);
      },
      warning: (error) => {
        console.log("warning", error);
      },
      worker: (error) => {
        console.log("worker", error);
      },
    },
    routes: {
      ...
    },
  })
  .then((express) => {
    // console.log(express);
  });
```

The list of events in this example (and their names) represent the full list of events that you can listen for through Joystick. Of course, you can still manually tap into the Node.js `process` directly if you need access to other events, or, prefer a DIY approach to handling.

## __filename and __dirname

Because `@joystick.js/node` uses the `--experimental-modules` flag to enable ES Module support in Joystick, the `__filename` and `__dirname` global variables you expect to have access to in a Node.js app are unavailable. To supplement, `@joystick.js/node` includes two polyfill functions for mimicing the behavior of these variables: `__filename()` and `__dirname()`.

```javascript
import { __filename, __dirname } from '@joystick.js/node';

console.log(__filename(import.meta.url));
// Absolute path to the current file in your .joystick/build directory.

console.log(__dirname(import.meta.url));
// Absolute path to the current directory in your .joystick/build directory.
```

Here, when you call the functions, you need to pass the global `import.meta.url` value from Node which describes the current path of the file where `import.meta.url` is utilized. If you _do not_ pass `import.meta.url` to either function, it will return an empty string.

## Deployment

### Setting and utilizing a ROOT_URL

When deploying a Joystick app for a staging or production environment, in your environment variables—_not_ your Joystick settings file—the `process.env.ROOT_URL` value must be set to the valid origin your app will be accessible at. For example, if your app will be available at `https://cheatcode.co` you should set `process.env.ROOT_URL = 'https://cheatcode.co'`.

This value is utilized by the `origin` variable exported from the `@joystick.js/node` which allows you to reference the correct application URL in your code. For example:

```javascript
import joystick, { origin, email } from '@joystick.js/node';

joystick.app({ ... }).then(async () => {
  await email.send({
    to: 'somebody@gmail.com',
    from: 'support@myapp.com',
    subject: 'App start up!',
    template: 'app-startup',
    props: {
      url: `${origin}/admin/users`,
    },
  });
});
```

In the example above, on startup, an email is being sent to "somebody," and the URL for the app is intended to be referenced in the email. Instead of hard-coding the URL like `url: `https://myapp.com/admin/users`, we utilize the `origin` variable exported from `@joystick.js/node` so that our code works in any environment.

### Joystick Deploy
Joystick Deploy is a deployment service for Joystick apps that is currently under development and will be available in 2023.
