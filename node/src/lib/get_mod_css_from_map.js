const filter_icons_css = (icons_css = '', required_icons = []) => {
  const lines = icons_css.split('\n')
  const output = []
  
  // Always include font-face declarations and base icon rules
  let include_current = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Start including when we hit a font-face or base icon rule
    if (line.startsWith('@font-face') || 
        line.startsWith('[class^="mod-icon-"]') ||
        line.startsWith('[class*=" mod-icon-"]')) {
      include_current = true
    }
    
    // Include specific icon classes that are required
    if (line.startsWith('.mod-icon-') && required_icons.length > 0) {
      const icon_name = line.match(/mod-icon-([^:]+)/)?.[1]
      include_current = required_icons.includes(icon_name)
    }
    
    // Stop including when we hit a closing brace
    if (line === '}') {
      include_current = false
    }
    
    if (include_current) {
      output.push(lines[i])
    }
  }
  
  return output.join('\n')
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
      const required_icons = keep_list.filter(item => item.startsWith('icon-'));
      const filtered_icons_css = filter_icons_css(map.global.icons, required_icons);
      console.log(filtered_icons_css);
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