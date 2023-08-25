import test from 'ava';

class Test {
  constructor() {}
  
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

export default new Test();
