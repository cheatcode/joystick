const createIndex = async (collectionName = "", index = {}, options = {}) => {
  return process.databases._users?.collection(collectionName).createIndex(index, options);
};
var createSessionsIndexes_default = async () => {
  await createIndex("sessions", { _id: 1 });
  await createIndex("sessions", { createdAt: 1 }, { expireAfterSeconds: 3600 });
};
export {
  createSessionsIndexes_default as default
};
