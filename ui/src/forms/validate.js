import throttle from "../lib/throttle";
import validators from "./validators";

class ValidateForm {
  constructor(form, options = {}) {
    this.fieldsToListenToForChanges = [
      "checkbox",
      "color",
      "date",
      "datetime-local",
      "email",
      "file",
      "hidden",
      "month",
      "number",
      "password",
      "radio",
      "range",
      "search",
      "tel",
      "text",
      "time",
      "url",
      "week",
    ];

    this.defaultValidationErrors = {
      creditCard: () => "Must be a valid credit card number.",
      custom: () => "Must return true.",
      email: () => "Must be a valid email.",
      equals: (rule) => `Value must equal ${rule}.`,
      matches: (rule) => `Field must match ${rule}.`,
      maxLength: (rule) => `Field value can be no greater than ${rule}.`,
      minLength: (rule) => `Field value can be no less than ${rule}.`,
      phone: () => `Field value must be a valid telephone number.`,
      postalCode: () => `Field value must be a valid postal code.`,
      regex: () => "Must match regex.",
      required: () => "This field is required.",
      semVer: () => `Field value must be a valid semantic version.`,
      slug: () => `Field value must be a valid URL slug.`,
      strongPassword: () => `Field value must be a valid password.`,
      url: () => `Field value must be a valid URL.`,
      vat: () => `Field value must be a valid VAT code.`,
    };

    if (!form) {
      console.warn(
        "[validateForm] Must pass an HTML <form></form> element to validate."
      );
    }

    this.form = form;
    this.setOptions(options);
    this.attachEventListeners();
  }

  setOptions(options = {}) {
    this.rules = options.rules || {};
    this.messages = options.messages || {};
    this.onSubmit = options.onSubmit;
    this.fields = this.serialize();
  }

  updateOptions(options = {}) {
    this.setOptions(options);
  }

  serialize() {
    if (this.form) {
      const fields = Object.keys(this.rules).map((name) => {
        const element = this.form.querySelector(`[name="${name}"]`);
        const type = element?.type;
        const listenForChanges = this.fieldsToListenToForChanges.includes(type);

        return {
          listenForChanges,
          type,
          name,
          element,
          validations: Object.entries(this.rules[name])
            .map(([validationName, validationRule]) => {
              return {
                name: validationName,
                rule: validationRule,
                valid: false,
              };
            })
            .sort((v1, v2) => {
              if (v1.name > v2.name) {
                return 1;
              } else {
                return -1;
              }
            }),
          errorMessages: this.messages[name] ? Object.keys(this.messages[name]) : {},
        };
      });

      return fields;
    }
  }

  attachEventListeners() {
    if (this.form) {
      const submitEventListener = (event) => {
        event.stopPropagation();
        event.preventDefault();

        const isValid = this.validate();

        if (isValid && this.onSubmit) {
          this.onSubmit();
        }
      };

      if (this.form.listeners?.length > 0) {
        for (let i = 0; i < this.form.listeners.length; i += 1) {
          const listener = this.form.listeners[i];
          this.form.removeEventListener("submit", listener);
        }
      }

      this.form.addEventListener("submit", submitEventListener);
      this.form.listeners = [
        ...(this.form.listeners || []),
        submitEventListener,
      ];
    }

    this.fields.forEach((field) => {
      if (field?.element && field?.listenForChanges) {
        const fieldEventListener = () => {
          throttle(() => {
            this.validate(field.name);
          }, 100);
        };

        field.element.removeEventListener("input", fieldEventListener);
        field.element.addEventListener("input", fieldEventListener);

        field.element.removeEventListener("change", fieldEventListener);
        field.element.addEventListener("change", fieldEventListener);
      }
    });
  }

  validate(fieldName = null) {
    if (!fieldName) {
      this.clearExistingErrors();

      this.fields.forEach((field) => {
        this.validateField(field);
      });

      return this.checkIfValid();
    } else {
      this.clearExistingErrors();
      const field = this.fields.find((field) => field.name === fieldName);
      this.validateField(field);
      return this.checkIfValid();
    }
  }

  checkIfValid() {
    const fieldsWithValidations = this.fields.map((field) => {
      return field.validations.some((validation) => {
        return !validation.valid;
      });
    });

    return !fieldsWithValidations.includes(true);
  }

  validateField(field) {
    const fieldInput = this.form.querySelector(`[name="${field.name}"]`);
    const isChecked = ["checkbox", "radio"].includes(field.type);
    const value = !isChecked ? field?.element?.value?.trim() : null;
    const checked = isChecked ? field?.element?.checked : null;

    field.validations.forEach((validation) => {
      if (
        !this.isValidValue(isChecked, isChecked ? checked : value, validation)
      ) {
        const errorMessage = this.messages[field.name] && this.messages[field.name][validation.name];
        this.markValidationAsInvalid(field, validation.name);
        this.renderError(
          field.element,
          errorMessage || this.defaultValidationErrors[validation.name](validation.rule, value)
        );
      } else {
        this.markValidationAsValid(field, validation.name);
      }
    });

    const hasInvalidValidations = field.validations.some((validation) => {
      return !validation.valid;
    });

    if (hasInvalidValidations) {
      fieldInput.classList.add("error");
      fieldInput.focus();
    }

    if (!hasInvalidValidations) {
      fieldInput.classList.remove("error");
      this.clearExistingError(field.name);
    }

    return !hasInvalidValidations;
  }

  markValidationAsInvalid(field, validation) {
    const updatedValidations = [...field.validations];
    const validationToMark = updatedValidations.find(
      (updatedValidation) => updatedValidation.name === validation
    );
    validationToMark.valid = false;
  }

  markValidationAsValid(field, validation) {
    const updatedValidations = [...field.validations];
    const validationToMark = updatedValidations.find(
      (updatedValidation) => updatedValidation.name === validation
    );
    validationToMark.valid = true;
  }

  isValidValue(isChecked, value, validation) {
    const validator = validators[validation.name];

    if (validator) {
      return validator(validation.rule, value, { isChecked });
    }

    return true;
  }

  clearExistingErrors() {
    if (this.form) {
      this.form
        .querySelectorAll(".input-hint.error")
        .forEach((element) => element.remove());
    }
  }

  clearExistingError(name = "") {
    const existingError = document.getElementById(`error-${name}`);
    if (existingError) {
      existingError.remove();
    }
  }

  renderError(element, message = "") {
    if (element) {
      this.clearExistingError(element.name);

      const error = document.createElement("p");

      error.classList.add("input-hint");
      error.classList.add("error");
      error.setAttribute("id", `error-${element.name}`);
      error.innerText = message;

      element.after(error);
    }
  }
}

const validateForm = (form, options) => {
  return new Promise((resolve, reject) => {
    try {
      const validation = new ValidateForm(form, options);
      const isValid = validation.validate();
    
      if (isValid) {
        resolve();
      } else {
        reject();
      }
    } catch (exception) {
      console.warn(exception);
    }
  });
};

export default validateForm;
