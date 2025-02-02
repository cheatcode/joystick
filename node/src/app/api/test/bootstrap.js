import dynamic_import from "../../../lib/dynamic_import.js";
import get_api_for_data_functions from "../get_api_for_data_functions.js";
import get_browser_safe_request from "../../../lib/get_browser_safe_request.js";
import get_platform_safe_path from "../../../lib/get_platform_safe_path.js";
import get_translations from "../../../lib/get_translations.js";
import load_settings from "../../settings/load.js";

const test_bootstrap = async (req = {}, res = {}, app_instance = {}) => {
  const joystick_build_path = `${process.cwd()}/.joystick/build/`;
  const component_to_render = req?.query?.path_to_component ?
  	await dynamic_import(
      get_platform_safe_path(`${joystick_build_path}${req?.query?.path_to_component}?v=${new Date().getTime()}`)
    ) :
  	null;

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
	    	joystick_build_path,
	    	render_component_path: req?.query?.path_to_component,
	    	req,
	    }),
    });
  }

  res.status(200).send({ data: {}, translations: {} });
};

export default test_bootstrap;
