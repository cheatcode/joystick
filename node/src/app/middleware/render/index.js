import fs from 'fs';
import dynamic_import from '../../../lib/dynamic_import.js';
import generate_joystick_error_page from '../generate_joystick_error_page.js';
import get_joystick_build_path from '../../../lib/get_joystick_build_path.js';
import get_translations from '../../../lib/get_translations.js';
import get_url from './get_url.js';
import path_exists from '../../../lib/path_exists.js';
import ssr from '../../ssr/index.js';
import get_browser_safe_request from '../../../lib/get_browser_safe_request.js';

const { readFile } = fs.promises;

const joystick_build_path = get_joystick_build_path();

const get_base_html = () => {
  return readFile('index.html', 'utf-8');
};

const render_middleware = (req, res, next, app_instance = {}) => {
  // NOTE: Set res.render here so we have access to req, res, and
  // app_instance objects inside of the definition.
  res.render = async (render_component_path = '', render_options = {}) => {
    // NOTE: Safety mechanism. Don't punish a developer if the path they pass to res.render()
    // has a forward slash prepended, just strip it for them.
    const sanitized_render_component_path = render_component_path?.substring(0, 1) === '/' ? render_component_path?.replace('/', '') : render_component_path;
    const sanitized_render_layout_path = render_options?.layout?.substring(0, 1) === '/' ? render_options?.layout?.replace('/', '') : render_options?.layout;
    const component_path = `${joystick_build_path}${sanitized_render_component_path}`;
    const layout_path = render_options?.layout ? `${joystick_build_path}${sanitized_render_layout_path}` : null;

    if (!(await path_exists(component_path))) {
      return res.status(404).send(
        generate_joystick_error_page({
          type: 'page_not_found',
          path: `res.render('${component_path}')`,
          frame: null,
          stack: `A page component at the path ${component_path} could not be found.`,
        })
      );
    }

    if (layout_path && !(await path_exists(layout_path))) {
      return res.status(404).send(
        generate_joystick_error_page({
          type: 'layout_not_found',
          path: `res.render('${component_path}', { layout: '${sanitized_render_layout_path}' })`,
          frame: null,
          stack: `A layout component at the path ${render_options?.layout} could not be found.`,
        })
      );
    }

    const Component = await dynamic_import(`${component_path}?v=${new Date().getTime()}`);
    const Layout = layout_path ? await dynamic_import(`${layout_path}?v=${new Date().getTime()}`) : null;
    const props = { ...(render_options?.props || {}) };

    if (layout_path) {
      props.page = Component;
    }

    const base_html = await get_base_html();
    const translations = await get_translations({
      joystick_build_path,
      render_component_path,
      req,
    });

    const url = get_url(req);

    const html = await ssr({
      api_schema: app_instance?.options?.api,
      attributes: render_options?.attributes,
      base_html,
      component_options: {
        props,
        translations,
        url,
      },
      // NOTE: If we have a layout, we want to render that as it will have the page embedded
      // via props. If not, fall back to the Component (either a page or an email template).
      component_to_render: Layout || Component,
      head: render_options?.head,
      render_component_path: sanitized_render_component_path,
      render_layout_path: sanitized_render_layout_path,
      req,
    });

    return res.status(200).send(html);
  };

  next();
};

export default render_middleware;
