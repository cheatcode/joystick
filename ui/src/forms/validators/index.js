import credit_card from './credit_card.js';
import custom from './custom.js';
import email from './email.js';
import equals from './equals.js';
import matches from './matches.js';
import max_length from './max_length.js';
import min_length from './min_length.js';
import phone from './phone.js';
import postal_code from './postal_code.js';
import regex from './regex.js';
import required from './required.js';
import semver from './semver.js';
import slug from './slug.js';
import strong_password from './strong_password.js';
import url from './url.js';
import vat from './vat.js';

const validators = {
  creditCard: credit_card,
  credit_card,
  custom,
  email,
  equals,
  matches,
  maxLength: max_length,
  max_length,
  minLength: min_length,
  min_length,
  phone,
  postalCode: postal_code,
  postal_code,
  regex,
  required,
  semVer: semver,
  semver,
  slug,
  strongPassword: strong_password,
  strong_password,
  url,
  vat,
};

export default validators;
