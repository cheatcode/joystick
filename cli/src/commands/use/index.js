import child_process from "child_process";
import util from 'util';
import Loader from '../../lib/loader.js';
import replace_in_files from '../../lib/replace_in_files.js';

const exec = util.promisify(child_process.exec);

const use = async (args = {}, options = {}) => {
  const loader = new Loader();

  if (args?.release === 'canary') {
    await replace_in_files(process.cwd(), {
      match: [/\.js$/],
      exclude: [/node_modules/],
      replace_regex: /(@joystick\.js\/node)(?!-)/g,
      replace_with: '@joystick.js/node-canary',
    });

    await replace_in_files(process.cwd(), {
      match: [/\.js$/],
      exclude: [/node_modules/],
      replace_regex: /(@joystick\.js\/ui)(?!-)/g,
      replace_with: '@joystick.js/ui-canary',
    });

    await replace_in_files(process.cwd(), {
      match: [/\.js$/],
      exclude: [/node_modules/],
      replace_regex: /(@joystick\.js\/test)(?!-)/g,
      replace_with: '@joystick.js/test-canary',
    });
    
    loader.print('Swapping production packages for canary versions...');
    
    await exec('npm uninstall @joystick.js/node && npm i @joystick.js/node-canary');
    await exec('npm uninstall @joystick.js/ui && npm i @joystick.js/ui-canary');
    await exec('npm uninstall @joystick.js/test && npm i @joystick.js/test-canary');
  }
  
  if (args?.release === 'production') {
    await replace_in_files(process.cwd(), {
      match: [/\.js$/],
      exclude: [/node_modules/],
      replace_regex: /(@joystick\.js\/node-canary)/g,
      replace_with: '@joystick.js/node',
    });

    await replace_in_files(process.cwd(), {
      match: [/\.js$/],
      exclude: [/node_modules/],
      replace_regex: /(@joystick.js\/ui-canary)/g,
      replace_with: '@joystick.js/ui',
    });

    await replace_in_files(process.cwd(), {
      match: [/\.js$/],
      exclude: [/node_modules/],
      replace_regex: /(@joystick\.js\/test-canary)/g,
      replace_with: '@joystick.js/test',
    });
    
    loader.print('Swapping canary packages for production versions...');
    
    await exec('npm uninstall @joystick.js/node-canary && npm i @joystick.js/node');
    await exec('npm uninstall @joystick.js/ui-canary && npm i @joystick.js/ui');
    await exec('npm uninstall @joystick.js/test-canary && npm i @joystick.js/test');
  }
};

export default use;
