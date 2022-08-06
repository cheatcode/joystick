import throwFrameworkError from "./throwFrameworkError";

export default (string = '') => {
  try {
    const fragment = new DOMParser().parseFromString(string, 'text/html');
    return fragment.body.children.length > 0;
  } catch(exception) {
    throwFrameworkError('stringContainsHTML', exception);
  }  
}