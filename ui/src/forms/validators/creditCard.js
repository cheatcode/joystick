import { isString } from "./types";

const regex = /^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14}|^(81[0-9]{14,17}))$/;

export default (rule, value = "") => {
  if (!value) {
    return true;
  }

  if (value && !isString(value)) {
    return false;
  }

  const cardNumber = value ? value.replace(/[- ]+/g, '') : '';

  return rule === true ? cardNumber.match(new RegExp(regex)) : !cardNumber.match(new RegExp(regex));
};
