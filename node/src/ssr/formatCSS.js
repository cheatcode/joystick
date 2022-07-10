export default (styles = []) => {
  // NOTE: .reverse() to preserve specificity in the SSR'd CSS. Otherwise you
  // can run into FOUC in the browser.

  return `<style js-ssr js-css="${Buffer.from(styles.join("").trim()).toString('base64').substring(
    0,
    8
  )}">${styles.reverse().join("").trim()}</style>`;
};
