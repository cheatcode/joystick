import fetch from 'node-fetch';
import chalk from 'chalk';
import getProvidersWithConnectionStatus from './getProvidersWithConnectionStatus.js';
import loginToCheatCode from './loginToCheatCode.js';
import domains from './domains.js';
import getProvider from './getProvider.js';
import checkIfValidJSON from './checkIfValidJSON.js';

export default {
  login: () => [
    {
      name: 'emailAddress',
      type: 'text',
      prefix: '',
      message: `\n ${chalk.greenBright('>')} What is your email address?`,
      suffix: ' (e.g., developer@app.com)',
    },
    {
      name: 'password',
      type: 'text',
      prefix: '',
      message: `\n ${chalk.greenBright('>')} What is your password?`,
    }
  ],
  domain: () => [
    {
      name: 'domain',
      type: 'text',
      prefix: '',
      message: `\n ${chalk.greenBright('>')} What is your domain name?`,
      suffix: ' (e.g., app.myapp.com)',
    }
  ],
  initialDeployment: (user = {}) => {
    const providers = getProvidersWithConnectionStatus(user);
    return [
      {
        name: 'provider',
        type: 'list',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} Where do you want to host the initial deployment?`,
        loop: false,
        suffix: `
        \n ${chalk.yellowBright(`What does this mean?`)}\n Select the hosting provider where your deployment's load balancers and app instances will be created.\n This can be scaled to include additional providers later. \r ${chalk.yellowBright(`Documentation:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/hosting-providers')}
        \n`,
        choices: providers.map((provider) => {
          return {
            ...provider,
            name: `${provider?.name} ${chalk[provider?.connectedAs.includes('Not') ? 'gray' : 'greenBright'](`(${provider?.connectedAs})`)}`,
          };
        }),
      },
      {
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
  ${chalk.greenBright(`http://localhost:2600/api/oauth/${answers?.provider}/connect?target=cli`)}`)}\n
  After you've connected your account, head back here and press the Enter/Return key to continue.
          `
        },
        validate: async (input = '', answers = {}) => {
          // NOTE: Fetch user again to verify that the requested provider was connected.
          const userLogin = await loginToCheatCode();
          const connection = userLogin?.user[answers?.provider];
          const provider = getProvider(providers, answers?.provider);
  
          if (connection) {
            return true;
          }
  
          return `${provider?.name} not connected. Please visit the URL above to connect your account to CheatCode.`;
        },
      },
      {
        name: 'loadBalancerInstances',
        type: 'number',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} How many load balancer instances do you want to start with?`,
        suffix: ` -- (press enter to use default of 1)`,
      },
      {
        name: 'appInstances',
        type: 'number',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} How many app instances do you want to start with?`,
        suffix: ` -- (press enter to use default of 2)`,
      },
      {
        name: 'loadBalancer_size',
        type: 'list',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} Select a Size for Your Load Balancer Instances`,
        suffix: `
          \n ${chalk.yellowBright(`What is this?`)}\n Load balancers distribute inbound internet traffic to your app instances. \r ${chalk.yellowBright(`Recommendations:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/scaling#load-balancer-instances')}
          \n`,
        loop: false,
        choices: async (answers = {}) => {
          const sizes = await fetch(`${domains.deploy}/api/providers/${answers?.provider}/sizes`).then(async (response) => {
            const data = await response.text();
            const json = checkIfValidJSON(data);

            if (Object.keys(json).length === 0) {
              console.log(chalk.redBright(data));
              process.exit(0);
            }
          });
          return sizes.map((size) => {
            return {
              name: `${chalk.blue(`[${size?.name}]`)} -- ${chalk.white(`${size?.vcpus} ${size?.vcpus > 1 ? 'VCPUs' : 'VCPU'} + ${size?.memory / 1024}GB RAM + ${size?.disk > 1000 ? `${size?.disk / 1000}TB` : `${size?.disk}GB`} Disk`)} ${chalk.gray('=')} $${chalk.greenBright(`${size?.pricePerMonth}/mo`)}`,
              value: size?.id,
            };
          });
        },
      },
      {
        name: 'instance_size',
        type: 'list',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} Select a Size for Your App Instances`,
        suffix: `
          \n ${chalk.yellowBright(`What is this?`)}\n App instances are running copies of your app. \r ${chalk.yellowBright(`Recommendations:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/scaling#app-instances')}
          \n`,
        loop: false,
        choices: async (answers = {}) => {
          const sizes = await fetch(`${domains.deploy}/api/providers/${answers?.provider}/sizes`).then((response) => response.json());
          return sizes.map((size) => {
            return {
              name: `${chalk.blue(`[${size?.name}]`)} -- ${chalk.white(`${size?.vcpus} ${size?.vcpus > 1 ? 'VCPUs' : 'VCPU'} + ${size?.memory / 1024}GB RAM + ${size?.disk > 1000 ? `${size?.disk / 1000}TB` : `${size?.disk}GB`} Disk`)} ${chalk.gray('=')} $${chalk.greenBright(`${size?.pricePerMonth}/mo`)}`,
              value: size?.id,
            };
          });
        },
      }
    ];
  }
};
