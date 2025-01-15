const filter_icons_css = (icons_css = '', required_icons = []) => {
  const lines = icons_css.split('\n')
  const output = []
  
  let in_font_face = false
  let in_base_icon_rule = false
  let in_brand_icon_rule = false
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim()
    
    if (trimmed_line.startsWith('@font-face')) {
      in_font_face = true
    } else if (trimmed_line.startsWith('[class^="mod-icon-"], [class*=" mod-icon-"] {')) {
      in_base_icon_rule = true
    } else if (trimmed_line.startsWith('[class^="mod-icon-brand-"], [class*=" mod-icon-brand-"] {')) {
      in_brand_icon_rule = true
    } else if (trimmed_line === '}') {
      in_font_face = false
      in_base_icon_rule = false
      in_brand_icon_rule = false
    }
    
    if (in_font_face || in_base_icon_rule || in_brand_icon_rule) {
      output.push(lines[i])
    } else if (trimmed_line.startsWith('.mod-icon-')) {
      const icon_name = trimmed_line
        .replace('.mod-icon-', '')
        .split(':before')[0]
        
      if (required_icons.includes(`icon-${icon_name}`)) {
        output.push(lines[i])
      }
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
    // if (map.global.icons) {
    //   const required_icons = keep_list.filter(item => item.startsWith('icon-'));
    //   css += filter_icons_css(map.global.icons, required_icons);
    // }
  }

  if (map.components) {
    for (let i = 0; i < keep_list.length; i++) {
      const component_name = keep_list[i];
      if (map.components[component_name]?.css?.[theme]) {
        css += map.components[component_name].css[theme];
      }
    }
  }

  return css;
};

export default get_mod_css_from_map;