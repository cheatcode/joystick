export default (name = '') => {
  try {
    const element = document.createElement('div');
    element.setAttribute(name, 'Test');
    return true;
  } catch {
    return false;
  }
};
