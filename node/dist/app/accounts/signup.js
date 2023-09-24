import hashString from "./hashString";
import generateSession from "./generateSession";
import formatErrorString from "../../lib/formatErrorString";
import runUserQuery from "./runUserQuery";
import { isObject } from "../../validation/lib/typeValidators";
import getOutput from "../getOutput";
import typesMap from "../databases/typesMap";
import getTargetDatabaseProvider from "../databases/getTargetDatabaseProvider.js";
import stringToSnakeCase from "../databases/stringToSnakeCase.js";
import createMetadataTableColumns from "./createMetadataTableColumns.js";
import roles from "./roles/index.js";
const addSessionToUser = (userId = null, session = null) => {
  try {
    return runUserQuery("addSession", { userId, session });
  } catch (error) {
    throw new Error(formatErrorString("signup.addSessionToUser", error));
  }
};
const getUserByUserId = (userId = "") => {
  try {
    return runUserQuery("user", { _id: userId });
  } catch (exception) {
    throw new Error(formatErrorString("signup.getUserByUserId", exception));
  }
};
const insertUserInDatabase = async (user = {}) => {
  try {
    return runUserQuery("createUser", user);
  } catch (exception) {
    throw new Error(formatErrorString("signup.insertUserInDatabase", exception));
  }
};
const sqlizeMetadata = (metadata = {}) => {
  try {
    return Object.entries(metadata).reduce((sqlized = {}, [key, value]) => {
      sqlized[stringToSnakeCase(key)] = value;
      return sqlized;
    }, {});
  } catch (exception) {
    throw new Error(`[actionName.sqlizeMetadata] ${exception.message}`);
  }
};
const getUserToCreate = async (options = {}) => {
  try {
    const usersDatabase = getTargetDatabaseProvider("users");
    const usersDatabaseType = typesMap[usersDatabase];
    let user = {
      password: await hashString(options.password)
    };
    if (options?.emailAddress) {
      user.emailAddress = options?.emailAddress;
    }
    if (options?.username) {
      user.username = options?.username;
    }
    if (options?.metadata && isObject(options.metadata) && usersDatabaseType === "sql") {
      const sqlizedMetadata = sqlizeMetadata(options.metadata);
      await createMetadataTableColumns(usersDatabase, sqlizedMetadata);
      const metadata = { ...options?.metadata || {} };
      if (metadata?.roles) {
        delete metadata.roles;
      }
      user = {
        ...sqlizeMetadata(metadata),
        ...user
      };
    }
    if (options?.metadata && isObject(options.metadata) && usersDatabaseType === "nosql") {
      let metadata = { ...options?.metadata || {} };
      if (metadata?.roles) {
        delete metadata.roles;
      }
      user = {
        ...metadata || {},
        ...user
      };
    }
    return user;
  } catch (exception) {
    throw new Error(formatErrorString("signup.getUserToCreate", exception));
  }
};
const getExistingUser = (emailAddress = "", username = "") => {
  try {
    return runUserQuery("existingUser", { emailAddress, username });
  } catch (exception) {
    throw new Error(formatErrorString("signup.getExistingUser", exception));
  }
};
const signup = async (options, { resolve, reject }) => {
  try {
    if (!options.emailAddress) {
      return reject("Email address is required.");
    }
    if (!options.password) {
      return reject("Password is required.");
    }
    const existingUser = await getExistingUser(options.emailAddress, options.metadata?.username);
    if (existingUser && process.env.NODE_ENV !== "test") {
      throw new Error(`A user with the ${existingUser.existingUsername ? "username" : "email address"} ${existingUser.existingUsername || existingUser.existingEmailAddress} already exists.`);
    }
    let userToCreate;
    let userId = existingUser?._id || existingUser?.user_id;
    if (!existingUser) {
      userToCreate = await getUserToCreate(options);
      userId = await insertUserInDatabase(userToCreate);
    }
    const user = await getUserByUserId(userId);
    const session = generateSession();
    if (user?._id || user?.user_id) {
      await addSessionToUser(user?._id || user?.user_id, session);
    }
    if (options?.metadata?.roles?.length > 0 && process.env.NODE_ENV === "test") {
      for (let i = 0; i < options?.metadata?.roles?.length; i += 1) {
        const role = options?.metadata?.roles[i];
        roles.grant(user?._id || user?.user_id, role);
      }
    }
    if (typeof process.joystick?._app?.options?.accounts?.onSignup === "function") {
      process.joystick?._app?.options?.accounts?.onSignup({
        ...session,
        userId,
        user
      });
    }
    return resolve({
      ...session,
      userId,
      user: getOutput(user, options?.output)
    });
  } catch (exception) {
    reject(new Error(formatErrorString("signup", exception)));
  }
};
var signup_default = (options) => new Promise((resolve, reject) => {
  signup(options, { resolve, reject });
});
export {
  signup_default as default
};
