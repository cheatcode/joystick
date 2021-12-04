export default (styles = []) => {
  const css = styles.join("") || "";
  return `<style js-css-ssr="${Buffer.from(css.trim(), 'base64').toString().substring(
    0,
    8
  )}">${css.trim()}</style>`;
};
