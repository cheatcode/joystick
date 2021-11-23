import htmlParser from 'node-html-parser';

export default (htmlString = '', head = {}) => {
  const html = htmlParser.parse(htmlString);
  const headTag = html.querySelector('head');

  if (head.title) {
    const existingTitle = headTag.querySelector('title');
    
    if (existingTitle) {
      const newTitle = htmlParser.parse(`<title>${head.title}</title>`);
      headTag.exchangeChild(existingTitle, newTitle);
    }
  
    if (!existingTitle) {
      headTag.insertAdjacentHTML('afterbegin', `<title>${head.title}</title>`);
    }
  }

  if (head.tags && head.tags.meta && Array.isArray(head.tags.meta) && head.tags.meta.length > 0) {
    head.tags.meta.forEach((metaTag) => {
      const existingTag = headTag.querySelector(`meta[name="${metaTag.name}"]`);
      const newTag = htmlParser.parse(`<meta />`);
  
      Object.entries(metaTag).forEach(([attributeName, attributeValue]) => {
        newTag.querySelector('meta').setAttribute(attributeName, attributeValue);
      });
  
      if (existingTag) {
        headTag.exchangeChild(existingTag, newTag);
      }
  
      if (!existingTag) {
        headTag.appendChild(newTag);
      }
    });
  }
  
  if (head.tags && head.tags.link && Array.isArray(head.tags.link) && head.tags.link.length > 0) {
    head.tags.link.forEach((linkTag) => {
      const newTag = htmlParser.parse(`<link />`);
  
      Object.entries(linkTag).forEach(([attributeName, attributeValue]) => {
        newTag.querySelector('link').setAttribute(attributeName, attributeValue);
      });
  
      headTag.appendChild(newTag);
    });
  }
  
  if (head.tags && head.tags.script && Array.isArray(head.tags.script) && head.tags.script.length > 0) {
    head.tags.script.forEach((scriptTag) => {
      const newTag = htmlParser.parse(`<script></script>`);
  
      Object.entries(scriptTag).forEach(([attributeName, attributeValue]) => {
        newTag.querySelector('script').setAttribute(attributeName, attributeValue);
      });
  
      headTag.appendChild(newTag);
    });
  }
  
  if (head.jsonld) {
    const newTag = htmlParser.parse(`<script></script>`);
    const tag = newTag.querySelector('script');
  
    tag.setAttribute('type', 'application/ld+json');
    tag.set_content(JSON.stringify(head.jsonld, null, 2));

    headTag.appendChild(newTag);
  }
  
  return html.toString();
};