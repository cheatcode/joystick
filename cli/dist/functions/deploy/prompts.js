import fetch from "node-fetch";
import chalk from "chalk";
import AsciiTable from "ascii-table";
import currencyFormatter from "currency-formatter";
import getProvidersWithConnectionStatus from "./getProvidersWithConnectionStatus.js";
import loginToCheatCode from "./loginToCheatCode.js";
import domains from "./domains.js";
import getProvider from "./getProvider.js";
import getProviderInstanceSizes from "./getProviderInstanceSizes.js";
import getInstanceSizeRegions from "./getInstanceSizeRegions.js";
import providers from "./providers.js";
const table = new AsciiTable();
var prompts_default = {
  token: () => [
    {
      name: "token",
      type: "text",
      prefix: "",
      message: `
 ${chalk.greenBright(">")} What is your deployment token?`,
      suffix: `
      
 ${chalk.yellowBright(`What does this mean?`)}
 Deployment tokens identify the Joystick Deploy account where your deployment will live.\r ${chalk.yellowBright(`Documentation:`)}
 ${chalk.blue("https://cheatcode.co/docs/deploy/deployment-tokens")}
      
`
    }
  ],
  domain: () => [
    {
      name: "domain",
      type: "text",
      prefix: "",
      message: `
 ${chalk.greenBright(">")} What is your domain name?`,
      suffix: " (e.g., app.myapp.com)"
    }
  ],
  initialDeployment: (user = {}, deploymentToken = "", fingerprint = {}) => {
    console.log(user);
    const providers2 = getProvidersWithConnectionStatus(user);
    return [
      {
        name: "provider",
        type: "list",
        prefix: "",
        message: `
 ${chalk.greenBright(">")} Where do you want to host the initial deployment?`,
        loop: false,
        suffix: `
        
 ${chalk.yellowBright(`What does this mean?`)}
 Select the hosting provider where your deployment's load balancers and app instances will be created.
 This can be scaled to include additional providers later. \r ${chalk.yellowBright(`Documentation:`)}
 ${chalk.blue("https://cheatcode.co/docs/deploy/hosting-providers")}
        
`,
        choices: providers2.map((provider) => {
          return {
            ...provider,
            name: `${provider?.name} ${chalk[provider?.connectedAs.includes("Not") ? "gray" : "greenBright"](`(${provider?.connectedAs})`)}`
          };
        })
      },
      {
        name: "providerLoginPrompt",
        type: "text",
        prefix: "\n\n",
        suffix: "\n",
        when: (answers = {}) => {
          const provider = getProvider(providers2, answers?.provider);
          return provider && provider.connectedAs?.includes("Not");
        },
        message: (answers = {}) => {
          const provider = getProvider(providers2, answers?.provider);
          return `

  ${chalk.yellowBright(`Please visit the URL below in your browser to connect your ${provider?.name} account:

  ${chalk.greenBright(`${domains?.site}/api/oauth/${answers?.provider}/connect?target=cli`)}`)}

  After you've connected your account, head back here and press the Enter/Return key to continue.
          `;
        },
        validate: async (input = "", answers = {}) => {
          const userLogin = await loginToCheatCode();
          const connection = userLogin?.user[answers?.provider];
          const provider = getProvider(providers2, answers?.provider);
          if (connection) {
            return true;
          }
          return `${provider?.name} not connected. Please visit the URL above to connect your account to CheatCode.`;
        }
      },
      {
        name: "loadBalancerInstances",
        type: "number",
        prefix: "",
        message: `
 ${chalk.greenBright(">")} How many load balancer instances do you want to start with?`,
        suffix: ` -- (press enter to use default of 1)`
      },
      {
        name: "appInstances",
        type: "number",
        prefix: "",
        message: `
 ${chalk.greenBright(">")} How many app instances do you want to start with?`,
        suffix: ` -- (press enter to use default of 2)`
      },
      {
        name: "loadBalancer_size",
        type: "list",
        prefix: "",
        message: `
 ${chalk.greenBright(">")} Select a Size for Your Load Balancer Instances`,
        suffix: `
          
 ${chalk.yellowBright(`What is this?`)}
 Load balancers distribute inbound internet traffic to your app instances. \r ${chalk.yellowBright(`Recommendations:`)}
 ${chalk.blue("https://cheatcode.co/docs/deploy/scaling#load-balancer-instances")}
          
`,
        loop: false,
        choices: async (answers = {}) => {
          const sizes = await getProviderInstanceSizes(answers, deploymentToken, fingerprint);
          console.log(sizes);
          return (sizes || []).map((size) => {
            return {
              name: `${chalk.blue(`[${size?.name}]`)} -- ${chalk.white(`${size?.vcpus} ${size?.vcpus > 1 ? "VCPUs" : "VCPU"} + ${size?.memory / 1024}GB RAM + ${size?.disk > 1e3 ? `${size?.disk / 1e3}TB` : `${size?.disk}GB`} Disk`)} ${chalk.gray("=")} $${chalk.greenBright(`${size?.pricePerMonth}/mo`)}`,
              value: size?.id
            };
          });
        }
      },
      {
        name: "loadBalancer_region",
        type: "list",
        prefix: "",
        message: `
 ${chalk.greenBright(">")} Select a Region for Your Load Balancer Instances`,
        suffix: `
          
 ${chalk.yellowBright(`What is this?`)}
 The location of the data center where your load balancer instances will live. \r ${chalk.yellowBright(`Recommendations:`)}
 ${chalk.blue("https://cheatcode.co/docs/deploy/scaling#regions")}
          
`,
        loop: false,
        choices: async (answers = {}) => {
          const regions = await getInstanceSizeRegions("loadBalancer_size", answers, deploymentToken, fingerprint);
          return (regions || []).map((region) => {
            return {
              name: `${chalk.blue(`[${region?.id}]`)} -- ${region?.name}`,
              value: region?.id
            };
          });
        }
      },
      {
        name: "instance_size",
        type: "list",
        prefix: "",
        message: `
 ${chalk.greenBright(">")} Select a Size for Your App Instances`,
        suffix: `
          
 ${chalk.yellowBright(`What is this?`)}
 App instances are running copies of your app. \r ${chalk.yellowBright(`Recommendations:`)}
 ${chalk.blue("https://cheatcode.co/docs/deploy/scaling#app-instances")}
          
`,
        loop: false,
        choices: async (answers = {}) => {
          const sizes = await getProviderInstanceSizes(answers, deploymentToken, fingerprint);
          console.log(sizes);
          return (sizes || []).map((size) => {
            return {
              name: `${chalk.blue(`[${size?.name}]`)} -- ${chalk.white(`${size?.vcpus} ${size?.vcpus > 1 ? "VCPUs" : "VCPU"} + ${size?.memory / 1024}GB RAM + ${size?.disk > 1e3 ? `${size?.disk / 1e3}TB` : `${size?.disk}GB`} Disk`)} ${chalk.gray("=")} $${chalk.greenBright(`${size?.pricePerMonth}/mo`)}`,
              value: size?.id
            };
          });
        }
      },
      {
        name: "instance_region",
        type: "list",
        prefix: "",
        message: `
 ${chalk.greenBright(">")} Select a Region for Your App Instances`,
        suffix: `
          
 ${chalk.yellowBright(`What is this?`)}
 The location of the data center where your app instances will live. \r ${chalk.yellowBright(`Recommendations:`)}
 ${chalk.blue("https://cheatcode.co/docs/deploy/scaling#regions")}
          
`,
        loop: false,
        choices: async (answers = {}) => {
          const regions = await getInstanceSizeRegions("instance_size", answers, deploymentToken, fingerprint);
          return (regions || []).map((region) => {
            return {
              name: `${chalk.blue(`[${region?.id}]`)} -- ${region?.name}`,
              value: region?.id
            };
          });
        }
      }
    ];
  },
  confirmInitialDeployment: (answers = {}, costs = []) => {
    const provider = providers?.find(({ value }) => value === answers?.provider);
    const loadBalancerCosts = costs?.find(({ type }) => type === "loadBalancers");
    const instanceCosts = costs?.find(({ type }) => type === "instances");
    const totalMonthlyCost = costs?.reduce((total = 0, cost = {}) => {
      total += cost.monthly;
      return total;
    }, 0);
    const totalAnnualCost = costs?.reduce((total = 0, cost = {}) => {
      total += cost.annually;
      return total;
    }, 0);
    const isAbnormal = totalMonthlyCost > 100;
    return [
      {
        name: "confirmation",
        type: "confirm",
        prefix: "",
        message: `
 ${chalk.greenBright(">")} Run this deployment?`,
        suffix: `
        
${table.removeBorder().addRow(chalk.blue("Provider"), `${chalk.greenBright(provider?.name)}

`).addRow(chalk.blue("Load Balancers"), `${chalk.yellowBright(`(${answers?.loadBalancerInstances}x)`)} ${answers?.loadBalancer_size} ${chalk.gray(`[${answers?.loadBalancer_region}]`)} = ${chalk.greenBright(`${currencyFormatter.format(loadBalancerCosts?.monthly, { code: "USD" })}/mo`)}`).addRow(chalk.blue("App Instances"), `${chalk.yellowBright(`(${answers?.appInstances}x)`)} ${answers?.instance_size} ${chalk.gray(`[${answers?.instance_region}]`)} = ${chalk.greenBright(`${currencyFormatter.format(instanceCosts?.monthly, { code: "USD" })}/mo`)}

`).addRow(chalk.magenta("Est. Total Monthly Cost"), chalk.greenBright(`${currencyFormatter.format(totalMonthlyCost, { code: "USD" })}/mo`)).addRow(chalk.magenta("Est. Total Annual Cost"), chalk.greenBright(`${currencyFormatter.format(totalAnnualCost, { code: "USD" })}/yr`)).toString()}
        ${isAbnormal ? `

  ${chalk.yellowBright(`!!! >>> These costs are ${chalk.magenta("high")}. Be absolutely ${chalk.magenta("CERTAIN")} you want to run this deployment. <<< !!!`)}
        

 ` : "\n\n "}`
      }
    ];
  }
};
export {
  prompts_default as default
};
