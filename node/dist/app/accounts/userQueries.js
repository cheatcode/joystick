import generateId from "../../lib/generateId";
import objectToSQLKeysString from "../../lib/objectToSQLKeysString";
import objectToSQLValuesString from "../../lib/objectToSQLValuesString";
var userQueries_default = {
  mongodb: {
    existingUser: async (input = {}) => {
      let existingUserWithEmailAddress;
      let existingUserWithUsername;
      if (input?.emailAddress) {
        existingUserWithEmailAddress = await process.databases.mongodb.collection("users").findOne({ emailAddress: input.emailAddress });
      }
      if (input?.username) {
        existingUserWithUsername = await process.databases.mongodb.collection("users").findOne({ username: input.username });
      }
      return existingUserWithEmailAddress || existingUserWithUsername ? {
        existingEmailAddress: existingUserWithEmailAddress?.emailAddress,
        existingUsername: existingUserWithUsername?.username
      } : null;
    },
    createUser: async (input = {}) => {
      const userId = generateId();
      await process.databases.mongodb.collection("users").insertOne({ _id: userId, ...input });
      return userId;
    },
    user: async (input) => {
      if (input?.emailAddress) {
        const user = await process.databases.mongodb.collection("users").findOne({ emailAddress: input.emailAddress });
        return user;
      }
      if (input?.username) {
        const user = await process.databases.mongodb.collection("users").findOne({ username: input.username });
        return user;
      }
      if (input?._id) {
        const user = await process.databases.mongodb.collection("users").findOne({ _id: input._id });
        return user;
      }
      return null;
    },
    addSession: async (input = {}) => {
      await process.databases.mongodb.collection("users").updateOne({
        _id: input.userId
      }, {
        $addToSet: {
          sessions: input.session
        }
      });
    },
    userWithLoginToken: async (input) => {
      const user = await process.databases.mongodb.collection("users").findOne({
        "sessions.token": input?.token
      });
      return user;
    },
    addPasswordResetToken: (input = {}) => {
      return process.databases.mongodb.collection("users").updateOne({
        emailAddress: input.emailAddress
      }, {
        $addToSet: {
          passwordResetTokens: {
            token: input.token,
            requestedAt: new Date().toISOString()
          }
        }
      });
    },
    userWithResetToken: async (input) => {
      const user = await process.databases.mongodb.collection("users").findOne({
        "passwordResetTokens.token": input["passwordResetTokens.token"]
      });
      return user;
    },
    setNewPassword: async (input = {}) => {
      return process.databases.mongodb.collection("users").updateOne({
        _id: input?.userId
      }, {
        $set: {
          password: input?.hashedPassword
        }
      });
    },
    removeResetToken: async (input = {}) => {
      const user = await process.databases.mongodb.collection("users").findOne({ _id: input?.userId });
      await process.databases.mongodb.collection("users").updateOne({
        _id: input?.userId
      }, {
        $set: {
          passwordResetTokens: user?.passwordResetTokens?.filter(({ token }) => {
            return token !== input?.token;
          })
        }
      });
      return process.databases.mongodb.collection("users").findOne({ _id: input?.userId });
    },
    addRole: async (input = {}) => {
      const existingRole = input?.role ? await process.databases.mongodb.collection("roles").findOne({ role: input?.role }) : null;
      if (!existingRole && input?.role) {
        await process.databases.mongodb.collection("roles").insertOne({
          _id: generateId(),
          role: input?.role
        });
        return {
          _id: input?.userId,
          action: "add",
          role: input?.role,
          ok: true,
          error: null
        };
      }
      return {
        action: "add",
        role: input?.role,
        ok: false,
        error: input?.role ? `Role already exists: ${input?.role}.` : `Must pass a name for role to add.`
      };
    },
    removeRole: async (input = {}) => {
      const existingRole = input?.role ? await process.databases.mongodb.collection("roles").findOne({ role: input?.role }) : null;
      if (existingRole) {
        await process.databases.mongodb.collection("users").updateMany({
          roles: { $in: [input?.role] }
        }, {
          $pull: {
            roles: input?.role
          }
        });
        await process.databases.mongodb.collection("roles").deleteOne({
          role: input?.role
        });
        return {
          _id: input?.userId,
          action: "remove",
          role: input?.role,
          ok: true,
          error: null
        };
      }
      return {
        action: "add",
        role: input?.role,
        ok: false,
        error: `Could not find an existing role with the name ${input?.role}.`
      };
    },
    listRoles: async (input = {}) => {
      const roles = await process.databases.mongodb.collection("roles").find().toArray();
      return (roles || []).map(({ role }) => role);
    },
    grantRole: async (input = {}) => {
      const user = await process.databases.mongodb.collection("users").findOne({ _id: input?.userId });
      if (user) {
        await process.databases.mongodb.collection("users").updateOne({ _id: input?.userId }, {
          $addToSet: {
            roles: input?.role
          }
        });
        const existingRole = await process.databases.mongodb.collection("roles").findOne({ role: input?.role });
        if (!existingRole) {
          await process.databases.mongodb.collection("roles").insertOne({
            _id: generateId(),
            role: input?.role
          });
        }
        return {
          _id: input?.userId,
          action: "grant",
          role: input?.role,
          ok: true,
          error: null
        };
      }
      return {
        _id: input?.userId,
        action: "grant",
        role: input?.role,
        ok: false,
        error: `User not found with the _id ${input?.userId}.`
      };
    },
    revokeRole: async (input = {}) => {
      const user = await process.databases.mongodb.collection("users").findOne({ _id: input?.userId });
      if (user && user.roles) {
        await process.databases.mongodb.collection("users").updateOne({ _id: input?.userId }, {
          $pull: {
            roles: input?.role
          }
        });
        return {
          _id: input?.userId,
          action: "revoke",
          role: input?.role,
          ok: true,
          error: null
        };
      }
      return {
        _id: input?.userId,
        action: "revoke",
        role: input?.role,
        ok: false,
        error: `User not found with the _id ${input?.userId}.`
      };
    },
    userHasRole: async (input = {}) => {
      const user = await process.databases.mongodb.collection("users").findOne({ _id: input?.userId });
      if (user && user.roles) {
        return user?.roles?.includes(input?.role);
      }
      return false;
    }
  },
  postgresql: {
    existingUser: async (input = {}) => {
      let existingUserWithEmailAddress;
      let existingUserWithUsername;
      if (input?.emailAddress) {
        const [existingUser] = await process.databases.postgresql.query(`SELECT * FROM users WHERE email_address='${input?.emailAddress}';`);
        existingUserWithEmailAddress = existingUser;
      }
      if (input?.username) {
        const [existingUser] = await process.databases.postgresql.query(`SELECT * FROM users WHERE username='${input?.username}';`);
        existingUserWithUsername = existingUser;
      }
      return existingUserWithEmailAddress || existingUserWithUsername ? {
        existingEmailAddress: existingUserWithEmailAddress?.email_address,
        existingUsername: existingUserWithUsername?.username
      } : null;
    },
    createUser: async (input = {}) => {
      const userId = generateId();
      await process.databases.postgresql.query(`INSERT INTO users(${objectToSQLKeysString({ user_id: userId, ...input })}) VALUES (${objectToSQLValuesString({ user_id: userId, ...input })});`);
      return userId;
    },
    user: async (input) => {
      if (input?.emailAddress) {
        const [user] = await process.databases.postgresql.query(`SELECT * FROM users WHERE email_address='${input?.emailAddress}';`);
        return user;
      }
      if (input?.username) {
        const [user] = await process.databases.postgresql.query(`SELECT * FROM users WHERE username='${input?.username}';`);
        return user;
      }
      if (input?._id) {
        const [user] = await process.databases.postgresql.query(`SELECT * FROM users WHERE user_id='${input?._id}';`);
        return user;
      }
      return null;
    },
    addSession: async (input = {}) => {
      await process.databases.postgresql.query(`INSERT INTO users_sessions(user_id, token, token_expires_at) VALUES ('${input?.userId}', '${input?.session?.token}', '${input?.session?.tokenExpiresAt}');`);
    },
    userWithLoginToken: async (input) => {
      const [existingUser] = await process.databases.postgresql.query(`SELECT user_id FROM users_sessions WHERE token='${input.token}';`);
      const [user] = await process.databases.postgresql.query(`SELECT * FROM users WHERE user_id='${existingUser?.user_id}';`);
      return user;
    },
    addPasswordResetToken: async (input = {}) => {
      const [user] = await process.databases.postgresql.query(`SELECT user_id FROM users WHERE email_address='${input?.emailAddress}';`);
      await process.databases.postgresql.query(`INSERT INTO users_password_reset_tokens(user_id, token, requested_at) VALUES ('${user?.user_id}', '${input?.token}', '${new Date().toISOString()}');`);
    },
    userWithResetToken: async (input) => {
      const [existingUser] = await process.databases.postgresql.query(`SELECT user_id FROM users_password_reset_tokens WHERE token='${input["passwordResetTokens.token"]}';`);
      const [user] = await process.databases.postgresql.query(`SELECT * FROM users WHERE user_id='${existingUser?.user_id}';`);
      return user;
    },
    setNewPassword: async (input = {}) => {
      await process.databases.postgresql.query(`UPDATE users SET password='${input?.hashedPassword}' WHERE user_id='${input?.userId}';`);
    },
    removeResetToken: async (input = {}) => {
      await process.databases.postgresql.query(`DELETE FROM users_password_reset_tokens WHERE user_id='${input?.userId}' AND token='${input?.token}';`);
      const [user] = await process.databases.postgresql.query(`SELECT * FROM users WHERE user_id='${input?.userId}';`);
      return user;
    },
    addRole: async (input = {}) => {
      const [existingRole] = await process.databases.postgresql.query(`SELECT * FROM roles WHERE role='${input?.role}';`);
      if (!existingRole && input?.role) {
        await process.databases.postgresql.query(`INSERT INTO roles(${objectToSQLKeysString({ role: input?.role })}) VALUES (${objectToSQLValuesString({ role: input?.role })});`);
        return {
          _id: input?.userId,
          action: "add",
          role: input?.role,
          ok: true,
          error: null
        };
      }
      return {
        action: "add",
        role: input?.role,
        ok: false,
        error: input?.role ? `Role already exists: ${input?.role}.` : `Must pass a name for role to add.`
      };
    },
    removeRole: async (input = {}) => {
      const [existingRole] = await process.databases.postgresql.query(`SELECT * FROM roles WHERE role='${input?.role}';`);
      if (existingRole) {
        await process.databases.postgresql.query(`DELETE FROM users_roles WHERE role='${input?.role}';`);
        await process.databases.postgresql.query(`DELETE FROM roles WHERE role='${input?.role}';`);
        return {
          _id: input?.userId,
          action: "remove",
          role: input?.role,
          ok: true,
          error: null
        };
      }
      return {
        action: "add",
        role: input?.role,
        ok: false,
        error: `Could not find an existing role with the name ${input?.role}.`
      };
    },
    listRoles: async (input = {}) => {
      const roles = await process.databases.postgresql.query(`SELECT * FROM roles;`);
      return (roles || []).map(({ role }) => role);
    },
    grantRole: async (input = {}) => {
      const user = await process.databases.postgresql.query(`SELECT * FROM users WHERE user_id='${input?.userId}';`);
      if (user) {
        await process.databases.postgresql.query(`INSERT INTO users_roles(${objectToSQLKeysString({ user_id: input?.userId, role: input?.role })}) VALUES (${objectToSQLValuesString({ user_id: input?.userId, role: input?.role })}) ON CONFLICT DO NOTHING;`);
        const [existingRole] = await process.databases.postgresql.query(`SELECT * FROM roles WHERE role='${input?.role}';`);
        if (!existingRole) {
          await process.databases.postgresql.query(`INSERT INTO roles(${objectToSQLKeysString({ role: input?.role })}) VALUES (${objectToSQLValuesString({ role: input?.role })}) ON CONFLICT DO NOTHING;`);
        }
        return {
          _id: input?.userId,
          action: "grant",
          role: input?.role,
          ok: true,
          error: null
        };
      }
      return {
        _id: input?.userId,
        action: "grant",
        role: input?.role,
        ok: false,
        error: `User not found with the _id ${input?.userId}.`
      };
    },
    revokeRole: async (input = {}) => {
      const user = await process.databases.postgresql.query(`SELECT * FROM users WHERE user_id='${input?.userId}';`);
      if (user) {
        await process.databases.postgresql.query(`DELETE FROM users_roles WHERE user_id='${input?.userId}' AND role='${input?.role}';`);
        return {
          _id: input?.userId,
          action: "revoke",
          role: input?.role,
          ok: true,
          error: null
        };
      }
      return {
        _id: input?.userId,
        action: "revoke",
        role: input?.role,
        ok: false,
        error: `User not found with the _id ${input?.userId}.`
      };
    },
    userHasRole: async (input = {}) => {
      const user = await process.databases.postgresql.query(`SELECT * FROM users WHERE user_id='${input?.userId}';`);
      if (user) {
        const [existingRole] = await process.databases.postgresql.query(`SELECT * FROM users_roles WHERE user_id='${input?.userId}' AND role='${input?.role}';`);
        return !!existingRole;
      }
      return false;
    }
  }
};
export {
  userQueries_default as default
};
