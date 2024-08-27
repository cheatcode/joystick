import chalk from 'chalk';
import fs from 'fs';
import get_platform_safe_path from '../../get_platform_safe_path.js';
import constants from '../../constants.js';
import set_component_id from './set_component_id.js';
import path_exists from '../../path_exists.js';

const { readFile, writeFile } = fs.promises;

const restore_examples_without_mounting_code = (code = '', examples_before_replacement = []) => {
	for (let i = 0; i < examples_before_replacement?.length; i += 1) {
    const example_to_restore = examples_before_replacement[i];
    code = code.replace(`%example:${i}%`, example_to_restore);
  }
};

const add_page_mounting_code = (code = '', default_export = '', component_name = '') => {
	return code.replace(
    `${default_export};`,
    `if (
      typeof window !== 'undefined' &&
      window.__joystick_should_auto_mount__ === true &&
      !window.__joystick_layout_url__ &&
      window.__joystick_page_url__ &&
      !window.__joystick_hmr_update__ &&
      joystick &&
      joystick.mount
    ) {
      joystick.mount(${component_name}, window.__joystick_ssr_props__ || {}, document.getElementById('app'));
    }

    export default ${component_name};
    `
  );
};

const add_layout_mounting_code = (code = '', default_export = '', component_name = '') => {
	return code.replace(
	  `${default_export};`,
	  `if (
	    typeof window !== 'undefined' &&
	    window.__joystick_should_auto_mount__ === true &&
	    window.__joystick_layout_url__ &&
      window.__joystick_page_url__ &&
      !window.__joystick_hmr_update__ &&
	    joystick &&
	    joystick.mount
	  ) {
	    (async () => {
	      const layout_component_file = await import(window.__joystick_layout_url__);
	      const page_component_file = await import(window.window.__joystick_page_url__);
	      const layout = layout_component_file.default;
	      const page = page_component_file.default;
	      joystick.mount(layout, Object.assign({ ...window.__joystick_ssr_props__ }, { page }), document.getElementById('app'));
	    })();
	  }

	export default ${component_name};
	  `
	);
};

const replace_commented_code = (code = '') => {
	return code.replace(constants.JOYSTICK_COMMENT_REGEX, "");
};

const set_placeholders_for_examples = (code = '') => {
	// NOTE: Replace any <example> bracketed code with a placeholder. This ensures
	// that we don't accidentally include any mounting code (or inject a _componentId)
	// in Joystick example code included as content on the page.
	//
	// example_index is tracked to account for potential for multiple examples in a
	// single file. example_index acts as a placeholder for the code to swap back
  // in after the _componentId is set in restore_examples_without_mounting_code().
  let example_index = 0;

  return code.replace(
    constants.EXAMPLE_CODE_REGEX,
    () => {
      return `%example:${example_index++}%`;
    }
  );
};

const get_examples_before_replacement = (code = '') => {
	return code.match(constants.EXAMPLE_CODE_REGEX) || [];
};

const get_component_name = (default_export = null) => {
  const default_export_parts = (default_export && default_export.split(" ")) || [];
  return default_export_parts?.pop();
};

const check_if_valid_component_file = (has_joystick_ui = false, default_export = null) => {
	return has_joystick_ui && !!default_export;
};

const get_default_export = (code = '') => {
	const export_default_matches = code.match(constants.EXPORT_DEFAULT_REGEX) || [];
	return export_default_matches && export_default_matches[0];
};

const check_if_has_joystick_ui = (code = '') => {
  const joystick_ui_matches = code.match(constants.JOYSTICK_UI_REGEX) || [];
	return !!joystick_ui_matches && !!joystick_ui_matches[0];
};

const check_if_is_component_type = (type ='', build_args = {}) => {
  return [get_platform_safe_path(type)].some(
    (bootstrap_target) => {
      return build_args.path.includes(bootstrap_target);
    }
  );
};

const check_if_should_set_component_id = (entry_point = '') => {
	return [
    get_platform_safe_path("ui/"),
    get_platform_safe_path("email/"),
  ].some((bootstrap_target) => {
    return entry_point.includes(bootstrap_target);
  });
};

const bootstrap_component = (build = {}) => {
  build.onLoad({ filter: /\.js$/ }, async (build_args = {}) => {
    const is_layout_component = check_if_is_component_type('ui/layouts', build_args);
    const is_page_component = check_if_is_component_type('ui/pages', build_args);      
    const is_email_component = check_if_is_component_type('email/', build_args);
    const is_component = is_layout_component || is_page_component || is_email_component;

    if (is_component) {
      let file_contents = await readFile(get_platform_safe_path(build_args.path), "utf-8");
      
      const has_joystick_ui = check_if_has_joystick_ui(file_contents);
      const default_export = get_default_export(file_contents);
      const is_valid_component_file = check_if_valid_component_file(has_joystick_ui, default_export);
      const examples_before_replacement = get_examples_before_replacement(file_contents);
      const component_name = get_component_name(default_export);

      file_contents = set_placeholders_for_examples(file_contents);
      file_contents = replace_commented_code(file_contents);
      file_contents = component_name && is_layout_component ?
        add_layout_mounting_code(file_contents, default_export, component_name) :
        file_contents;
      file_contents = component_name && is_page_component ?
        add_page_mounting_code(file_contents, default_export, component_name) :
        file_contents;

      restore_examples_without_mounting_code(file_contents, examples_before_replacement);

      return {
        contents: file_contents,
        loader: "js",
      };
    }
  }).catch((error) => {
    console.log('ON LOAD', error);
  });

  build.onEnd(() => {
    return new Promise(async (resolve) => {
      for (let i = 0; i < build?.initialOptions?.entryPoints?.length; i += 1) {
        const entry_point = build?.initialOptions?.entryPoints[i];
        const should_set_component_id = check_if_should_set_component_id(entry_point);
        const build_exists = await path_exists(`${build?.initialOptions?.outdir}/${entry_point}`);

        if (should_set_component_id && build_exists) {
          let file_contents = await readFile(`${build?.initialOptions?.outdir}/${entry_point}`, "utf-8");
          const has_joystick_ui = check_if_has_joystick_ui(file_contents);
					const examples_before_replacement = get_examples_before_replacement(file_contents);
          
          file_contents = set_placeholders_for_examples(file_contents);

          if (has_joystick_ui) {
            file_contents = await set_component_id(file_contents);

            for (let i = 0; i < examples_before_replacement?.length; i += 1) {
              const example_to_restore = examples_before_replacement[i];
              file_contents = file_contents.replace(`%example:${i}%`, example_to_restore);
            }
            
            await writeFile(`${build?.initialOptions?.outdir}/${entry_point}`, file_contents);
          }
        }
      }

      resolve();
    });
  }).catch((error) => {
    console.log('ON END', error);
  });
};

export default bootstrap_component;
