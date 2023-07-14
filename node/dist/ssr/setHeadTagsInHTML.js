import htmlParser from "node-html-parser";
var setHeadTagsInHTML_default = (htmlString = "", head = null, req = {}) => {
  const html = htmlParser.parse(htmlString);
  const headTag = html.querySelector("head");
  if (req?.context?.session) {
    const metaTagWrapper = htmlParser.parse(`<meta />`);
    const tag = metaTagWrapper.querySelector("meta");
    tag.setAttribute("name", "csrf");
    tag.setAttribute("content", req?.context?.session?.csrf);
    headTag.appendChild(tag);
  }
  if (!head) {
    return html.toString();
  }
  if (head.title) {
    const existingTitle = headTag.querySelector("title");
    if (existingTitle) {
      const newTitle = htmlParser.parse(`<title>${head.title}</title>`);
      headTag.exchangeChild(existingTitle, newTitle);
    }
    if (!existingTitle) {
      headTag.insertAdjacentHTML("afterbegin", `<title>${head.title}</title>`);
    }
  }
  if (head.tags && head.tags.meta && Array.isArray(head.tags.meta) && head.tags.meta.length > 0) {
    let currentMetaTag = head.tags.meta.length;
    while (currentMetaTag--) {
      const metaTag = head.tags.meta[currentMetaTag];
      const existingTag = headTag.querySelector(`meta[name="${metaTag.name}"]`);
      const newTag = htmlParser.parse(`<meta />`);
      const metaTagEntries = Object.entries(metaTag);
      let currentMetaTagEntry = metaTagEntries.length;
      while (currentMetaTagEntry--) {
        const [attributeName, attributeValue] = metaTagEntries[currentMetaTagEntry];
        newTag.querySelector("meta").setAttribute(attributeName, attributeValue);
      }
      if (existingTag) {
        headTag.exchangeChild(existingTag, newTag);
      }
      if (!existingTag) {
        headTag.appendChild(newTag);
      }
    }
  }
  if (head.tags && head.tags.link && Array.isArray(head.tags.link) && head.tags.link.length > 0) {
    let currentLinkTag = head.tags.link.length;
    while (currentLinkTag--) {
      const linkTag = head.tags.link[currentLinkTag];
      const newTag = htmlParser.parse(`<link />`);
      let linkTagEntries = Object.entries(linkTag);
      let currentLinkTagEntry = linkTagEntries.length;
      while (currentLinkTagEntry--) {
        const [attributeName, attributeValue] = linkTagEntries[currentLinkTagEntry];
        newTag.querySelector("link").setAttribute(attributeName, attributeValue);
      }
      headTag.appendChild(newTag);
    }
  }
  if (head.tags && head.tags.script && Array.isArray(head.tags.script) && head.tags.script.length > 0) {
    let currentScriptTag = head.tags.script.length;
    while (currentScriptTag--) {
      const scriptTag = head.tags.script[currentScriptTag];
      const newTag = htmlParser.parse(`<script><\/script>`);
      let scriptTagEntries = Object.entries(scriptTag);
      let currentScriptTagEntry = scriptTagEntries.length;
      while (currentScriptTagEntry--) {
        const [attributeName, attributeValue] = scriptTagEntries[currentScriptTagEntry];
        newTag.querySelector("script").setAttribute(attributeName, attributeValue);
      }
      headTag.appendChild(newTag);
    }
  }
  if (head.jsonld) {
    const newTag = htmlParser.parse(`<script><\/script>`);
    const tag = newTag.querySelector("script");
    tag.setAttribute("type", "application/ld+json");
    tag.set_content(JSON.stringify(head.jsonld, null, 2));
    headTag.appendChild(newTag);
  }
  return html.toString();
};
export {
  setHeadTagsInHTML_default as default
};
