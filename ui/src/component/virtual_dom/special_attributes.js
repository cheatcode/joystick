// special_attributes.js
const special_attributes = {
  value: ['input', 'textarea', 'select', 'option'],
  checked: ['input'],
  selected: ['option'],
  disabled: ['input', 'textarea', 'select', 'button', 'option'],
  srcdoc: ['iframe'],
  muted: ['video', 'audio'],
  volume: ['video', 'audio'],
  currenttime: ['video', 'audio'],
  playbackrate: ['video', 'audio'],
  indeterminate: ['input'],
  readonly: ['input', 'textarea'],
  selectedindex: ['select']
};

const set_special_attribute = (element, key, value) => {
  const tag_name = element.tagName.toLowerCase();
  const special_config = special_attributes[key];
  
  if (!special_config) {
    return false;
  }

  const applies_to_element = special_config.includes(tag_name);
  
  if (!applies_to_element) {
    return false;
  }

  if (typeof value === 'boolean') {
    if (value) {
      element[key] = true;
      element.setAttribute(key, '');
    } else {
      element[key] = false;
      element.removeAttribute(key);
    }
    return true;
  }

  if (key === 'srcdoc') {
    const temp_div = document.createElement('div');
    temp_div.textContent = value;
    element.srcdoc = temp_div.textContent;
    return true;
  }

  element[key] = value;
  return true;
};

export { special_attributes, set_special_attribute };