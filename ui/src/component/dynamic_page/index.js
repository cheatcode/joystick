const load_dynamic_page = async (component_instance = {}, dynamic_page_options = {}) => {
  const path_name = (dynamic_page_options?.path || '/')?.replace(location.origin, '');
  
  console.log({
    component_instance,
    path_name,
    ...dynamic_page_options,
  });

  if (!dynamic_page_options?.page) {
    console.warn('[joystick.dynamic_page.load] Must pass a page to load.');
    return;
  }

  const page_component_file = await import(`/_joystick/${dynamic_page_options?.page}?v=${new Date().getTime()}`);

  component_instance.props.page = page_component_file;
  component_instance.dynamic_page_props = dynamic_page_options?.props || {};

  if (dynamic_page_options?.path) {
    history.pushState(
      dynamic_page_options?.query_params,
      "",
      dynamic_page_options?.path,
    );
  }

  component_instance.rerender();
};

const dynamic_page = {
  load: load_dynamic_page,
};

export default dynamic_page;