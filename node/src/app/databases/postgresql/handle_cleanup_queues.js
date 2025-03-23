import timestamps from "../../../lib/timestamps.js";

const handle_cleanup_queues = async ({
  database = {},
  table = '',
  seconds = 0,
}) => {
  const jobs_with_status = await database.query(`
    SELECT * FROM ${table} WHERE status = ANY($1) AND environment = $2
  `, [
    ['completed', 'failed'],
    process.env.NODE_ENV,
  ]);

  const jobs_to_cleanup = jobs_with_status?.filter((job = {}) => {
    if (job?.status === 'completed') {
      const completed_at_with_seconds = timestamps.get_future_time('seconds', seconds, { 
        start_from: job?.completed_at,
        format: timestamps.get_database_format(database)
      });
      const current_time = timestamps.get_current_time({ 
        format: timestamps.get_database_format(database) 
      });
      return new Date(completed_at_with_seconds).getTime() <= new Date(current_time).getTime();
    }

    if (job?.status === 'failed') {
      const failed_at_with_seconds = timestamps.get_future_time('seconds', seconds, { 
        start_from: job?.failed_at,
        format: timestamps.get_database_format(database)
      });
      const current_time = timestamps.get_current_time({ 
        format: timestamps.get_database_format(database) 
      });
      return new Date(failed_at_with_seconds).getTime() <= new Date(current_time).getTime();
    }

    return false;
  });

  await database.query(`
    DELETE FROM ${table} WHERE _id = ANY($1)
  `, [
    jobs_to_cleanup?.map(({ _id }) => _id)
  ]);
};

export default handle_cleanup_queues;