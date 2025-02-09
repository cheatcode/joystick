import debounce from "../lib/debounce.js";
import validators from "./validators/index.js";

class ValidateForm {
  constructor(form, options = {}) {
    this.fields_to_listen_to_for_changes = [
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

    this.default_validation_errors = {
      credit_card: () => "Must be a valid credit card number.",
      creditCard: () => "Must be a valid credit card number.",
      custom: () => "Must return true.",
      email: () => "Must be a valid email.",
      equals: (rule) => `Value must equal ${rule}.`,
      matches: (rule) => `Field must match ${rule}.`,
      max_length: (rule) => `Field value can be no greater than ${rule}.`,
      maxLength: (rule) => `Field value can be no greater than ${rule}.`,
      min_length: (rule) => `Field value can be no less than ${rule}.`,
      minLength: (rule) => `Field value can be no less than ${rule}.`,
      phone: () => `Field value must be a valid telephone number.`,
      postal_code: () => `Field value must be a valid postal code.`,
      postalCode: () => `Field value must be a valid postal code.`,
      regex: () => "Must match regex.",
      required: () => "This field is required.",
      semver: () => `Field value must be a valid semantic version.`,
      semVer: () => `Field value must be a valid semantic version.`,
      slug: () => `Field value must be a valid URL slug.`,
      strong_password: () => `Field value must be a valid password.`,
      strongPassword: () => `Field value must be a valid password.`,
      url: () => `Field value must be a valid URL.`,
      vat: () => `Field value must be a valid VAT code.`,
    };

    if (!form) {
      console.warn(
        "[validate_form] Must pass an HTML <form></form> element to validate."
      );
    }

    this.form = form;
    this.set_options(options);
    this.attach_event_listeners();
  }

  set_options(options = {}) {
    this.rules = options.rules || {};
    this.messages = options.messages || {};
    this.onSubmit = options.onSubmit;
    this.on_render_error = options.on_render_error || options.onRenderError;
    this.fields = this.serialize();
  }

  update_options(options = {}) {
    this.set_options(options);
  }

  serialize() {
    if (this.form) {
      const fields = Object.keys(this.rules).map((name) => {
        const element = this.form.querySelector(`[name="${name}"]`);
        const type = element?.type;
        const listen_for_changes = this.fields_to_listen_to_for_changes.includes(type);

        return {
          listen_for_changes,
          type,
          name,
          element,
          validations: Object.entries(this.rules[name])
            .map(([validation_name, validation_rule]) => {
              return {
                name: validation_name,
                rule: validation_rule,
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

      return fields?.filter((field) => {
        return !!field?.element;
      });
    }
  }

  attach_event_listeners() {
    if (this.form) {
      const submit_event_listener = (event) => {
        event.stopPropagation();
        event.preventDefault();

        const is_valid = this.validate();

        if (is_valid && this.onSubmit) {
          this.onSubmit();
        }
      };

      if (this.form.listeners?.length > 0) {
        for (let i = 0; i < this.form.listeners.length; i += 1) {
          const listener = this.form.listeners[i];
          this.form.removeEventListener("submit", listener);
        }
      }

      this.form.addEventListener("submit", submit_event_listener);
      this.form.listeners = [
        ...(this.form.listeners || []),
        submit_event_listener,
      ];
    }

    for (let i = 0; i < this?.fields?.length; i += 1) {
      const field = this?.fields[i];
      if (field?.element && field?.listen_for_changes) {
        const field_event_listener = () => {
          this.validate(field.name);
        };

        field.element.removeEventListener("input", field_event_listener);
        field.element.addEventListener("input", field_event_listener);

        field.element.removeEventListener("change", field_event_listener);
        field.element.addEventListener("change", field_event_listener);
      }
    }
  }

  validate(fieldName = null) {
    if (!fieldName) {
      this.clear_existing_errors();

      for (let i = 0; i < this.fields.length; i += 1) {
        const field = this.fields[i];
        this.validate_field(field);
      }

      return this.check_if_valid();
    } else {
      const field = this.fields.find((field) => field.name === fieldName);
      this.clear_existing_error(fieldName);
      this.validate_field(field);
      return this.check_if_valid();
    }
  }

  check_if_valid() {
    const fields_with_validations = this.fields.map((field) => {
      return field.validations.some((validation) => {
        return !validation.valid;
      });
    });

    return !fields_with_validations.includes(true);
  }

  validate_field(field) {
    const field_input = this.form.querySelector(`[name="${field.name}"]`);
    const is_checkable = ["checkbox", "radio"].includes(field.type);
    const value = !is_checkable ? field?.element?.value?.trim() : null;
    const checked = is_checkable ? field?.element?.checked : null;

    for (let i = 0; i < field.validations.length; i += 1) {
      const validation = field.validations[i];
      if (
        !this.is_valid_value(is_checkable, is_checkable ? checked : value, validation)
      ) {
        const error_message = this.messages[field.name] && this.messages[field.name][validation.name];
        this.mark_validation_as_invalid(field, validation.name);
        this.render_error(
          field.element,
          error_message || this.default_validation_errors[validation.name](validation.rule, value)
        );
      } else {
        this.mark_validation_as_valid(field, validation.name);
      }
    }

    const has_invalid_validations = field.validations.some((validation) => {
      return !validation.valid;
    });

    if (has_invalid_validations) {
      field_input.classList.add("error");
      field_input.focus();
    }

    if (!has_invalid_validations) {
      field_input.classList.remove("error");
      this.clear_existing_error(field.name);
    }

    return !has_invalid_validations;
  }

  mark_validation_as_invalid(field, validation) {
    const updated_validations = [...field.validations];
    const validation_to_mark = updated_validations.find(
      (updated_validation) => updated_validation.name === validation
    );
    validation_to_mark.valid = false;
  }

  mark_validation_as_valid(field, validation) {
    const updated_validations = [...field.validations];
    const validation_to_mark = updated_validations.find(
      (updated_validation) => updated_validation.name === validation
    );
    validation_to_mark.valid = true;
  }

  is_valid_value(is_checkable, value, validation) {
    if (typeof validation.rule === 'function') {
      return validation.rule(value, this.form);
    }

    const validator = validators[validation.name];

    if (validator) {
      return validator(validation.rule, value, { is_checkable });
    }

    return true;
  }

  clear_existing_errors() {
    if (this.form) {
      const error_elements = this.form.querySelectorAll(".input-hint.error");
      for (let i = 0; i < error_elements?.length; i += 1) {
        const error_element = error_elements[i];
        error_element.parentNode.removeChild(error_element);
      }
    }
  }

  clear_existing_error(name = "") {
    const existing_error = document.getElementById(`error-${name}`);
    if (existing_error) {
      existing_error.parentNode.removeChild(existing_error);
    }
  }

  render_error(element, message = "") {
    if (element) {
      this.clear_existing_error(element.name);

      // NOTE: Developer has provided an on_render_error hook. Prefer that here
      // instead of doing the default error rendering.
      if (typeof this.on_render_error === 'function') {
        return this.on_render_error(element, message);
      }

      const error = document.createElement("p");

      error.classList.add("input-hint");
      error.classList.add("error");
      error.setAttribute("id", `error-${element.name}`);
      error.innerText = message;

      element.after(error);
    }
  }
}

const validate_form = (form, options) => {
  return new Promise((resolve, reject) => {
    try {
      const validation = new ValidateForm(form, options);
      const is_valid = validation.validate();
    
      if (is_valid) {
        resolve();
      } else {
        reject();
      }
    } catch (exception) {
      console.warn(exception);
    }
  });
};

export default validate_form;
