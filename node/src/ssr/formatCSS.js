export default (styles = []) => {
  // NOTE: Use .reverse() to preserve specificity in the SSR'd CSS. Otherwise you
  // can run into FOUC in the browser.

  return `<style js-styles js-css="${Buffer.from(styles.join("").trim())
    .toString("base64")
    .substring(0, 8)}">${styles.reverse().join("").trim()}</style>`;
};
