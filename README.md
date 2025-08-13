<img style="height: 30px; width: auto; margin-bottom: 10px;" src="https://cdn.joystickjs.com/branding/joystick_logo_light.svg" alt="Joystick">

The full-stack JavaScript framework for SaaS apps.

[Official Website](https://cheatcode.co/joystick) | [Documentation](https://docs.cheatcode.co/joystick)

### What is Joystick?

Joystick is a full-stack JavaScript framework consisting of four packages:

- `@joystick.js/ui` - A front-end framework for building UI components with HTML, CSS, and JavaScript.
- `@joystick.js/node` - A batteries-included back-end framework based on Node.js, running an HTTP server based on Express.
- `@joystick.js/test` - A testing library used for writing and instrumenting tests for your Joystick app on the front-end and back-end.
- `@joystick.js/cli` - A command-line tool for creating Joystick apps, running their development server, and deploying them via CheatCode's [Push](https://cheatcode.co/push) service.

Together, these four packages make up Joystick. When you build an app, the first two packages—`@joystick.js/ui` and `@joystick.js/node`—power the app itself, `@joystick.js/cli` helps you create, run, and deploy the app, and `@joystick.js/test` helps you write tests for the app.

### What is Joystick conceptually?

It's best and easiest to think of Joystick as the "Ruby on Rails" or "Django" of JavaScript but tailored specifically to SaaS developers.

It's designed to give you everything you need in one, easy-to-use system without the need to stitch together a bunch of tools or packages. It was made for SaaS founders using JavaScript who want to maximize productivity without sacrificing quality.

If you'd like to learn more about the motivation to build Joystick, read about [the philosophy behind the framework](https://docs.cheatcode.co/joystick/philosophy).

### Platform Support

Joystick supports MacOS, Linux, and Windows (WSL2) and requires Node.js v20 or later.

### Installation

To start working with Joystick, install the `@joystick.js/cli` package on to your computer:

```bash
npm i -g @joystick.js/cli@latest
```

Once installed, to create an app, run:

```bash
joystick create <app_name>
```

### Documentation

Joystick's documentation can be found [here](https://docs.cheatcode.co/joystick).

### License

Joystick is [SAUCR](https://saucr.org) licensed.
