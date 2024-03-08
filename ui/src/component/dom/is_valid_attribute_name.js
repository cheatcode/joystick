const is_valid_attribute_name = (name = '') => {
  try {
    const element = document.createElement('div');
    element.setAttribute(name, 'Test');
    return true;
  } catch {
    return false;
  }
};

export default is_valid_attribute_name;
