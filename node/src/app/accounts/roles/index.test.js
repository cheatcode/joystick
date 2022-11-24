import { jest } from "@jest/globals";
import { killPortProcess } from "kill-port-process";
import setAppSettingsForTest from "../../../tests/lib/setAppSettingsForTest";
import startTestDatabase from "../../../tests/lib/databases/start";
import stopTestDatabase from "../../../tests/lib/databases/stop";
import { beforeEach, expect, test } from "@jest/globals";
import roles from "./index";
import accounts from "../index";

jest.mock('../../../../node_modules/dayjs', () => {
  const _dayjs = jest.requireActual('../../../../node_modules/dayjs');
  const _utc = jest.requireActual('../../../../node_modules/dayjs/plugin/utc');
  _dayjs.extend(_utc);

  return () => _dayjs('2022-01-01T00:00:00.000Z');
});

setAppSettingsForTest({
  "config": {
    "databases": [
      {
        "provider": "mongodb",
        "users": true,
        "options": {}
      }
    ],
    "i18n": {
      "defaultLanguage": "en-US"
    },
    "middleware": {},
    "email": {
      "from": "app@test.com",
      "smtp": {
        "host": "fake.email.com",
        "port": 587,
        "username": "test",
        "password": "password"
      }
    }
  },
  "global": {},
  "public": {},
  "private": {}
});

global.joystick = {
  settings: {
    config: {
      databases: [{
        "provider": "mongodb",
        "users": true,
        "options": {}
      }],
    },
  },
};

const app = (await import('../../index')).default;

let instance;

describe("app/accounts/roles/index.js", () => {
  beforeAll(async () => {
    process.env.PORT = 3600;
    // await startTestDatabase('mongodb');
  });
  
  beforeEach(async () => {
    instance = await app({});
  });

  afterEach(async () => {
    if (instance?.server?.close && typeof instance.server.close === 'function') {
      instance.server.close();
    }
  
    await killPortProcess(process.env.PORT);
  });

  afterAll(async () => {
    // await stopTestDatabase();
  });

  test('roles.add adds role to roles collection in database', async () => {
    await roles.add('admin');
    const roleExists = await process.databases.mongodb.collection('roles').findOne({ role: 'admin' });
    expect(!!roleExists).toBe(true);
  });

  test('roles.remove removes role from roles collection in database', async () => {
    await roles.add('admin');
    await roles.remove('admin');
    const roleExists = await process.databases.mongodb.collection('roles').findOne({ role: 'admin' });
    expect(!!roleExists).toBe(false);
  });

  test('roles.list returns a list of roles in the roles collection in database', async () => {
    await roles.add('admin');
    await roles.add('manager');
    await roles.add('employee');

    const rolesInDatabase = await roles.list();

    await roles.remove('admin');
    await roles.remove('manager');
    await roles.remove('employee');

    expect(rolesInDatabase).toEqual(['admin', 'manager', 'employee']);
  });

  test('roles.grant adds role to user in users collection in database', async () => {
    await process.databases.mongodb.collection('users').deleteOne({ emailAddress: 'test@test.com' });
    
    const user = await accounts.signup({ emailAddress: 'test@test.com', password: 'password' });

    await roles.grant(user?.userId, 'admin');
    await roles.grant(user?.userId, 'rolethatdoesntexist');

    const userAfterGrant = await process.databases.mongodb.collection('users').findOne({ _id: user?.userId });
    const rolesCreated = await process.databases.mongodb.collection('roles').find().toArray();

    expect(userAfterGrant?.roles?.includes('admin')).toBe(true);
    expect(rolesCreated?.length).toBe(2);
  });

  test('roles.revoke removes role from user in users collection in database', async () => {
    await process.databases.mongodb.collection('users').deleteOne({ emailAddress: 'test@test.com' });

    const user = await accounts.signup({ emailAddress: 'test@test.com', password: 'password' });

    await roles.grant(user?.userId, 'admin');
    await roles.revoke(user?.userId, 'admin');

    const userAfterGrant = await process.databases.mongodb.collection('users').findOne({ _id: user?.userId });

    expect(userAfterGrant?.roles?.includes('admin')).toBe(false);
  });

  test('roles.userHasRole returns true if user has role', async () => {
    await process.databases.mongodb.collection('users').deleteOne({ emailAddress: 'test@test.com' });
    const user = await accounts.signup({ emailAddress: 'test@test.com', password: 'password' });
    await roles.grant(user?.userId, 'admin');
    const userHasRole = await roles.userHasRole(user?.userId, 'admin');
    expect(userHasRole).toBe(true);
  });

  test('roles.userHasRole returns false if user does not have role', async () => {
    await process.databases.mongodb.collection('users').deleteOne({ emailAddress: 'test@test.com' });
    const user = await accounts.signup({ emailAddress: 'test@test.com', password: 'password' });
    await roles.grant(user?.userId, 'admin');
    const userHasRole = await roles.userHasRole(user?.userId, 'manager');
    expect(userHasRole).toBe(false);
  });
});