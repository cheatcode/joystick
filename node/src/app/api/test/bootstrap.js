import get_api_for_data_functions from "../get_api_for_data_functions.js";
import get_browser_safe_request from "../../../lib/get_browser_safe_request.js";
import get_joystick_build_path from "../../../lib/get_joystick_build_path.js";
import get_translations from "../../../lib/get_translations.js";
import load_settings from "../../settings/load.js";
import strip_preceeding_slash from "../../../lib/strip_preceeding_slash.js";

const test_bootstrap = async (req = {}, res = {}, app_instance = {}) => {
  const joystick_build_path = get_joystick_build_path();
  const sanitized_component_path = strip_preceeding_slash(req?.query?.path_to_component || '');
  const component_to_render = sanitized_component_path ? process._joystick_components[sanitized_component_path] : null;

  if (component_to_render) {
    const component_instance = component_to_render();
    const api_for_data_functions = get_api_for_data_functions(req, res, app_instance?.options?.api);
    const browser_safe_request = get_browser_safe_request(req);
    const data = await component_instance.fetch_data(api_for_data_functions, browser_safe_request, {}, component_instance);

    return res.status(200).send({
      data: {
        [component_instance?.id]: data,
      },
      req: browser_safe_request,
      settings: load_settings(),
      translations: await get_translations({
        language_files: process._joystick_translations?.normal?.files || [],
        language_files_path: process._joystick_translations?.normal?.path || `${joystick_build_path}i18n`,
        render_component_path: sanitized_component_path,
        req,
      }),
    });
  }

  res.status(200).send({ data: {}, translations: {} });
};

export default test_bootstrap;
