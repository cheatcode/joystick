import generateId from "../../lib/generateId";

export default {
  mongodb: {
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
  },
};
