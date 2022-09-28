import chalk from 'chalk';
import AsciiTable from 'ascii-table';
import currencyFormatter from 'currency-formatter';
import getProvidersWithConnectionStatus from '../../lib/getProvidersWithConnectionStatus.js';
import loginToCheatCode from '../../lib/loginToCheatCode.js';
import domains from '../../lib/domains.js';
import getProvider from '../../lib/getProvider.js';
import getProviderInstanceSizes from './getProviderInstanceSizes.js';
import getInstanceSizeRegions from './getInstanceSizeRegions.js';
import providers from '../../lib/providers.js';

const table = new AsciiTable();

export default {
  login: () => [
    {
      name: 'emailAddress',
      type: 'text',
      prefix: '',
      message: `\n ${chalk.greenBright('>')} What is your Email Address?\n`,
    },
    {
      name: 'password',
      type: 'text',
      prefix: '',
      message: `\n ${chalk.greenBright('>')} What is your Password?\n`,
    },
  ],
  token: () => [
    {
      name: 'token',
      type: 'text',
      prefix: '',
      message: `\n ${chalk.greenBright('>')} What is your Deployment Token?\n`,
      suffix: `\n ${chalk.yellowBright(`What does this mean?`)}\n Deployment Tokens identify the Deploy account where your deployment will live.\n\n ${chalk.yellowBright(`Documentation:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/tokens')}\n\n`,
    },
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
  initialDeployment: (user = {}, loginSessionToken = '') => {
    const providers = getProvidersWithConnectionStatus(user);
    return [
      {
        name: 'provider',
        type: 'list',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} Where do you want to host the initial deployment?`,
        loop: false,
        suffix: `
        \n ${chalk.yellowBright(`What does this mean?`)}\n Select the hosting provider where your deployment's load balancers and app instances will be created.\n This can be scaled to include additional providers later.\n\n ${chalk.yellowBright(`Documentation:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/hosting-providers')}
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
  ${chalk.greenBright(`${domains?.site}/api/oauth/${answers?.provider}/connect?target=cli`)}`)}\n
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
        default: 1,
        type: 'number',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} How many load balancer instances do you want to start with?`,
        suffix: ` -- (press enter to use recommendation of 1)`,
      },
      {
        name: 'appInstances',
        type: 'number',
        default: 2,
        prefix: '',
        message: `\n ${chalk.greenBright('>')} How many app instances do you want to start with?`,
        suffix: ` -- (press enter to use recommendation of 2)`,
      },
      {
        name: 'loadBalancer_size',
        type: 'list',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} Select a Size for Your Load Balancer Instances`,
        suffix: `
          \n ${chalk.yellowBright(`What is this?`)}\n Load balancers distribute inbound internet traffic to your app instances. \n\n ${chalk.yellowBright(`Recommendations:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/scaling#load-balancer-instances')}
          \n`,
        loop: false,
        choices: async (answers = {}) => {
          const sizes = await getProviderInstanceSizes(answers, loginSessionToken);
          return (sizes || []).map((size) => {
            return {
              name: `${chalk.blue(`[${size?.name}]`)} -- ${chalk.white(`${size?.vcpus} ${size?.vcpus > 1 ? 'VCPUs' : 'VCPU'} + ${size?.memory / 1024}GB RAM + ${size?.disk > 1000 ? `${size?.disk / 1000}TB` : `${size?.disk}GB`} Disk`)} ${chalk.gray('=')} $${chalk.greenBright(`${size?.pricePerMonth}/mo`)}`,
              value: size?.id,
            };
          });
        },
      },
      {
        name: 'loadBalancer_region',
        type: 'list',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} Select a Region for Your Load Balancer Instances`,
        suffix: `
          \n ${chalk.yellowBright(`What is this?`)}\n The location of the data center where your load balancer instances will live. The continent where your choosen region is located will determine the regions available for your app instances. \n\n ${chalk.yellowBright(`Recommendations:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/scaling#regions')}
          \n`,
        loop: false,
        choices: async (answers = {}) => {
          const regions = await getInstanceSizeRegions(
            'loadBalancer_size',
            answers,
            loginSessionToken,
          );

          return (regions || []).map((region) => {
            return {
              name: `${chalk.blue(`[${region?.id}]`)} -- ${region?.name} ${chalk.magentaBright(`(${region?.continent?.name})`)}`,
              value: region?.id,
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
          \n ${chalk.yellowBright(`What is this?`)}\n App instances are running copies of your app. \n\n ${chalk.yellowBright(`Recommendations:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/scaling#app-instances')}
          \n`,
        loop: false,
        choices: async (answers = {}) => {
          const sizes = await getProviderInstanceSizes(answers, loginSessionToken);
          return (sizes || []).map((size) => {
            return {
              name: `${chalk.blue(`[${size?.name}]`)} -- ${chalk.white(`${size?.vcpus} ${size?.vcpus > 1 ? 'VCPUs' : 'VCPU'} + ${size?.memory / 1024}GB RAM + ${size?.disk > 1000 ? `${size?.disk / 1000}TB` : `${size?.disk}GB`} Disk`)} ${chalk.gray('=')} $${chalk.greenBright(`${size?.pricePerMonth}/mo`)}`,
              value: size?.id,
            };
          });
        },
      },
      {
        name: 'instance_region',
        type: 'list',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} Select a Region for Your App Instances`,
        suffix: `
          \n ${chalk.yellowBright(`What is this?`)}\n The location of the data center where your app instances will live. \n\n ${chalk.yellowBright(`Recommendations:`)}\n ${chalk.blue('https://cheatcode.co/docs/deploy/scaling#regions')}
          \n`,
        loop: false,
        choices: async (answers = {}) => {
          const regions = await getInstanceSizeRegions(
            'instance_size',
            answers,
            loginSessionToken,
          );
          return (regions || []).map((region) => {
            return {
              name: `${chalk.blue(`[${region?.id}]`)} -- ${region?.name} ${chalk.magentaBright(`(${region?.continent?.name})`)}`,
              value: region?.id,
            };
          });
        },
      },
    ];
  },
  confirmInitialDeployment: (answers = {}, costs = []) => {
    const provider = providers?.find(({ value }) => value === answers?.provider);
    const loadBalancerCosts = costs?.find(({ type }) => type === 'loadBalancers');
    const instanceCosts = costs?.find(({ type }) => type === 'instances');
    const totalMonthlyCost = [
      ...(costs || []),
      { type: 'objectStorage', monthly: 5, annually: 60 }
    ].reduce((total = 0, cost = {}) => {
      total += cost.monthly;
      return total;
    }, 0);
    const totalAnnualCost = [
      ...(costs || []),
      { type: 'objectStorage', monthly: 5, annually: 60 }
    ].reduce((total = 0, cost = {}) => {
      total += cost.annually;
      return total;
    }, 0);

    const isAbnormal = totalMonthlyCost > 100;

    return [
      {
        name: 'confirmation',
        type: 'confirm',
        prefix: '',
        message: `\n ${chalk.greenBright('>')} Run this deployment?`,
        suffix: `
        \n${table
          .removeBorder()
          .addRow(chalk.blue('Provider'), `${chalk.greenBright(provider?.name)}\n`)
          .addRow(chalk.white('---'), `\n`)
          .addRow(chalk.blue('Load Balancers'), `${chalk.yellowBright(`(${answers?.loadBalancerInstances}x)`)} ${answers?.loadBalancer_size} ${chalk.gray(`[${answers?.loadBalancer_region}]`)} = ${chalk.greenBright(`${currencyFormatter.format(loadBalancerCosts?.monthly, { code: 'USD' })}/mo`)}`)
          .addRow(chalk.blue('App Instances'), `${chalk.yellowBright(`(${answers?.appInstances}x)`)} ${answers?.instance_size} ${chalk.gray(`[${answers?.instance_region}]`)} = ${chalk.greenBright(`${currencyFormatter.format(instanceCosts?.monthly, { code: 'USD' })}/mo`)}\n`)
          .addRow(chalk.blue('Build Storage'), `${chalk.greenBright(`${currencyFormatter.format(5, { code: 'USD' })}/mo`)}\n`)
          .addRow(chalk.white('---'), `\n`)
          .addRow(chalk.magenta('Est. Total Monthly Cost'), chalk.greenBright(`${currencyFormatter.format(totalMonthlyCost, { code: 'USD' })}/mo`))
          .addRow(chalk.magenta('Est. Total Annual Cost'), chalk.greenBright(`${currencyFormatter.format(totalAnnualCost, { code: 'USD' })}/yr`))
          .toString()}
        ${isAbnormal ? `\n\n  ${chalk.yellowBright(`!!! >>> These costs are ${chalk.magenta('high')}. Be absolutely ${chalk.magenta('CERTAIN')} you want to run this deployment. <<< !!!`)}
        \n ` : '\n'}`,
      },
    ];
  },
};
