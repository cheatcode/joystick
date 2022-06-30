import throwFrameworkError from "./throwFrameworkError";

export default (json = '{}') => {
  try {
    const parsedJSON = JSON.parse(json);
    return parsedJSON;
  } catch (exception) {
    throwFrameworkError('parseJSON', exception);
  }
};