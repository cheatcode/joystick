//// Think about testing less about what's established and more how you would do it.
//// Have a Joystick-only testing library, just like everything else.
//
//import server from '@joystick.js/test/server';
//import browser from '@joystick.js/test/browser';
//
//// NOTE: You can set a special header when doing this so that internally, if you make any changes to the database,
//// you can just revert the change.
//
//// `joystick test --watch` would start the app so you have a real server/database locally
//// `joystick test` would start the app in memory, run the tests in /tests, and then exit.
//
///*
//  - Organize tests under /tests like this (1:1 mock of project structure):
//
//  /tests
//    - /ui
//        - /components
//           - /addDesign
//              - index.test.js
//    - /api
//    - /lib
//*/
//
//server.test('sends the right email', async (app = {}, expect = {}) => {
//  const { html, text } = await app.email.send({
//    template: 'verifyEmail',
//    props: {},
//  });
//
//  const emailInDatabase = await app.databases.mongodb.collect('emails').findOne({
//    _id: 'someIdToExpect',
//  });
//
//  expect(emailInDatabase).toNotBeUndefined({});
//  expect(html.full).toEqual(`
//    <html>
//      <body></body>
//    </html>
//  `);
//
//  expect(html.template).toEqual(`
//    <html>
//      <body>
//        <p>Some email content</p>
//      </body>
//    </html>
//  `);
//});
//
//server.test('returns the correct HTML', async (app = {}, expect = {}) => {
//  // routes.get, routes.post, routes.patch, etc.
//  const html = await app.routes.get('/path/to/my/route', {
//    headers: {
//      'Cookie': 'joystickLoginToken=3029840923840923',
//    },
//  });
//
//  expect(html).toContain('<div class="user">me@ryanglover.net</div>');
//});
//
//browser.test('runs the api request properly', async (app = {}, expect = {}) => {
//  const dayjs = await app.import('dayjs');
//  const request = app.api.set('updateRequirementOrder', {
//    input: {
//      date: dayjs().format(),
//    },
//  });
//});
//
//browser.test('renders the component properly', async (test = {}, expect = {}) => {
//  const instance = test.component.instance(SomeComponent);
//  test.component.mount(instance, test.dom);
//  instance.events['click .some-selector'](test.event, instance);
//  expect(test.dom.querySelector('.some-selector').classList.contains('active')).toEqual(true);
//});
//
//browser.test('the method works', async (test = {}, expect = {}) => {
//  const instance = test.component.instance(SomeComponent);
//  const result = instance.methods.someMethodToCall('someVariable');
//  expect(result).toEqual(123);
//});
