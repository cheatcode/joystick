import html_parser from 'node-html-parser';
import types from '../../lib/types.js';
import escape_html from '../../lib/escape_html.js';

const set_head_tags_in_html = (html_string = '', head = null, req = {}) => {
  const html = html_parser.parse(html_string);
  const head_tag = html.querySelector('head');

  if (!head) {
    return html.toString();
  }

  if (head.title) {
    const existing_title = head_tag.querySelector('title');
    const escaped_title = escape_html(head.title);
    
    if (existing_title) {
      const new_title = html_parser.parse(`<title>${escaped_title}</title>`);
      head_tag.exchangeChild(existing_title, new_title);
    }
  
    if (!existing_title) {
      head_tag.insertAdjacentHTML('afterbegin', `<title>${escaped_title}</title>`);
    }
  }

  if (head.tags && head.tags.meta && types.is_array(head.tags.meta) && head.tags.meta.length > 0) {
    for (let i = 0; i < head?.tags?.meta?.length; i += 1) {
    	const meta_tag = head.tags.meta[i];

      const existing_tag = head_tag.querySelector(`meta[name="${meta_tag.name}"]`);
      const new_tag = html_parser.parse(`<meta />`);

      const meta_tag_entries = Object.entries(meta_tag || {});

      for (let i = 0; i < meta_tag_entries?.length; i += 1) {
      	const [attribute_name, attribute_value] = meta_tag_entries[i];
      	new_tag.querySelector('meta').setAttribute(attribute_name, escape_html(attribute_value));
      }

      if (existing_tag) {
        head_tag.exchangeChild(existing_tag, new_tag);
      }
  
      if (!existing_tag) {
        head_tag.appendChild(new_tag);
      }
    }
  }
  
  if (head.tags && head.tags.link && types.is_array(head.tags.link) && head.tags.link.length > 0) {
    for (let i = 0; i < head?.tags?.link?.length; i += 1) {
    	const link_tag = head?.tags?.link[i];
    	const new_tag = html_parser.parse(`<link />`);

      const link_tag_entries = Object.entries(link_tag || {});
  
  		for (let i = 0; i < link_tag_entries?.length; i += 1) {
  			const [attribute_name, attribute_value] = link_tag_entries[i];
        new_tag.querySelector('link').setAttribute(attribute_name, escape_html(attribute_value));
  		}

      head_tag.appendChild(new_tag);
    }
  }
  
  if (head.tags && head.tags.script && Array.isArray(head.tags.script) && head.tags.script.length > 0) {
    for (let i = 0; i < head?.tags?.script?.length; i += 1) {
    	const script_tag = head.tags.script[i];
    	const new_tag = html_parser.parse(`<script></script>`);

      const script_tag_entries = Object.entries(script_tag || {});

      for (let i = 0; i < script_tag_entries?.length; i += 1) {
        const [attribute_name, attribute_value] = script_tag_entries[i];
        new_tag.querySelector('script').setAttribute(attribute_name, escape_html(attribute_value));
      }
  
      head_tag.appendChild(new_tag);
    }
  }
  
  if (head.tags && head.tags.style && Array.isArray(head.tags.style) && head.tags.style.length > 0) {
    for (let i = 0; i < head?.tags?.style?.length; i += 1) {
      const { attributes = {}, content = '' } = head.tags.style[i];
      const new_tag = html_parser.parse(`<style></style>`);
      const attribute_entries = Object.entries(attributes);
      const style_tag = new_tag.querySelector('style');
      style_tag.setAttribute('type', 'text/css');

      for (let i = 0; i < attribute_entries?.length; i += 1) {
        const [attribute_name, attribute_value] = attribute_entries[i];
        style_tag.setAttribute(attribute_name, escape_html(attribute_value));
      }

      if (content) {
        style_tag.innerHTML = escape_html(content);
      }

      head_tag.appendChild(new_tag);
    }
  }

  if (head.jsonld) {
    const new_tag = html_parser.parse(`<script></script>`);
    const tag = new_tag.querySelector('script');
  
    tag.setAttribute('type', 'application/ld+json');
    tag.set_content(JSON.stringify(head.jsonld, null, 2));

    head_tag.appendChild(new_tag);
  }
  
  return html.toString();
};

export default set_head_tags_in_html;
