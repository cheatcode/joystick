export default (styles = []) => {
  const css = styles.join("") || "";
  return `<style js-css-ssr="${btoa(css.trim()).substring(
    0,
    8
  )}">${css.trim()}</style>`;
};
