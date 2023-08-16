import test from 'ava';
import fetch from 'node-fetch';

let users = [];

class Test {
  constructor() {}
  
  async signupUser(usersToSignup = []) {
    for (let i = 0; i < usersToSignup?.length; i += 1) {
      const userToSignup = usersToSignup[i];
      const user = await fetch(`http://localhost:${process.env.PORT}/api/_test/accounts/signup`, {
        method: 'POST',
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToSignup)
      }).then((response) => response.json());
      
      users.push(user);
    }
  }
  
  loginUser(emailAddress = '') {
    const user = users?.find((user) => user?.emailAddress === emailAddress || user?.email_address === emailAddress);
    return user;
  }
  
  deleteUser(userId = '') {
    return fetch(`http://localhost:${process.env.PORT}/api/_test/accounts`, {
      method: 'DELETE',
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId })
    })
  }
  
  before(callback = null) {
    // NOTE: Prefer serial before to async to align better with
    // expectations and avoid confusion.
    return test.serial.before(callback);  
  }
  
  beforeEach(callback = null) {
    return test.beforeEach(callback);  
  }
  
  after(callback = null) {
    // NOTE: Prefer after always to guarantee cleanup and avoid
    // messy test suites that may or may not cleanup due to failures.
    return test.after.always(callback);  
  }
  
  afterEach(callback = null) {
    // NOTE: Prefer afterEach always to guarantee cleanup and avoid
    // messy test suites that may or may not cleanup due to failures.
    return test.afterEach.always(callback);  
  }
  
  that(description = '', callback = null) {
    // NOTE: Always run serial so we don't have collisions on component instances
    // for DOM tests.
    return test.serial(description, callback);
  }
}

const testInstance = new Test();

test.serial.after.always(async () => {
  // NOTE: Nuke users who were created as part of the test run to avoid
  // data collisions in other tests/suites.

  for (let i = 0; i < users?.length; i += 1) {
    const user = users[i];
    await testInstance.deleteUser(user?._id || user?.user_id); 
  }
});

export default testInstance;