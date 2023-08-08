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
  const docs = options.docs || 'https://github.com/cheatcode/joystick';

  console.log(`\n${rainbowRoad()}\n`);
  console.log(`${chalk[color](`${title}:`)}\n`)
  console.log(`${chalk.white(message)}\n`);
  console.log(`${chalk.grey('---')}\n`);
  console.log(`${chalk.white('Relevant Documentation:')}`)
  console.log(`\n${chalk.blue(docs)}\n`);
  console.log(`${chalk.white('Stuck? Ask a Question:')}\n`)
  console.log(`${chalk.blue('https://github.com/cheatcode/joystick/discussions')}\n`);
  
  if (options.tools && Array.isArray(options.tools)) {
    console.log(`${chalk.white('Helpful Tools:')}\n`);
    options.tools.forEach((tool) => {
      console.log(`${chalk.blue(`${tool.title} — ${tool.url}`)}\n`);
    });
  }

  console.log(`${rainbowRoad()}\n`);
};
