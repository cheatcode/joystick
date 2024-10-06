import build from '../../lib/build/index.js';
import cli_log from '../../lib/cli_log.js';
import get_deployment from './get_deployment.js';
import get_push_domain from './get_push_domain.js';
import get_settings_file from './get_settings_file.js';
import get_deployment_token from './get_deployment_token.js';
import upload_build_to_push from './upload_build_to_push.js';
import Loader from '../../lib/loader.js';

const get_token_for_deployment = async (input_deployment_token = '') => {
	const deployment_token = await get_deployment_token(input_deployment_token);

	if (!deployment_token) {
    cli_log(
      'Must pass a deployment token via the -t or --token flag, or, have an existing deployment token on your machine.',
      {
        level: "danger",
        docs: "https://cheatcode.co/docs/push/authentication"
      }
    );

    return process.exit(0);
	}

	return deployment_token;
};

const push = async (args = {}, options = {}) => {
	if (!options?.domain) {
    cli_log(
      `Must pass a deployment via -d or --domain flag.`,
      {
        level: "danger",
        docs: "https://cheatcode.co/docs/push/cli"
      }
    );

    return process.exit(0);	
	}

	process.loader = new Loader();
	process.loader.print('Starting deployment...');

	const deployment_token = await get_token_for_deployment(options?.deployment_token);
  const push_domain = get_push_domain(options?.push_server);

	const deployment = await get_deployment({
		domain: options?.domain,
		deployment_token,
		push_domain,
	});

	if (!deployment) {
    cli_log(
      `Sorry, we couldn\'t find a deployment with the domain ${options?.domain} on your account. If you haven\'t created it yet, head over to the Push dashboard: https://push.cheatcode.co/deployments/create`,
      {
        level: "danger",
        docs: "https://cheatcode.co/docs/push/deployments/create-a-new-deployment"
      }
    );

    return process.exit(0);		
	}

	const environment = deployment?.environment || 'production';
	const build_timestamp = new Date().toISOString();
	const settings = await get_settings_file({ environment });
		
	await build({
		environment,
		encrypt_build: true,
		encryption_key: deployment?.deployment_secret,
		silence_confirmation: true,
	});

	process.loader.print('Deploying to Push...');

	await upload_build_to_push({
		build_timestamp,
		deployment,
		deployment_token,
		push_domain,
		settings,
	});

	console.log({ deployment });

	process.loader.print('Deploying test...')
	console.log(deployment?.intial_deployment_completed ? `\nMonitor your deployment at ${push_domain}/deployments/${deployment?._id}.\n` : `\nFinish your deployment's setup at ${push_domain}/deployments/${deployment?._id}/setup.\n`);
};

export default push;
