import fs from 'fs';
import dynamic_import from '../../../lib/dynamic_import.js';
import generate_joystick_error_page from '../generate_joystick_error_page.js';
import get_joystick_build_path from '../../../lib/get_joystick_build_path.js';
import get_translations from '../../../lib/get_translations.js';
import get_url from './get_url.js';
import path_exists from '../../../lib/path_exists.js';
import ssr from '../../ssr/index.js';
import strip_preceeding_slash from '../../../lib/strip_preceeding_slash.js';

const { readFile } = fs.promises;

const joystick_build_path = get_joystick_build_path();

const render_middleware = (req, res, next, app_instance = {}) => {
  // NOTE: Set res.render here so we have access to req, res, and
  // app_instance objects inside of the definition.
  res.render = async (render_component_path = '', render_options = {}) => {
    // NOTE: Safety mechanism. Don't punish a developer if the path they pass to res.render()
    // has a forward slash prepended, just strip it for them.
    const sanitized_render_component_path = strip_preceeding_slash(render_component_path);
    const sanitized_render_layout_path = strip_preceeding_slash(render_options?.layout);
    const component_path = sanitized_render_component_path;
    const layout_path = render_options?.layout ? sanitized_render_layout_path : null;

    if (!process._joystick_components[component_path]) {
      return res.status(404).send(
        generate_joystick_error_page({
          type: 'page_not_found',
          path: `res.render('${component_path}')`,
          frame: null,
          stack: `A page component at the path ${component_path} could not be found.`,
        })
      );
    }

    if (layout_path && !process._joystick_components[layout_path]) {
      return res.status(404).send(
        generate_joystick_error_page({
          type: 'layout_not_found',
          path: `res.render('${component_path}', { layout: '${sanitized_render_layout_path}' })`,
          frame: null,
          stack: `A layout component at the path ${render_options?.layout} could not be found.`,
        })
      );
    }
    
    const Component = process._joystick_components[component_path];
    const Layout = layout_path ? process._joystick_components[layout_path] : null;
    const props = {
      ...(render_options?.props || {}),
      theme: req?.cookies?.theme || 'light',
    };

    if (layout_path) {
      props.page = Component;
    }

    const base_html = process._joystick_html;
    const translations = await get_translations({
      language_files: process._joystick_translations?.normal?.files || [],
      language_files_path: process._joystick_translations?.normal?.path || `${joystick_build_path}i18n`,
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
      escaping: render_options?.escaping,
      head: render_options?.head,
      render_component_path: sanitized_render_component_path,
      render_layout_path: sanitized_render_layout_path,
      req,
      res,
      // NOTE: Load Mod only if render_options?.mod isn't false (i.e., assume we want to load it
      // on all pages, but skip if the developer tells us not to). This is useful for when Mod is
      // used for some pages, but not all (e.g., admin dashboar vs. a marketing site w/ custom CSS).
      
      // NOTE: If we detected a copy of Mod in the app at startup, we've loaded its CSS 
      // into memory and can use it for tree-shaking during SSR. For theme, prefer the one passed
      // via cookies, then the app options, and fall back to light if neither are set.
      mod: render_options?.mod === false ? null : {
        in_use: !!app_instance?.mod,
        css: app_instance?.mod?.css || null,
        js: app_instance?.mod?.js || null,
        theme: req?.cookies?.theme || app_instance?.options?.mod?.default_theme || 'light',
        components_in_use: render_options?.mod?.components,
      },
    });

    return res.status(200).send(html);
  };

  next();
};

export default render_middleware;
