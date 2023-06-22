import throwFrameworkError from "../../../lib/throwFrameworkError";

// const getCSSRules = (css = '') => {
//   try {
//     const regex = new RegExp(/^(?!@).+({|,)/gim);
//     return (css || '').replace(regex, (match) => {
//       if (['@', ':'].some((skip) => match?.includes(skip))) {
//         return match;
//       }

//       return `[js-c="${componentId}"] ${match.trim()}`;
//     })?.trim();

//     // const doc = document.implementation.createHTMLDocument("");
//     // const styleElement = document.createElement("style");

//     // styleElement.textContent = css;
//     // doc.body.appendChild(styleElement);

//     // return styleElement.sheet.cssRules;
//   } catch (exception) {
//     throwFrameworkError('component.css.prefix.getCSSRules', exception);
//   }
// };

export default (css = "", componentId = "") => {
  try {
    const regex = new RegExp(/^(?!@).+({|,)/gim);

    return (css || "")
      .replace(regex, (match) => {
        if (["@", ": "].some((skip) => match?.includes(skip))) {
          return match;
        }

        return `[js-c="${componentId}"] ${match.trim()}`;
      })
      ?.trim();

    // const rawRules = getCSSRules(css);
    // const parsedRules = Object.entries(rawRules).map(([_key, value]) => value);

    // const prefixedRules = parsedRules.map((rule) => {
    //   if (rule.constructor.name === 'CSSStyleRule') {
    //     return `[js-c="${componentId}"] ${rule.cssText}`;
    //   }

    //   if (rule.constructor.name === 'CSSMediaRule') {
    //     return `
    //       @media ${rule.conditionText} {
    //         ${Object.entries(rule.cssRules)
    //           .map(([_key, mediaRule]) => `[js-c="${componentId}"] ${mediaRule.cssText}`)
    //           .join("\n")}
    //       }
    //     `;
    //   }
    // });

    // return prefixedRules.join("\n");
  } catch (exception) {
    throwFrameworkError("component.css.prefix", exception);
  }
};
