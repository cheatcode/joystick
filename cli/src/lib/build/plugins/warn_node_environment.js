import fs from 'fs';
import chalk from 'chalk';

const { readFile } = fs.promises;

const warn_node_environment = (build = {}) => {
	build.onLoad({ filter: /\.js$/ }, async (args = {}) => {
    const code = await readFile(args.path, "utf-8");

    if (code?.match(/process.env.NODE_ENV\s+=\s/gi)?.length) {
      console.warn(
        chalk.yellowBright(
          "\n[WARNING] process.env.NODE_ENV should only be set via a CLI flag in development or via external environment variables in production.\n"
        )
      );
    }
  });
};

export default warn_node_environment;
