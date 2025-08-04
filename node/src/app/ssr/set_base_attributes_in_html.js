import { parseHTML } from 'linkedom';
import types from '../../lib/types.js';
import escape_html from '../../lib/escape_html.js';

const add_attributes_to_dom = (dom = {}, attributes = {}) => {
  const attribute_keys = Object.keys(attributes || {});
  const attribute_keys_without_class_list = attribute_keys?.filter(
    (key) => key !== "class"
  );

  if (types.is_array(attributes?.class?.list)) {
    if (attributes?.class?.method === "replace") {
      const escaped_class_names = attributes.class.list.map(class_name => escape_html(class_name));
      dom.setAttribute("class", escaped_class_names.join(" "));
    } else {
      for (let i = 0; i < attributes.class.list.length; i += 1) {
      	const class_name = escape_html(attributes.class.list[i]);
        dom.classList.add(class_name);
      }
    }
  }

  for (let i = 0; i < attribute_keys_without_class_list.length; i += 1) {
  	const attribute = attribute_keys_without_class_list[i];
    dom.setAttribute(attribute, escape_html(attributes[attribute]));
  }

  return dom;
};

const set_base_attributes_in_html = (html = '', attributes = {}) => {
  const { document } = parseHTML(html);

  if (attributes?.html) {
    add_attributes_to_dom(document.documentElement, attributes.html);
  }

  if (attributes?.body) {
    add_attributes_to_dom(document.body, attributes.body);
  }

  return document.toString();
};

export default set_base_attributes_in_html;
