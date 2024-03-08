import chalk from 'chalk';
import log_bars from './log_bars.js';

const cli_log = (message = '', options = {}) => {
  const colors = {
    info: 'blue',
    success: 'green',
    warning: 'yellowBright',
    danger: 'red',
  };

  const titles = {
    info: '❱ Info',
    success: '❱ Ok',
    warning: '❱ Warning',
    danger: '❱ Error',
  };
  
  const color = options.level ? colors[options.level] : 'gray';
  const title = options.level ? titles[options.level] : 'Log';
  const docs = options.docs || 'https://docs.cheatcode.co/joystick';

  console.log(`\n${(options.padding || '')}${log_bars()}\n`);
  console.log(`${(options.padding || '')}${chalk[color](`${title}:`)}\n`)
  console.log(`${(options.padding || '')}${chalk.white(message)}\n`);
  console.log(`${(options.padding || '')}${chalk.grey('---')}\n`);
  console.log(`${(options.padding || '')}${chalk.white('Relevant Documentation:')}\n`)
  console.log(`${(options.padding || '')}${chalk.blue(docs)}\n`);
  console.log(`${(options.padding || '')}${chalk.white('Stuck? Ask a Question:')}\n`)
  console.log(`${(options.padding || '')}${chalk.blue('http://discord.cheatcode.co')}\n`);
  
  if (options.tools && Array.isArray(options.tools)) {
    console.log(`${(options.padding || '')}${chalk.white('Helpful Tools:')}\n`);
    
    for (let i = 0; i < options?.tools?.length; i += 1) {
      const tool = options?.tools[i];
      console.log(`${(options.padding || '')}${chalk.blue(`${tool.title} — ${tool.url}`)}\n`);
    }
  }

  console.log(`${(options.padding || '')}${log_bars()}\n`);
};

export default cli_log;
