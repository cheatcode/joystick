import types from "../../lib/types.js";

const regex = /^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14}|^(81[0-9]{14,17}))$/;

const credit_card = (rule, value = "") => {
  if (!value) {
    return true;
  }

  if (value && !types.is_string(value)) {
    return false;
  }

  const card_number = value ? value.replace(/[- ]+/g, '') : '';

  return rule === true ? card_number.match(new RegExp(regex)) : !card_number.match(new RegExp(regex));
};

export default credit_card;
