var formatCSS_default = (styles = []) => {
  return `<style js-css-ssr="${Buffer.from(styles.join("").trim()).toString("base64").substring(0, 8)}">${styles.reverse().join("").trim()}</style>`;
};
export {
  formatCSS_default as default
};
