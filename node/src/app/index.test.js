import { jest, test } from '@jest/globals';
import { createRequire } from 'module';
import assertRoutesExistInRegexes from '../tests/lib/assertRoutesExistInRegexes';
import getRouteRegexes from '../tests/lib/getRouteRegexes';

const app = (await import('./index')).default;
// const require = createRequire(import.meta.url);

// jest.mock('../../node_modules/express', () => {
//   const express = () => {
//     return {
//       use: jest.fn(),
//       get: jest.fn(),
//       post: jest.fn(),
//       listen: () => {
//         return {
//           hello: true,
//         }
//       },
//     };
//   };

//   express.json = () => jest.fn();
//   express.static = () => jest.fn();

//   return express;
// });


global.joystick = {
  settings: {
    config: {},
  },
};

describe('index.js', () => {
  test('registers render-related routes', async () => {
    const instance = await app({});
    
    if (instance?.server?.close && typeof instance.server.close === 'function') {
      instance.server.close();
    }

    if (instance?.app?._router) {
      const routeRegexes = getRouteRegexes(instance.app._router.stack);
      assertRoutesExistInRegexes(routeRegexes, [
        '/_joystick/heartbeat',
        '/_joystick/utils/process.js',
        '/_joystick/index.client.js',
        '/_joystick/index.css',
        '/_joystick/ui',
        '/_joystick/hmr/client.js',
      ]);
    }
  });

  test('registers accounts-related routes', async () => {
    const instance = await app({});
    
    if (instance?.server?.close && typeof instance.server.close === 'function') {
      instance.server.close();
    }

    if (instance?.app?._router) {
      const routeRegexes = getRouteRegexes(instance.app._router.stack);
      assertRoutesExistInRegexes(routeRegexes, [
        '/api/_accounts/login',
        '/api/_accounts/logout',
        '/api/_accounts/signup',
        '/api/_accounts/recover-password',
        '/api/_accounts/reset-password',
      ]);
    }
  });

  test('registers getter routes', async () => {
    const instance = await app({
      api: {
        getters: {
          posts: {
            input: {},
            get: () => {},
          },
          post: {
            input: {},
            get: () => {},
          },
        },
      },
    });
    
    if (instance?.server?.close && typeof instance.server.close === 'function') {
      instance.server.close();
    }

    if (instance?.app?._router) {
      const routeRegexes = getRouteRegexes(instance.app._router.stack);
      assertRoutesExistInRegexes(routeRegexes, [
        '/api/_getters/posts',
        '/api/_getters/post',
      ]);
    }
  });

  test('registers setter routes', async () => {
    const instance = await app({
      api: {
        setters: {
          createPost: {
            input: {},
            set: () => {},
          },
          updatePost: {
            input: {},
            set: () => {},
          },
        },
      },
    });
    
    if (instance?.server?.close && typeof instance.server.close === 'function') {
      instance.server.close();
    }

    if (instance?.app?._router) {
      const routeRegexes = getRouteRegexes(instance.app._router.stack);
      assertRoutesExistInRegexes(routeRegexes, [
        '/api/_setters/createPost',
        '/api/_setters/updatePost',
      ]);
    }
  });

  test('registers custom routes', async () => {
    const instance = await app({
      routes: {
        '/latest': () => {},
        '/profile/:_id': () => {},
        '/category/:category/posts': () => {},
      },
    });
    
    if (instance?.server?.close && typeof instance.server.close === 'function') {
      instance.server.close();
    }

    if (instance?.app?._router) {
      const routeRegexes = getRouteRegexes(instance.app._router.stack);
      assertRoutesExistInRegexes(routeRegexes, [
        '/latest',
        '/profile/123',
        '/category/tutorials/posts',
      ]);
    }
  });
});