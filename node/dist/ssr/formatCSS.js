var formatCSS_default = (styles = []) => {
  const css = styles.reverse().join("") || "";
  return `<style js-css-ssr="${Buffer.from(css.trim(), "base64").toString().substring(0, 8)}">${css.trim()}</style>`;
};
export {
  formatCSS_default as default
};
