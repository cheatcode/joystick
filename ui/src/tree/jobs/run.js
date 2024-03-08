import jobs from './index.js';

const run_tree_job = (job_name = '', options = {}) => {
	const job_to_run = jobs[job_name];
	
	if (typeof job_to_run === 'function') {
		return job_to_run(options);
	}
};

export default run_tree_job;
