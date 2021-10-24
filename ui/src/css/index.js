export default (css = "") => {
  const existingStyles = document.querySelectorAll("[js-global-css], [js-css]");

  [].forEach.call(existingStyles, (existingStyle) => {
    existingStyle.parentElement.removeChild(existingStyle);
  });

  const style = document.createElement("style");
  style.setAttribute("js-global-css", "");
  style.innerHTML = css;
  document.head.appendChild(style);
};
