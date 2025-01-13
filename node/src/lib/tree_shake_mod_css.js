import { PurgeCSS } from 'purgecss';

const purge_css_string = async (html = '', css = '') => {
  const purge_result = await new PurgeCSS().purge({
    content: [{
      raw: html,
      extension: 'html',
    }],
    css: [{
      raw: css,
    }]
  });
  
  return purge_result[0] && purge_result[0].css || '';
}

export default purge_css_string;
