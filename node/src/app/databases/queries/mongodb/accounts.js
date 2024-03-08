import generate_id from "../../../../lib/generate_id.js";

const accounts = {
	add_password_reset_token: (input = {}) => {
    return process.databases._users?.collection("users").updateOne({
      emailAddress: input.email_address,
    }, {
      $addToSet: {
        passwordResetTokens: {
          token: input.token,
          requestedAt: new Date().toISOString(),
        },
      },
    });
  },
  add_role: async (input = {}) => {
    const existing_role = input?.role
      ? await process.databases._users?.collection("roles").findOne({ role: input?.role })
      : null;

    if (!existing_role && input?.role) {
      await process.databases._users?.collection("roles").insertOne({
        _id: generate_id(16),
        role: input?.role,
      });

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
    await process.databases._users?.collection("users").updateOne({
      _id: input.user_id,
    }, {
      $addToSet: {
        sessions: input.session,
      },
    });
  },
  create_email_verification_token: async (input = {}) => {
    const token = generate_id(16);

    await process.databases._users?.collection("users").updateOne({
      _id: input?.user_id,
    }, {
      $addToSet: {
        verifyEmailTokens: {
          userId: input?.user_id,
          token,
        },
      },
    });

    return token;
  },
  create_user: async (input = {}) => {
    const user_id = generate_id(16);
    await process.databases._users?.collection("users").insertOne({
      _id: user_id,
      ...input,
      sessions: [],
    });

    return user_id;
  },
  delete_old_sessions: async (input = {}) => {
    const user = await process.databases._users?.collection('users').findOne({
      _id: input?.user_id,
    });

    if (user) {
      const sessions = user?.sessions?.filter((session) => {
        // NOTE: If tokenExpiresAt is after today, it hasn't expired yet, so keep it.
        return new Date(session?.tokenExpiresAt || session?.token_expires_at).toISOString() > new Date().toISOString();
      });

      await process.databases._users?.collection("users").updateOne({
        _id: input.user_id,
      }, {
        $set: {
          sessions,
        },
      });
    }
  },
  delete_user: async (input = {}) => {
    return process.databases._users?.collection('users').deleteOne({
      _id: input?.user_id,
    });
  },
  existing_user: async (input = {}) => {
    let existing_user_with_email_address;
    let existing_user_with_username;

    if (input?.email_address) {
      existing_user_with_email_address = await process.databases._users?.collection("users").findOne({ emailAddress: input.email_address });
    }

    if (input?.username) {
      existing_user_with_username = await process.databases._users?.collection("users").findOne({ username: input.username });
    }

    return existing_user_with_email_address || existing_user_with_username ? {
      existing_email_address: existing_user_with_email_address?.emailAddress,
      existing_username: existing_user_with_username?.username,
    } : null;
  },
  get_existing_session: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({ _id: input?.user_id });

    if (user?.sessions?.length > 0) {
      const sessions_by_last_to_expire = user?.sessions.sort((a, b) => {
        return (a.tokenExpiresAt || a.token_expires_at) > (b.tokenExpiresAt || b.token_expires_at) ? -1 : 1;
      });

      return sessions_by_last_to_expire.shift();
    }

    return null;
  },
  get_password_reset_token: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({ _id: input?.user_id });

    if (user) {
      return user?.passwordResetTokens && user?.passwordResetTokens[0]?.token || null;
    }

    return null;
  },
  grant_role: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({ _id: input?.user_id });

    if (user) {
      await process.databases._users?.collection("users").updateOne({
      	_id: input?.user_id
      }, {
        $addToSet: {
          roles: input?.role,
        },
      });

      const existing_role = await process.databases._users?.collection("roles").findOne({ role: input?.role });

      if (!existing_role) {
        await process.databases._users?.collection("roles").insertOne({
          _id: generate_id(16),
          role: input?.role,
        });
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
    const roles = await process.databases._users?.collection("roles").find().toArray();
    return (roles || []).map(({ role }) => role);
  },
  mark_email_verified_at: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({
      _id: input?.user_id,
    });

    await process.databases._users?.collection("users").updateOne({
      _id: input?.user_id,
    }, {
      $set: {
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
        verifyEmailTokens: user?.verifyEmailTokens?.filter(
          (verify_email_token) => {
            return verify_email_token?.token === input?.token;
          }
        ),
      },
    });

    return true;
  },
  remove_reset_token: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({ _id: input?.user_id });

    await process.databases._users?.collection("users").updateOne({
      _id: input?.user_id,
    }, {
      $set: {
        passwordResetTokens: user?.passwordResetTokens?.filter(
          ({ token }) => {
            return token !== input?.token;
          }
        ),
      },
    });

    return process.databases._users?.collection("users").findOne({ _id: input?.user_id });
  },
  remove_role: async (input = {}) => {
    const existing_role = input?.role
      ? await process.databases._users?.collection("roles").findOne({ role: input?.role })
      : null;

    if (existing_role) {
      await process.databases._users?.collection("users").updateMany({
        roles: { $in: [input?.role] },
      }, {
        $pull: {
          roles: input?.role,
        },
      });

      await process.databases._users?.collection("roles").deleteOne({
        role: input?.role,
      });

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
    const user = await process.databases._users?.collection('users').findOne({
      _id: input?.user_id,
    });

    if (user) {
      await process.databases._users?.collection("users").updateOne({
        _id: input.user_id,
      }, {
        $set: {
          sessions: [],
        },
      });
    }
  },
  revoke_role: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({ _id: input?.user_id });
    if (user && user.roles) {
      await process.databases._users?.collection("users").updateOne({
      	_id: input?.user_id
      }, {
        $pull: {
          roles: input?.role,
        },
      });

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
    return process.databases._users?.collection("users").updateOne({
      _id: input?.user_id,
    }, {
      $set: {
        password: input?.hashed_password,
      },
    });
  },
  user: async (input = {}) => {
    if (input?.email_address) {
      const user = await process.databases._users?.collection("users").findOne({ emailAddress: input.email_address });
      return user;
    }

    if (input?.username) {
      const user = await process.databases._users?.collection("users").findOne({ username: input.username });
      return user;
    }

    if (input?._id) {
      const user = await process.databases._users?.collection("users").findOne({ _id: input._id });
      return user;
    }

    return null;
  },
  user_has_role: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({ _id: input?.user_id });

    if (user && user.roles) {
      return user?.roles?.includes(input?.role);
    }

    return false;
  },
  user_with_login_token: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({
      "sessions.token": input?.token,
    });

    return user;
  },
  user_with_reset_token: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({
      "passwordResetTokens.token": input["passwordResetTokens.token"],
    });
    
    return user;
  },
  user_with_verify_email_token: async (input = {}) => {
    const user = await process.databases._users?.collection("users").findOne({
      "verifyEmailTokens.token": input?.token,
    });

    return user;
  },
};

export default accounts;
