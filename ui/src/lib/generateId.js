const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890'.split('');

export default (length = 16) => {
  let id = '';
  let i = 0;

  while (i < length) {
    id += characters[Math.floor(Math.random() * (characters.length - 1))];
    i += 1;
  }

  return id;
};
