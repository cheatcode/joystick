export default (string = '') => {
  return string?.split(/\.?(?=[A-Z])/).join('_').toLowerCase();
};