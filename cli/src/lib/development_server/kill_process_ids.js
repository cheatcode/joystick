const kill_process_ids = (process_ids = []) => {
  for (let i = 0; i < process_ids?.length; i += 1) {
    const process_id = process_ids[i];
    process.kill(process_id);
  }
};

export default kill_process_ids;
