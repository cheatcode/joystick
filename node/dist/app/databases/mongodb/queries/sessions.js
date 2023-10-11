import dayjs from "dayjs";
import generateId from "../../../../lib/generateId";
var sessions_default = {
  create_session: async () => {
    const session_id = generateId();
    await process.databases._sessions?.collection("sessions").insertOne({
      _id: session_id,
      csrf: generateId(32),
      createdAt: new Date().toISOString()
    });
    return session_id;
  },
  get_session: async (input = {}) => {
    return process.databases._sessions?.collection("sessions").findOne({
      _id: input?.session_id
    });
  },
  delete_expired_sessions: async () => {
    return process.databases._sessions?.collection("sessions").deleteMany({
      createdAt: { $lte: dayjs().subtract(1, "hour").format() }
    });
  }
};
export {
  sessions_default as default
};
