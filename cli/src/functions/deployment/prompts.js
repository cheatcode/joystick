import chalk from 'chalk';
import getProvidersWithConnectionStatus from '../../lib/getProvidersWithConnectionStatus.js';
import getProvider from '../../lib/getProvider.js';
import loginToCheatCode from '../../lib/loginToCheatCode.js';
import domains from '../../lib/domains.js';

export default {
  scale: (domain = '', user = {}) => {
    const providers = getProvidersWithConnectionStatus(user);

    return [{
      name: 'direction',
      type: 'list',
      prefix: '',
      message: `\n ${chalk.greenBright('>')} What direction do you want to scale ${domain}?`,
      loop: false,
      suffix: `
      \n ${chalk.yellowBright(`What does this mean?`)}\n Do you want to add instances to your deployment (scale up) or remove instances from your deployment (scale down). \r ${chalk.yellowBright(`Documentation:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/scaling')}
      \n`,
      choices: [
        { name: 'Up', value: 'up' },
        { name: 'Down', value: 'down' },
      ],
    }, {
      name: 'type',
      type: 'list',
      prefix: '',
      message: (answers = {}) => {
        return `\n ${chalk.greenBright('>')} What do you want to scale ${answers?.direction}?`;
      },
      loop: false,
      suffix: `
      \n ${chalk.yellowBright(`What does this mean?`)}\n What type of instance do you want to scale for this deployment? \r ${chalk.yellowBright(`Documentation:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/scaling')}
      \n`,
      choices: [
        { name: 'App Instances', value: 'app' },
        { name: 'Load Balancers', value: 'loadBalancer' },
      ],
    }, {
      name: 'provider',
      type: 'list',
      prefix: '',
      message: (answers = {}) => {
        return `\n ${chalk.greenBright('>')} Which provider do you want to scale ${{ loadBalancer: 'Load Balancer', app: 'App' }[answers?.type]} instances for?`;
      },
      loop: false,
      suffix: `
      \n ${chalk.yellowBright(`What does this mean?`)}\n Select the hosting provider where this change will occur. \r ${chalk.yellowBright(`Documentation:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/scaling')}
      \n`,
      choices: providers.map((provider) => {
        return {
          ...provider,
          name: `${provider?.name} ${chalk[provider?.connectedAs.includes('Not') ? 'gray' : 'greenBright'](`(${provider?.connectedAs})`)}`,
        };
      }),
    }, {
      name: 'providerLoginPrompt',
      type: 'text',
      prefix: '\n\n',
      suffix: '\n',
      when: (answers = {}) => {
        const provider = getProvider(providers, answers?.provider);
        return provider && provider.connectedAs?.includes('Not');
      },
      message: (answers = {}) => {
        const provider = getProvider(providers, answers?.provider);
        return `\n
${chalk.yellowBright(`Please visit the URL below in your browser to connect your ${provider?.name} account:\n
${chalk.greenBright(`${domains?.site}/u/deployments/providers`)}`)}\n
After you've connected your account, head back here and press the Enter/Return key to continue.
        `
      },
      validate: async (input = '', answers = {}) => {
        // NOTE: Fetch user again to verify that the requested provider was connected.
        const userLogin = await loginToCheatCode();
        const connection = userLogin?.user[answers?.provider];
        const provider = getProvider(providers, answers?.provider);
        
        console.log({ userLogin, connection, provider });

        if (connection) {
          return true;
        }

        return `${provider?.name} not connected. Please visit the URL above to connect your account to CheatCode.`;
      },
    },]
  },
};
