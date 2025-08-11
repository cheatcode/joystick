const html = (strings, ...values) => {
  // NOTE: Intentionally simple. Gives developers a way to use lit-html in their
  // IDE without having to do anything special.
  let result = '';
  
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  
  return result;
};

export default html;
