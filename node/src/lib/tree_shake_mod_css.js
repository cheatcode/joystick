import { PurgeCSS } from 'purgecss';

const purge_css_string = async (html = '', css = '') => {
  const purge_result = await new PurgeCSS().purge({
    content: [{
      raw: html,
      extension: 'html',
    }],
    css: [{
      raw: css,
    }],
    safelist: [
      '[data-mod-theme="light"]',
      '[data-mod-theme=\'light\']',
      '[data-mod-theme=light]',
      '[data-mod-theme="dark"]',
      '[data-mod-theme=\'dark\']',
      '[data-mod-theme=dark]',
      '.mod-modal',
      '.mod-dialog'
    ]
  });
  
  return purge_result[0] && purge_result[0].css || '';
}

export default purge_css_string;
