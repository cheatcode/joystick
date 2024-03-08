const camel_pascal_to_snake = (string = '') => {
  return string.replace(/[A-Z]/g, (letter, index) => {
    return index == 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`;
  });
};

export default camel_pascal_to_snake;