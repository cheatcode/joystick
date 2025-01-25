import { promises as fs } from 'fs';
import { join, basename } from 'path';

const read_mod_component_css = async (tier) => {
  const components = {};
  const theme_paths = ['light', 'dark'];
  
  // NOTE: We just use the light path as that has the same components as dark.
  const light_directory_path = join('private/mod/components', tier, 'light');
  const files = await fs.readdir(light_directory_path);
  const css_files = files.filter(file => file.endsWith('.css'));

  for (let i = 0; i < css_files.length; i++) {
    const css_file = css_files[i];
    const component_name = basename(css_file, '.css');
    components[component_name] = {
      light: '',
      dark: ''
    };

    for (let j = 0; j < theme_paths.length; j++) {
      const theme = theme_paths[j];
      const file_path = join('private/mod/components', tier, theme, css_file);
      const content = await fs.readFile(file_path, 'utf8');
      components[component_name][theme] = content;
    }
  }

  return components;
};

export default read_mod_component_css;
