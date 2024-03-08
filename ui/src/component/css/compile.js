import types from "../../lib/types.js";

const compile = (css = "", component_instance = {}) => {
  let compiled_css = "";

  if (css && types.is_string(css)) {
    compiled_css = css;
    return compiled_css;
  }

  if (css && types.is_function(css)) {
    compiled_css = css(component_instance);
    return compiled_css;
  }

  if (css && types.is_object(css)) {
    const has_print_rules =
      css?.print && (types.is_string(css?.print) || types.is_function(css?.print));
    const has_min_rules = css?.min && types.is_object(css?.min);
    const has_min_width_rules = css?.min?.width && types.is_object(css?.min?.width);
    const has_min_height_rules = css?.min?.height && types.is_object(css?.min?.height);
    const has_max_rules = css?.max && types.is_object(css?.max);
    const has_max_width_rules = css?.max?.width && types.is_object(css?.max?.width);
    const has_max_height_rules = css?.max?.height && types.is_object(css?.max?.height);

    if (has_print_rules) {
      compiled_css += `
        @media print {
          ${
            typeof css?.print === "function"
              ? css?.print(component_instance)
              : css.print
          }
        }
      `;
    }

    if (has_min_rules && has_min_width_rules) {
      const min_width_rules = Object.entries(css?.min?.width);
      for (let i = 0; i < min_width_rules.length; i += 1) {
        const [min_width, min_width_rule] = min_width_rules[i];
        compiled_css += `
          @media screen and (min-width: ${min_width}px) {
            ${
              typeof min_width_rule === "function"
                ? min_width_rule(component_instance)
                : min_width_rule
            }
          }
        `;
      }
    }

    if (has_min_rules && has_min_height_rules) {
      const min_height_rules = Object.entries(css?.min?.height);
      for (let i = 0; i < min_height_rules.length; i += 1) {
        const [min_height, min_height_rule] = min_height_rules[i];
        compiled_css += `
          @media screen and (min-height: ${min_height}px) {
            ${
              typeof min_height_rule === "function"
                ? min_height_rule(component_instance)
                : min_height_rule
            }
          }
        `;
      }
    }

    if (has_max_rules && has_max_width_rules) {
      const max_width_rules = Object.entries(css?.max?.width);
      for (let i = 0; i < max_width_rules.length; i += 1) {
        const [max_width, max_width_rule] = max_width_rules[i];
        compiled_css += `
          @media screen and (max-width: ${max_width}px) {
            ${
              typeof max_width_rule === "function"
                ? max_width_rule(component_instance)
                : max_width_rule
            }
          }
        `;
      }
    }

    if (has_max_rules && has_max_height_rules) {
      const max_height_rules = Object.entries(css?.max?.height);
      for (let i = 0; i < max_height_rules.length; i += 1) {
        const [max_height, max_height_rule] = max_height_rules[i];
        compiled_css += `
          @media screen and (max-height: ${max_height}px) {
            ${
              typeof max_height_rule === "function"
                ? max_height_rule(component_instance)
                : max_height_rule
            }
          }
        `;
      }
    }

    return compiled_css;
  }

  return "";
};

export default compile;
