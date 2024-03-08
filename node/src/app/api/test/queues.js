const test_queues = async (req = {}, res = {}, app_instance = {}) => {
	const queue = process?.queues[req?.body?.queue];
	const job = app_instance?.options?.queues[req?.body?.queue]?.jobs[req?.body?.job];

	if (!queue) {
	  return res.status(404).send({ status: 404, error: `Queue ${req?.body?.queue} not found.` });
	}

	if (!job) {
	  return res.status(400).send({
	  	status: 400,
	  	error: `Couldn't find a job called ${req?.body?.job} for the ${req?.body?.queue} queue.`
	 	});
	}

	await queue.handle_next_job({
	  _id: 'joystick_test',
	  job: req?.body?.job,
	  payload: req?.body?.payload,
	});

	res.status(200).send({ status: 200, data: {} });
};

export default test_queues;
