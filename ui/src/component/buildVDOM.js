const buildVDOM = (html = "", id = "") => {
  if (html && typeof html === "string") {
    const dom = document.createElement("div");
    dom.setAttribute("js-c", id);
    dom.innerHTML = html;
    return dom;
  }

  return null;
};

export default buildVDOM;
