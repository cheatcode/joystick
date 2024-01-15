const get_future_timestamp = (timestamp, seconds = 0) => {
  const date = new Date(timestamp);
  date.setSeconds(date.getSeconds() + seconds);
  return date.toISOString();
};
var handleCleanupQueues_default = async ({
  database = {},
  table = "",
  seconds = 0
}) => {
  const jobs_with_status = await database.query(`
		SELECT * FROM ${table} WHERE status = ANY($1) AND environment = $2
	`, [
    ["completed", "failed"],
    process.env.NODE_ENV
  ]);
  const jobs_to_cleanup = jobs_with_status?.filter((job = {}) => {
    if (job?.status === "completed") {
      const completed_at_with_seconds = get_future_timestamp(job?.completed_at, seconds);
      return completed_at_with_seconds <= new Date().toISOString();
    }
    if (job?.status === "failed") {
      const failed_at_with_seconds = get_future_timestamp(job?.failed_at, seconds);
      return failed_at_with_seconds <= new Date().toISOString();
    }
    return false;
  });
  await database.query(`
		DELETE FROM ${table} WHERE _id = ANY($1)
	`, [
    jobs_to_cleanup?.map(({ _id }) => _id)
  ]);
};
export {
  handleCleanupQueues_default as default
};
