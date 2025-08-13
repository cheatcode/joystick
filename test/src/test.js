import test from 'ava';
import databases from './helpers/databases/index.js';

class Test {
  constructor() {}

  before(callback = null) {
    // NOTE: Prefer serial before to async to align better with
    // expectations and avoid confusion.
    return test.serial.before(callback);  
  }
  
  before_each(callback = null) {
    return test.beforeEach(callback);  
  }
  
  after(callback = null) {
    // NOTE: Prefer after always to guarantee cleanup and avoid
    // messy test suites that may or may not cleanup due to failures.
    return test.after.always(callback);  
  }
  
  after_each(callback = null) {
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

const test_instance = new Test();

test_instance.before(async () => {
  await databases();
});

test_instance.after(async () => {
  // NOTE: Automatically clean up database connections after tests run.

  if (process?.databases?.mongodb?.client) {
    await process.databases.mongodb.client.close();
  }

  if (process?.databases?.postgresql?.pool) {
    await process.databases.postgresql.pool.end();
  }

  if (process?.databases?.redis) {
    if (process.databases.redis.destroy) {
      process.databases.redis.destroy();
    } else {
      // Handle multiple Redis instances
      for (const [key, redis_instance] of Object.entries(process.databases.redis)) {
        if (redis_instance?.destroy) {
          redis_instance.destroy();
        }
      }
    }
  }
});

export default test_instance;
