import chokidar from 'chokidar';
import fs from 'fs';
import { dirname } from 'path';
import build_files from '../../build/build_files.js';
import debounce from '../../debounce.js';
import get_after_run_tasks from './get_after_run_tasks.js';
import get_file_codependencies from './get_file_codependencies.js';
import get_file_operation from '../../build/get_file_operation.js';
import get_path_platform from '../../build/get_path_platform.js';
import types from '../../types.js';
import watch_paths from './watch_paths.js';
 
const { mkdir, copyFile, rm: remove } = fs.promises;

const handle_build_files = async (job = {}, options = {}) => {
	const codependencies = process.initial_build_complete ? await get_file_codependencies(job?.path) : [];

	// NOTE: If we have codependencies, make sure that the file triggering the current job is rebuilt first
	// *before* rebuilding its codependencies. This ensures that codependencies get the latest build of the
	// file. If we do them all together in parallel, the latest build is missed.
	if (options?.is_build_file) {
		await build_files({
			files: [{ path: job?.path, platform: get_path_platform(job?.path) }],
		}).catch((errors = []) => {
			if (!process.initial_build_complete && errors?.length > 0) {
				process.exit(0);
			}

			if (process.initial_build_complete && errors?.length > 0) {
				process.app_server_process.send(
	        JSON.stringify({
	          type: "BUILD_ERROR",
	          paths: errors.filter(({ success }) => !success),
	        })
	      );
				
				process.hmr_server_process.send(JSON.stringify({
			    type: 'BUILD_ERROR',
			  }));

				throw new Error('BUILD_ERROR');
			}
		});
	}

	// NOTE: Run handle_build_files() recursively against codependencies as each of *that* files codependencies
	// need to be rebuilt, too. This is because we bundle code into a single file, so all files up the "tree"
	// need to be updated to reflect any changes of their children.
	if (codependencies?.length > 0) {
		for (let i = 0; i < codependencies?.length; i += 1) {
			const codependency = codependencies[i];
			await handle_build_files({ path: codependency }, options);
		}
	}

	return Promise.resolve();
};

const run_job = async (job = {}) => {
	switch(job?.operation) {
		case 'add_directory':
			return mkdir(`.joystick/build/${job?.path}`, { recursive: true });
		case 'build_file':
			return handle_build_files(job, { is_build_file: true });
		case 'copy_file':
			await mkdir(dirname(`.joystick/build/${job?.path}`), { recursive: true });
			await copyFile(job?.path, `.joystick/build/${job?.path}`);
			return handle_build_files(job, { is_build_file: false });
		case 'delete_directory':
			return remove(`.joystick/build/${job?.path}`, { recursive: true });
		case 'delete_file':
			await remove(`.joystick/build/${job?.path}`, { recursive: true });
			return handle_build_files(job, { is_build_file: false });
		default:
			return true;
	}
};

const get_delete_directory_job = (job = {}) => {
	return {
		operation: job?.event,
		path: job?.path,
		after_run_tasks: process.initial_build_complete ? get_after_run_tasks(job?.path) : ['start_app_server', 'start_hmr_server'],
	};
};

const get_add_directory_job = (job = {}) => {
	return {
		operation: job?.event,
		path: job?.path,
		after_run_tasks: process.initial_build_complete ? get_after_run_tasks(job?.path) : ['start_app_server', 'start_hmr_server'],
	};
};

const get_delete_file_job = (job = {}) => {
	return {
		operation: job?.event,
		path: job?.path,
		after_run_tasks: process.initial_build_complete ? get_after_run_tasks(job?.path) : ['start_app_server', 'start_hmr_server'],
	};
};

const get_change_file_job = (job = {}) => {
	return {
		operation: job?.is_custom_copy_path ? 'copy_file' : get_file_operation(job?.path),
		path: job?.path,
		after_run_tasks: process.initial_build_complete ? get_after_run_tasks(job?.path) : ['start_app_server', 'start_hmr_server'],
	};
};

const get_add_file_job = (job = {}) => {
	return {
		operation: job?.is_custom_copy_path ? 'copy_file' : get_file_operation(job?.path),
		path: job?.path,
		after_run_tasks: process.initial_build_complete ? get_after_run_tasks(job?.path) : ['start_app_server', 'start_hmr_server'],
	};
};

const get_job_to_be_done = (job = {}) => {
	switch(job?.event) {
		case 'add_file':
			return get_add_file_job(job);
		case 'change_file':
			return get_change_file_job(job);
		case 'delete_file':
			return get_delete_file_job(job);
		case 'add_directory':
			return get_add_directory_job(job);
		case 'delete_directory':
			return get_delete_directory_job(job);
	}
};

const process_file_watcher_jobs = async (jobs = [], after_run_functions = {}) => {
	try {
		const after_run_tasks = new Set([]);

		for (let i = 0; i < jobs?.length; i += 1) {
			const job_to_run = jobs[i];
			const job = get_job_to_be_done(job_to_run);

			console.log('JOB', job);

			await run_job(job);

			if (job?.after_run_tasks) {
				for (let i = 0; i < job?.after_run_tasks?.length; i += 1) {
					const after_run_task = job?.after_run_tasks[i];
					after_run_tasks.add(after_run_task);
				}
			}
		}

		const tasks_to_run = Array.from(after_run_tasks);

		for (let i = 0; i < tasks_to_run?.length; i += 1) {
			const after_run_task = tasks_to_run[i];

			if (types.is_function(after_run_functions[after_run_task])) {
				await after_run_functions[after_run_task](jobs);
			}
		}
	} catch(error) {
		// NOTE: Dead catch as we just want to avoid after_run_tasks from running. Actual
		// errors are handled as part of run_job() (e.g., build errors are handled as a part
		// of handle_build_files()).
	}
};

const transform_chokidar_event = (event = '') => {
	switch(event) {
		case 'add':
			return 'add_file';
		case 'change':
			return 'change_file';
		case 'unlink':
			return 'delete_file';
		case 'addDir':
			return 'add_directory';
		case 'unlinkDir':
			return 'delete_directory';
	}
};

const watch_for_changes = (after_run_functions = {}, watch_for_changes_options = {}) => {
	const file_watcher = chokidar.watch([...watch_paths, ...(watch_for_changes_options?.custom_copy_paths || [])].map(({ path }) => path), {
		ignored: '.joystick',
	});

	let file_watcher_jobs = [];

	process.initial_build_complete = false;

	file_watcher.on('error', (error) => console.error(error));

	file_watcher.on('all', (event, path) => {
		const is_excluded_path = watch_for_changes_options?.excluded_paths?.some((excluded_path) => {
			return path.includes(excluded_path);
		});

		if (!is_excluded_path) {
			file_watcher_jobs.push({
				event: transform_chokidar_event(event),
				path,
				is_custom_copy_path: watch_for_changes_options?.custom_copy_paths?.length ? watch_for_changes_options?.custom_copy_paths.some((custom_copy_path) => {
				  return path.includes(custom_copy_path?.path);
				}) : false,
			});

			// NOTE: Depending on the watch event, we expect multiple events to be emitted
			// by chokidar. Debouncing here allows us to "collect" the jobs for the current
			// chain of events and *then* process them all together. This is done to avoid
			// triggering multiple HMR calls or server restarts for files related to the
			// same job. This is near-instant, so there's no delay for the developer.
			debounce(async () => {
				console.log(file_watcher_jobs);
				await process_file_watcher_jobs(file_watcher_jobs, after_run_functions);
				process.initial_build_complete = true;
				file_watcher_jobs = [];
			}, 100);
		}
	});
};

export default watch_for_changes;
