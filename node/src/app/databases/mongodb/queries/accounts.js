import generateId from '../../../../lib/generateId';

export default {
  existingUser: async (input = {}) => {
    let existingUserWithEmailAddress;
    let existingUserWithUsername;

    if (input?.emailAddress) {
      existingUserWithEmailAddress = await process.databases.mongodb
        .collection("users")
        .findOne({ emailAddress: input.emailAddress });
    }

    if (input?.username) {
      existingUserWithUsername = await process.databases.mongodb
        .collection("users")
        .findOne({ username: input.username });
    }

    return existingUserWithEmailAddress || existingUserWithUsername
      ? {
          existingEmailAddress: existingUserWithEmailAddress?.emailAddress,
          existingUsername: existingUserWithUsername?.username,
        }
      : null;
  },
  createUser: async (input = {}) => {
    const userId = generateId();
    await process.databases.mongodb
      .collection("users")
      .insertOne({ _id: userId, ...input });
    return userId;
  },
  user: async (input) => {
    if (input?.emailAddress) {
      const user = await process.databases.mongodb
        .collection("users")
        .findOne({ emailAddress: input.emailAddress });
      return user;
    }

    if (input?.username) {
      const user = await process.databases.mongodb
        .collection("users")
        .findOne({ username: input.username });
      return user;
    }

    if (input?._id) {
      const user = await process.databases.mongodb
        .collection("users")
        .findOne({ _id: input._id });
      return user;
    }

    return null;
  },
  addSession: async (input = {}) => {
    await process.databases.mongodb.collection("users").updateOne(
      {
        _id: input.userId,
      },
      {
        $addToSet: {
          sessions: input.session,
        },
      }
    );
  },
  userWithLoginToken: async (input) => {
    const user = await process.databases.mongodb.collection("users").findOne({
      "sessions.token": input?.token,
    });

    return user;
  },
  addPasswordResetToken: (input = {}) => {
    return process.databases.mongodb.collection("users").updateOne(
      {
        emailAddress: input.emailAddress,
      },
      {
        $addToSet: {
          passwordResetTokens: {
            token: input.token,
            requestedAt: new Date().toISOString(),
          },
        },
      }
    );
  },
  userWithResetToken: async (input) => {
    const user = await process.databases.mongodb.collection("users").findOne({
      "passwordResetTokens.token": input["passwordResetTokens.token"],
    });
    return user;
  },
  setNewPassword: async (input = {}) => {
    return process.databases.mongodb.collection("users").updateOne(
      {
        _id: input?.userId,
      },
      {
        $set: {
          password: input?.hashedPassword,
        },
      }
    );
  },
  removeResetToken: async (input = {}) => {
    const user = await process.databases.mongodb
      .collection("users")
      .findOne({ _id: input?.userId });

    await process.databases.mongodb.collection("users").updateOne(
      {
        _id: input?.userId,
      },
      {
        $set: {
          passwordResetTokens: user?.passwordResetTokens?.filter(
            ({ token }) => {
              return token !== input?.token;
            }
          ),
        },
      }
    );

    return process.databases.mongodb.collection("users").findOne({ _id: input?.userId });
  },
  addRole: async (input = {}) => {
    const existingRole = input?.role ? await process.databases.mongodb.collection("roles").findOne({ role: input?.role }) : null;

    if (!existingRole && input?.role) {
      await process.databases.mongodb.collection("roles").insertOne({
        _id: generateId(),
        role: input?.role,
      });

      return {
        _id: input?.userId,
        action: 'add',
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      action: 'add',
      role: input?.role,
      ok: false,
      error: input?.role ? `Role already exists: ${input?.role}.` : `Must pass a name for role to add.`,
    };
  },
  removeRole: async (input = {}) => {
    const existingRole = input?.role ? await process.databases.mongodb.collection("roles").findOne({ role: input?.role }) : null;

    if (existingRole) {
      await process.databases.mongodb.collection("users").updateMany({
        roles: { $in: [input?.role] }
      }, {
        $pull: {
          roles: input?.role,
        }
      });

      await process.databases.mongodb.collection("roles").deleteOne({
        role: input?.role,
      });

      return {
        _id: input?.userId,
        action: 'remove',
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      action: 'add',
      role: input?.role,
      ok: false,
      error: `Could not find an existing role with the name ${input?.role}.`,
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
          roles: input?.role,
        },
      });

      const existingRole = await process.databases.mongodb.collection("roles").findOne({ role: input?.role });

      if (!existingRole) {
        await process.databases.mongodb.collection("roles").insertOne({
          _id: generateId(),
          role: input?.role,
        });
      }

      return {
        _id: input?.userId,
        action: 'grant',
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      _id: input?.userId,
      action: 'grant',
      role: input?.role,
      ok: false,
      error: `User not found with the _id ${input?.userId}.`,
    };
  },
  revokeRole: async (input = {}) => {
    const user = await process.databases.mongodb.collection("users").findOne({ _id: input?.userId });

    if (user && user.roles) {
      await process.databases.mongodb.collection("users").updateOne({ _id: input?.userId }, {
        $pull: {
          roles: input?.role,
        },
      });

      return {
        _id: input?.userId,
        action: 'revoke',
        role: input?.role,
        ok: true,
        error: null,
      };
    }

    return {
      _id: input?.userId,
      action: 'revoke',
      role: input?.role,
      ok: false,
      error: `User not found with the _id ${input?.userId}.`,
    };
  },
  userHasRole: async (input = {}) => {
    const user = await process.databases.mongodb.collection("users").findOne({ _id: input?.userId });

    if (user && user.roles) {
      return user?.roles?.includes(input?.role);
    }

    return false;
  },
};
