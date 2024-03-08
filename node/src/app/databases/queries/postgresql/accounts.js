import generate_id from "../../../../lib/generate_id.js";
import camel_pascal_to_snake from "../../../../lib/camel_pascal_to_snake.js";

const accounts = {
  add_password_reset_token: async (input = {}) => {
    const [user] = await process.databases._users?.query(
      `SELECT user_id FROM users WHERE email_address = $1;`,
      [input?.email_address]
    );

    await process.databases._users?.query(
      `INSERT INTO users_password_reset_tokens(user_id, token, requested_at) VALUES ($1, $2, $3);`,
      [user?.user_id, input?.token, new Date().toISOString()],
    );
  },
  add_role: async (input = {}) => {
    const [existing_role] = await process.databases._users?.query(
      `SELECT * FROM roles WHERE role = $1;`,
      [input?.role]
    );

    if (!existing_role && input?.role) {
      await process.databases._users?.query(
        `INSERT INTO roles(role) VALUES ($1);`,
        [input?.role],
      );

      return {
        _id: input?.user_id,
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
	add_session: async (input = {}) => {
    await process.databases._users?.query(
      `INSERT INTO users_sessions(user_id, token, token_expires_at) VALUES ($1, $2, $3);`,
      [input?.user_id, input?.session?.token, input?.session?.token_expires_at]
    );
  },
  create_email_verification_token: async (input = {}) => {
    const token = generate_id(16);

    await process.databases._users?.query(
      `INSERT INTO users_verify_email_tokens(user_id, token) VALUES ($1, $2);`,
      [input?.user_id, token]
    );

    return token;
  },
  create_user: async (input = {}) => {
    const user_id = generate_id(16);

    const keys = ['user_id', ...(Object.keys(input || {}) || [])]?.map((input_key) => {
      return camel_pascal_to_snake(input_key);
    })?.join(',');

    const values = [user_id, ...(Object.values(input) || [])];

    await process.databases._users?.query(
      `INSERT INTO users(${keys}) VALUES (${values?.map((_, index) => `$${index + 1}`)});`,
      values,
    );

    return user_id;
  },
  delete_old_sessions: async (input = {}) => {
    await process.databases._users?.query(
      `DELETE FROM users_sessions WHERE user_id = $1 AND token_expires_at::timestamp < NOW()`,
      [input?.user_id]
    );
  },
  delete_user: async (input = {}) => {
    await process.databases._users?.query(
      `DELETE FROM users WHERE user_id = $1`,
      [input?.user_id]
    );
  },
  existing_user: async (input = {}) => {
    let existing_user_with_email_address;
    let existing_user_with_username;

    if (input?.email_address) {
      const [existing_user] = await process.databases._users?.query(
        `SELECT * FROM users WHERE email_address = $1;`,
        [input?.email_address]
      );

      existing_user_with_email_address = existing_user;
    }

    if (input?.username) {
      const [existing_user] = await process.databases._users?.query(
        `SELECT * FROM users WHERE username = $1;`,
        [input?.username]
      );

      existing_user_with_username = existing_user;
    }

    return existing_user_with_email_address || existing_user_with_username ? {
      existing_email_address: existing_user_with_email_address?.email_address,
      existing_username: existing_user_with_username?.username,
    } : null;
  },
  get_existing_session: async (input = {}) => {
    const user_sessions = await process.databases._users?.query(
      `SELECT * FROM users_sessions WHERE user_id = $1;`,
      [input.user_id]
    );

    if (user_sessions?.length > 0) {
      const sessions_by_last_to_expire = user_sessions.sort((a, b) => {
        return a.token_expires_at > b.token_expires_at ? -1 : 1;
      });
      
      return sessions_by_last_to_expire.shift();
    }

    return null;
  },
  get_password_reset_token: async (input = {}) => {
    const [password_reset_token] = await process.databases._users?.query(
      `SELECT * FROM users_password_reset_tokens WHERE user_id = $1`,
      [input?.user_id],
    );

    if (password_reset_token) {
      return password_reset_token?.token || null;
    }

    return null;
  },
  grant_role: async (input = {}) => {
    const user = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [input?.user_id]
    );

    if (user) {
      await process.databases._users?.query(
        `INSERT INTO users_roles(user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [input?.user_id, input?.role]
      );

      const [existing_role] = await process.databases._users?.query(
        `SELECT * FROM roles WHERE role = $1;`,
        [input?.role]
      );

      if (!existing_role) {
        await process.databases._users?.query(
          `INSERT INTO roles(role) VALUES ($1) ON CONFLICT DO NOTHING;`,
          [input?.role]
        );
      }

      return {
        _id: input?.user_id,
        action: "grant",
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      _id: input?.user_id,
      action: "grant",
      role: input?.role,
      ok: false,
      error: `User not found with the _id ${input?.user_id}.`,
    };
  },
  list_roles: async () => {
    const roles = await process.databases._users?.query(
      `SELECT * FROM roles;`
    );

    return (roles || []).map(({ role }) => role);
  },
  mark_email_verified_at: async (input = {}) => {
    await process.databases._users?.query(
      `UPDATE users SET email_verified = true, email_verified_at = $1 WHERE user_id = $2;`,
      [new Date().toISOString(), input?.user_id]
    );

    await process.databases._users?.query(
      `DELETE FROM users_verify_email_tokens WHERE token = $1`,
      [input?.token]
    );
  },
  remove_reset_token: async (input = {}) => {
    await process.databases._users?.query(
      `DELETE FROM users_password_reset_tokens WHERE user_id = $1 AND token = $2;`,
      [input?.user_id, input?.token],
    );

    const [user] = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [input?.user_id]
    );

    return user;
  },
  remove_role: async (input = {}) => {
    const [existing_role] = await process.databases._users?.query(
      `SELECT * FROM roles WHERE role = $1;`,
      [input?.role]
    );

    if (existing_role) {
      await process.databases._users?.query(
        `DELETE FROM users_roles WHERE role = $1;`,
        [input?.role]
      );

      await process.databases._users?.query(
        `DELETE FROM roles WHERE role = $1;`,
        [input?.role]
      );

      return {
        _id: input?.user_id,
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
  reset_user_sessions: async (input = {}) => {
    await process.databases._users?.query(
      `DELETE FROM users_sessions WHERE user_id = $1;`,
      [input.user_id]
    );
  },
  revoke_role: async (input = {}) => {
    const user = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [input?.user_id]
    );

    if (user) {
      await process.databases._users?.query(
        `DELETE FROM users_roles WHERE user_id = $1 AND role = $2;`,
        [input?.user_id, input?.role]
      );

      return {
        _id: input?.user_id,
        action: "revoke",
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      _id: input?.user_id,
      action: "revoke",
      role: input?.role,
      ok: false,
      error: `User not found with the _id ${input?.user_id}.`,
    };
  },
  set_new_password: async (input = {}) => {
    await process.databases._users?.query(
      `UPDATE users SET password = $1 WHERE user_id = $2;`,
      [input?.hashed_password, input?.user_id],
    );
  },
  user: async (input = {}) => {
    if (input?.email_address) {
      const [user] = await process.databases._users?.query(
        `SELECT * FROM users WHERE email_address = $1;`,
        [input?.email_address]
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
  user_has_role: async (input = {}) => {
    const user = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [input?.user_id]
    );

    if (user) {
      const [existing_role] = await process.databases._users?.query(
        `SELECT * FROM users_roles WHERE user_id = $1 AND role = $2;`,
        [input?.user_id, input?.role]
      );

      return !!existing_role;
    }

    return false;
  },
  user_with_login_token: async (input = {}) => {
    const [existing_user] = await process.databases._users?.query(
      `SELECT user_id FROM users_sessions WHERE token = $1;`,
      [input.token]
    );

    const [user] = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [existing_user?.user_id],
    );

    return user;
  },
  user_with_reset_token: async (input = {}) => {
    const [existing_user] = await process.databases._users?.query(
      `SELECT user_id FROM users_password_reset_tokens WHERE token = $1;`,
      [input["passwordResetTokens.token"]],
    );

    const [user] = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [existing_user?.user_id]
    );

    return user;
  },
  user_with_verify_email_token: async (input = {}) => {
    const [existing_user] = await process.databases._users?.query(
      `SELECT user_id FROM users_verify_email_tokens WHERE token = $1;`,
      [input.token],
    );

    const [user] = await process.databases._users?.query(
      `SELECT * FROM users WHERE user_id = $1;`,
      [existing_user?.user_id],
    );

    return user;
  },
};

export default accounts;
