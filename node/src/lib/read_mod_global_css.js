import { promises as fs } from 'fs';
import { join, basename } from 'path';

const read_mod_global_css = async () => {
  const globals = {};
 
  const files = await fs.readdir('private/mod/globals');
  const css_files = files.filter(file => file.endsWith('.css'));

  for (let i = 0; i < css_files.length; i++) {
    const css_file = css_files[i];
    const global_name = basename(css_file, '.css');
    globals[global_name] = await fs.readFile(
      join('private/mod/globals', css_file),
      'utf-8'
    );
  }

  return globals;
};

export default read_mod_global_css;
