export default (string = '') => {
  return string.replace(/[A-Z]/g, (letter, index) => {
    return index == 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`;
  });
};