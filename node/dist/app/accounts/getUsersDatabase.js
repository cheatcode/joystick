import loadSettings from "../../settings/load";
var getUsersDatabase_default = () => {
  const settings = loadSettings();
  const databases = settings?.config?.databases || [];
  const usersDatabase = databases.find((database) => !!database.users);
  return usersDatabase && usersDatabase.provider;
};
export {
  getUsersDatabase_default as default
};
