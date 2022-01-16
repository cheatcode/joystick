export default (styles = []) => {
  // NOTE: Reverse to preserve specificity in the SSR'd CSS. Otherwise you
  // can run into FOUC in the browser.
  const css = styles.reverse().join("") || "";
  return `<style js-css-ssr="${Buffer.from(css.trim(), 'base64').toString().substring(
    0,
    8
  )}">${css.trim()}</style>`;
};
