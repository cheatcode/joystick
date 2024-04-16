import compile_css from "../component/css/compile.js";
import constants from "../lib/constants.js";

const handle_prefix_css = (component_id, css_string) => {
  return (css_string || "")
    .replace(constants.CSS_COMMENT_REGEX, () => {
      return "";
    })
    .replace(constants.CSS_SELECTOR_REGEX, (match) => {
      if (["@", ": "].some((skip) => match?.includes(skip))) {
        return match;
      }

      return `[js-c="${component_id}"] ${match.trim()}`;
    })
    // NOTE: Use @wrapper as a placeholder target for assigning styles
  	// to the Joystick component's root wrapper element.
  	.replace(/@wrapper/g, `[js-c="${component_id}"]`)
    ?.trim();
};

const get_css_from_tree = (tree = [], css = [], is_email = false) => {
  const built_css = [...css];

	for (let i = 0; i < tree?.length; i += 1) {
		const node = tree[i];

		if (node?.css) {
	    const component_id = node?.id;
	    const raw_css = node.options.css;
	    const compiled_css = compile_css(raw_css, node);
	    const prefixed_css = !is_email ? handle_prefix_css(component_id, compiled_css) : null;

	    if (is_email) {
	    	built_css.push(compiled_css);
	    } else {
	    	built_css.push(prefixed_css);
	    }
		}
	}

  return built_css;
};

export default get_css_from_tree;
