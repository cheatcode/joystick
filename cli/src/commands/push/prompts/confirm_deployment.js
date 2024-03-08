import AsciiTable from 'ascii-table';
import chalk from 'chalk';

const render_instance_row = (table, [continent_name = '', continent_instances = []]) => {
	table.addRow(`${chalk.magenta(continent_name)}\n`);

	for (let i = 0; i < continent_instances?.length; i += 1) {
		const instance = continent_instances[i];
		table.addRow(
			`${chalk.yellow(instance?.provider)} (${chalk.green(instance?.region)})`,
			`${chalk.white(instance?.size)}  $${chalk.green(instance?.pricePerMonth)}/mo.  x${chalk.blue(instance?.quantity)}  ${chalk.white('=')}  $${chalk.green((instance?.quantity * instance?.pricePerMonth))}/mo.${i + 1 === continent_instances?.length ? '\n' : ''}`,
		);
	}
};

const get_total_monthly_cost_for_instances = (instances = []) => {
	const instances_by_continent = Object.values(instances)?.flatMap((instances_for_continent) => instances_for_continent);
	return instances_by_continent?.reduce((total = 0, instance = {}) => {
		total += instance?.pricePerMonth * instance?.quantity;
		return total;
	}, 0);
};

const confirm_deployment = (instances = {}) => {
	const load_balancer_total_per_month = get_total_monthly_cost_for_instances(instances?.load_balancer);
	const app_total_per_month = get_total_monthly_cost_for_instances(instances?.app);
	const total_monthly_cost = load_balancer_total_per_month + app_total_per_month;

	const table = new AsciiTable();

	table.removeBorder();
	table.addRow(`${chalk.blue('Load Balancer')}\n`);

	const load_balancer_continents = Object.entries(instances?.load_balancer);
	const app_continents = Object.entries(instances?.app);

	for (let i = 0; i < load_balancer_continents?.length; i += 1) {
		render_instance_row(table, load_balancer_continents[i]);
	}

	table.addRow(`\n  ${chalk.blue('App')}\n`);

	for (let i = 0; i < app_continents?.length; i += 1) {
		render_instance_row(table, app_continents[i]);
	}
	
	table.addRow(chalk.white('\n  ---\n'));
	
	table.addRow(
		chalk.green('Monthly Cost'),
		chalk.white(`$${chalk.green(total_monthly_cost)}/mo.`)
	);

	table.addRow(
		chalk.green('Annual Cost'),
		chalk.white(`$${chalk.green(total_monthly_cost * 12)}/yr.`)
	);

	const is_abnormal = total_monthly_cost > 100;

	return [{
	  name: 'confirm_deployment',
	  type: 'confirm',
	  prefix: '',
	  message: `\n ${chalk.greenBright('>')} Start deployment and provision these instances?`,
	  suffix: `
	  \n${table.toString()}
	  ${is_abnormal ? `\n\n  ${chalk.yellowBright(`!!! >>> These costs are ${chalk.magenta('high')}. Be absolutely ${chalk.magenta('CERTAIN')} you want to run this deployment. <<< !!!`)}
	  \n ` : '\n'}`,
	}];
};

export default confirm_deployment;
