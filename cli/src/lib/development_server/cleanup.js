// NOTE: This module is intended to be run as a child_process as part of
// a SIGINT or SIGTERM event.

import kill_process_ids from "./kill_process_ids.js";

process.title = "joystick_cleanup";

process.on('message', async (message) => {
  const parsed_message = JSON.parse(message);
  const process_ids = parsed_message?.process_ids;

  kill_process_ids(process_ids);

  process.exit();
});