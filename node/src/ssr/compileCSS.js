import {
  isFunction,
  isString,
  isObject,
} from "../validation/lib/typeValidators.js";

export default (css = "", componentInstance = {}) => {
  try {
    let compiledCSS = "";

    if (css && isString(css)) {
      compiledCSS = css;
      return compiledCSS;
    }

    if (css && isFunction(css)) {
      compiledCSS = css(componentInstance);
      return compiledCSS;
    }

    if (css && isObject(css)) {
      const hasPrintRules =
        css?.print && (isString(css?.print) || isFunction(css?.print));
      const hasMinRules = css?.min && isObject(css?.min);
      const hasMinWidthRules = css?.min?.width && isObject(css?.min?.width);
      const hasMinHeightRules = css?.min?.height && isObject(css?.min?.height);
      const hasMaxRules = css?.max && isObject(css?.max);
      const hasMaxWidthRules = css?.max?.width && isObject(css?.max?.width);
      const hasMaxHeightRules = css?.max?.height && isObject(css?.max?.height);

      if (hasPrintRules) {
        compiledCSS += `
          @media print {
            ${
              typeof css?.print === "function"
                ? css?.print(componentInstance)
                : css.print
            }
          }
        `;
      }

      if (hasMinRules && hasMinWidthRules) {
        const minWidthRules = Object.entries(css?.min?.width || {});
        for (let i = 0; i < minWidthRules.length; i += 1) {
          const [minWidth, minWidthRule] = minWidthRules[i];
          compiledCSS += `
            @media screen and (min-width: ${minWidth}px) {
              ${
                typeof minWidthRule === "function"
                  ? minWidthRule(componentInstance)
                  : minWidthRule
              }
            }
          `;
        }
      }

      if (hasMinRules && hasMinHeightRules) {
        const minHeightRules = Object.entries(css?.min?.height || {});
        for (let i = 0; i < minHeightRules.length; i += 1) {
          const [minHeight, minHeightRule] = minHeightRules[i];
          compiledCSS += `
            @media screen and (min-height: ${minHeight}px) {
              ${
                typeof minHeightRule === "function"
                  ? minHeightRule(componentInstance)
                  : minHeightRule
              }
            }
          `;
        }
      }

      if (hasMaxRules && hasMaxWidthRules) {
        const maxWidthRules = Object.entries(css?.max?.width || {});
        for (let i = 0; i < maxWidthRules.length; i += 1) {
          const [maxWidth, maxWidthRule] = maxWidthRules[i];
          compiledCSS += `
            @media screen and (max-width: ${maxWidth}px) {
              ${
                typeof maxWidthRule === "function"
                  ? maxWidthRule(componentInstance)
                  : maxWidthRule
              }
            }
          `;
        }
      }

      if (hasMaxRules && hasMaxHeightRules) {
        const maxHeightRules = Object.entries(css?.max?.height || {});
        for (let i = 0; i < maxHeightRules.length; i += 1) {
          const [maxHeight, maxHeightRule] = maxHeightRules[i];
          compiledCSS += `
            @media screen and (max-height: ${maxHeight}px) {
              ${
                typeof maxHeightRule === "function"
                  ? maxHeightRule(componentInstance)
                  : maxHeightRule
              }
            }
          `;
        }
      }

      return compiledCSS;
    }

    return "";
  } catch (exception) {
    throw new Error("ssr.compileCSS", exception);
  }
};
