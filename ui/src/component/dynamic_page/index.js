const load_dynamic_page = (component_instance = {}, dynamic_page_options = {}) => {
  const path_name = (dynamic_page_options?.path || '/')?.replace(location.origin, '');
  console.log({
    component_instance,
    path_name,
    ...dynamic_page_options,
  });
};

const dynamic_page = {
  load: load_dynamic_page,
};

export default dynamic_page;