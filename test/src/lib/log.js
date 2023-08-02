import chalk from 'chalk';
import rainbowRoad from './rainbowRoad.js';

export default (message = '', options = {}) => {
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
  const docs = options.docs || 'https://cheatcode.co/docs/joystick';

  console.log(`\n${(options.padding || '')}${rainbowRoad()}\n`);
  console.log(`${(options.padding || '')}${chalk[color](`${title}:`)}\n`)
  console.log(`${(options.padding || '')}${chalk.white(message)}\n`);
  console.log(`${(options.padding || '')}${chalk.grey('---')}\n`);
  console.log(`${(options.padding || '')}${chalk.white('Relevant Documentation:')}\n`)
  console.log(`${(options.padding || '')}${chalk.blue(docs)}\n`);
  console.log(`${(options.padding || '')}${chalk.white('Stuck? Ask a Question:')}\n`)
  console.log(`${(options.padding || '')}${chalk.blue('https://github.com/cheatcode/joystick/discussions')}\n`);

  if (options.tools && Array.isArray(options.tools)) {
    console.log(`${(options.padding || '')}${chalk.white('Helpful Tools:')}\n`);
    options.tools.forEach((tool) => {
      console.log(`${(options.padding || '')}${chalk.blue(`${tool.title} — ${tool.url}`)}\n`);
    });
  }

  console.log(`${(options.padding || '')}${rainbowRoad()}\n`);
};
