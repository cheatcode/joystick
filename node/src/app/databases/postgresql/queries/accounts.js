import generateId from "../../../../lib/generateId";
import objectToSQLKeysString from "../../../../lib/objectToSQLKeysString";
import objectToSQLValuesString from "../../../../lib/objectToSQLValuesString";
import camelPascalToSnake from "../../../../lib/camelPascalToSnake.js";

export default {
  existingUser: async (input = {}) => {
    let existingUserWithEmailAddress;
    let existingUserWithUsername;

    if (input?.emailAddress) {
      const [existingUser] = await process.databases._users?.query(
        `SELECT * FROM users WHERE email_address = $1;`,
        [input?.emailAddress]
      );

      existingUserWithEmailAddress = existingUser;
    }

    if (input?.username) {
      const [existingUser] = await process.databases._users?.query(
        `SELECT * FROM users WHERE username = $1;`,
        [input?.username]
      );

      existingUserWithUsername = existingUser;
    }

    return existingUserWithEmailAddress || existingUserWithUsername
      ? {
          existingEmailAddress: existingUserWithEmailAddress?.email_address,
          existingUsername: existingUserWithUsername?.username,
        }
      : null;
  },
  createUser: async (input = {}) => {
    const userId = generateId();

    const keys = ['user_id', ...(Object.keys(input || {}) || [])]?.map((inputKey) => {
      return camelPascalToSnake(inputKey);
    })?.join(',');

    const values = [userId, ...(Object.values(input) || [])];

    await process.databases._users?.query(
      `INSERT INTO users(${keys}) VALUES (${values?.map((_, index) => `$${index + 1}`)});`,
      values,
    );

    return userId;
  },
  user: async (input) => {
    if (input?.emailAddress) {
      const [user] = await process.databases._users?.query(
        `SELECT * FROM users WHERE email_address = $1;`,
        [input?.emailAddress]
      );

      return user;
    }

    if (input?.username) {
      const [user] = await process.databases._users?.query(
        `SELECT * FROM users WHERE username = $1;`,
        [input?.username]
      );

      return user;
    }

    if (input?._id) {
      const [user] = await process.databases._users?.query(
        `SELECT * FROM users WHERE user_id = $1;`,
        [input?._id]
      );

      return user;
    }

    return null;
  },
  deleteUser: async (input = {}) => {
    await process.databases._users?.query(
      `DELETE FROM users WHERE user_id = $1`,
      [input?.userId]
    );
  },
  deleteOldSessions: async (input = {}) => {
    await process.databases._users?.query(
      `DELETE FROM users_sessions WHERE user_id = $1 AND token_expires_at::timestamp < NOW()`,
      [input?.userId]
    );
  },
  addSession: async (input = {}) => {
    await process.databases._users?.query(
      `INSERT INTO users_sessions(user_id, token, token_expires_at) VALUES ($1, $2, $3);`,
      [input?.userId, input?.session?.token, input?.session?.tokenExpiresAt]
    );
  },
  userWithLoginToken: async (input) => {
    const [existingUser] = await process.databases._users?.query(
      `SELECT user_id FROM users_sessions WHERE token = $1;`,
      [input.token]
    );

    const [user] = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [existingUser?.user_id],
    );

    return user;
  },
  createEmailVerificationToken: async (input) => {
    const token = generateId();

    await process.databases._users?.query(
      `INSERT INTO users_verify_email_tokens(user_id, token) VALUES ($1, $2);`,
      [input?.userId, token]
    );

    return token;
  },
  userWithVerifyEmailToken: async (input) => {
    const [existingUser] = await process.databases._users?.query(
      `SELECT user_id FROM users_verify_email_tokens WHERE token = $1;`,
      [input.token],
    );

    const [user] = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [existingUser?.user_id],
    );

    return user;
  },
  markEmailVerifiedAt: async (input) => {
    await process.databases._users?.query(
      `UPDATE users SET email_verified = true, email_verified_at = $1 WHERE user_id = $2;`,
      [new Date().toISOString(), input?.userId]
    );

    await process.databases._users?.query(
      `DELETE FROM users_verify_email_tokens WHERE token = $1`,
      [input?.token]
    );
  },
  addPasswordResetToken: async (input = {}) => {
    const [user] = await process.databases._users?.query(
      `SELECT user_id FROM users WHERE email_address = $1;`,
      [input?.emailAddress]
    );

    await process.databases._users?.query(
      `INSERT INTO users_password_reset_tokens(user_id, token, requested_at) VALUES ($1, $2, $3);`,
      [user?.user_id, input?.token, new Date().toISOString()],
    );
  },
  userWithResetToken: async (input) => {
    const [existingUser] = await process.databases._users?.query(
      `SELECT user_id FROM users_password_reset_tokens WHERE token = $1;`,
      [input["passwordResetTokens.token"]],
    );

    const [user] = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [existingUser?.user_id]
    );

    return user;
  },
  setNewPassword: async (input = {}) => {
    await process.databases._users?.query(
      `UPDATE users SET password = $1 WHERE user_id = $2;`,
      [input?.hashedPassword, input?.userId],
    );
  },
  removeResetToken: async (input = {}) => {
    await process.databases._users?.query(
      `DELETE FROM users_password_reset_tokens WHERE user_id = $1 AND token = $2;`,
      [input?.userId, input?.token],
    );

    const [user] = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [input?.userId]
    );

    return user;
  },
  addRole: async (input = {}) => {
    const [existingRole] = await process.databases._users?.query(
      `SELECT * FROM roles WHERE role = $1;`,
      [input?.role]
    );

    if (!existingRole && input?.role) {
      await process.databases._users?.query(
        `INSERT INTO roles(role) VALUES ($1);`,
        [input?.role],
      );

      return {
        _id: input?.userId,
        action: "add",
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      action: "add",
      role: input?.role,
      ok: false,
      error: input?.role
        ? `Role already exists: ${input?.role}.`
        : `Must pass a name for role to add.`,
    };
  },
  removeRole: async (input = {}) => {
    const [existingRole] = await process.databases._users?.query(
      `SELECT * FROM roles WHERE role = $1;`,
      [input?.role]
    );

    if (existingRole) {
      await process.databases._users?.query(
        `DELETE FROM users_roles WHERE role = $1;`,
        [input?.role]
      );

      await process.databases._users?.query(
        `DELETE FROM roles WHERE role = $1;`,
        [input?.role]
      );

      return {
        _id: input?.userId,
        action: "remove",
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      action: "add",
      role: input?.role,
      ok: false,
      error: `Could not find an existing role with the name ${input?.role}.`,
    };
  },
  listRoles: async (input = {}) => {
    const roles = await process.databases._users?.query(
      `SELECT * FROM roles;`
    );

    return (roles || []).map(({ role }) => role);
  },
  grantRole: async (input = {}) => {
    const user = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [input?.userId]
    );

    if (user) {
      await process.databases._users?.query(
        `INSERT INTO users_roles(user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [input?.userId, input?.role]
      );

      const [existingRole] = await process.databases._users?.query(
        `SELECT * FROM roles WHERE role = $1;`,
        [input?.role]
      );

      if (!existingRole) {
        await process.databases._users?.query(
          `INSERT INTO roles(role) VALUES ($1) ON CONFLICT DO NOTHING;`,
          [input?.role]
        );
      }

      return {
        _id: input?.userId,
        action: "grant",
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      _id: input?.userId,
      action: "grant",
      role: input?.role,
      ok: false,
      error: `User not found with the _id ${input?.userId}.`,
    };
  },
  revokeRole: async (input = {}) => {
    const user = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [input?.userId]
    );

    if (user) {
      await process.databases._users?.query(
        `DELETE FROM users_roles WHERE user_id = $1 AND role = $2;`,
        [input?.userId, input?.role]
      );

      return {
        _id: input?.userId,
        action: "revoke",
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      _id: input?.userId,
      action: "revoke",
      role: input?.role,
      ok: false,
      error: `User not found with the _id ${input?.userId}.`,
    };
  },
  userHasRole: async (input = {}) => {
    const user = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [input?.userId]
    );

    if (user) {
      const [existingRole] = await process.databases._users?.query(
        `SELECT * FROM users_roles WHERE user_id = $1 AND role = $2;`,
        [input?.userId, input?.role]
      );

      return !!existingRole;
    }

    return false;
  },
};
