import loadSettings from "../../settings/load";

export default () => {
  const settings = loadSettings();
  console.log({ settings });
  const databases = settings?.config?.databases || [];
  const usersDatabase = databases.find((database) => !!database.users);
  return usersDatabase && usersDatabase.provider;
};
