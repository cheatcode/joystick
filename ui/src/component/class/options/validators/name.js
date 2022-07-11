import throwFrameworkError from "../../../../lib/throwFrameworkError";

export default (value = null) => {
  if (typeof value !== "string") {
    throwFrameworkError(
      'component.optionValidators.name',
      "options.name must be a string."
    );
  }
};