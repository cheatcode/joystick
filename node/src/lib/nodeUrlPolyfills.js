import { URL } from 'url';

export default {
  __filename: (url = null) => {
    if (!url) {
      return '';
    }

    return new URL('', url).pathname;
  },
  __dirname: (url = null) => {
    if (!url) {
      return '';
    }

    return new URL('.', url).pathname;
  },
};