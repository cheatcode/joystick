import throwError from "../lib/throwError";
import { isObject } from "../lib/typeValidators";
import constants from "../lib/constants";

const validateRuleType = (schema) => {
  Object.entries(schema || {}).forEach(([field, rules]) => {
    if (rules && rules.type && !constants.types.includes(rules.type)) {
      throw new Error(
        `Invalid value for schema field "${field}" type rule. ${
          rules.type
        } is not supported. Use one of the following: ${constants.types
          .slice(0, constants.types.length - 1)
          .join(", ")}, or ${constants.types[constants.types.length - 1]}.`
      );
    }
  });
};

const validateRuleNames = (schema) => {
  Object.entries(schema || {}).forEach(([field, rules]) => {
    Object.keys(rules || {}).forEach((ruleName) => {
      const ruleNames = Object.keys(constants.rules || {});
      if (!ruleNames.includes(ruleName)) {
        throw new Error(
          `Invalid rule name ${ruleName} in rule for ${field} field.`
        );
      }
    });
  });
};

const validateRulesAreObjects = (schema) => {
  Object.entries(schema || {}).forEach(([field, rules]) => {
    if (!isObject(rules)) {
      throw new Error(
        `Must pass an object containing rules to validate by for ${field} field.`
      );
    }
  });
};

const validateSchemaStructure = (schema) => {
  validateRulesAreObjects(schema);
  validateRuleNames(schema);
  validateRuleType(schema);
};

export default (schema = null) => {
  if (!schema) {
    throwError("Must pass schema object.");
  }

  if (schema && !isObject(schema)) {
    throwError("Must pass schema as an object.");
  }

  validateSchemaStructure(schema);
};
