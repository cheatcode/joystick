const filter_icons_css = (icons_css = '', required_icons = []) => {
  if (required_icons.length === 0) {
    return ''
  }

  const [base_styles, icon_styles] = icons_css.split('.split-point-for-tree-shaking {\n}')
  
  // Create regex pattern to match unwanted icon selectors
  const keep_icons = required_icons.map(name => `mod-icon-${name}`).join('|')
  const remove_pattern = new RegExp(`\\.mod-icon-(?!(${keep_icons})[^{]+){[^}]+}`, 'g')
  
  return base_styles + icon_styles.replace(remove_pattern, '')
}

const get_mod_css_from_map = (map = {}, keep_list = [], theme = 'light') => {
  let css = '';
  
  if (map.global) {
    if (map.global.base) {
      css += map.global.base;
    }
    
    if (map.global[theme]) {
      css += map.global[theme];
    }

    // Add filtered icons CSS if icons exist in map.global
    if (map.global.icons) {
      // css += map.global.icons;
      const required_icons = keep_list.filter(item => item.startsWith('icon-'));
      const filtered_icons_css = filter_icons_css(map.global.icons, required_icons);
      css += filtered_icons_css;
    }
  }

  if (map.components) {
    for (let i = 0; i < keep_list.length; i++) {
      const component_name = keep_list[i];
      if (map.components[component_name] && map.components[component_name][theme]) {
        css += map.components[component_name][theme];
      }
    }
  }

  return css;
};

export default get_mod_css_from_map;