// NOTE: This module is intended to be run as a child_process as part of
// a SIGINT or SIGTERM event.

import ps from "ps-node";

process.title = "joystick_cleanup";

const killProcess = (pid = 0) => {
  return new Promise((resolve) => {
    ps.kill(pid, () => {
      resolve();
    });
  });
};

process.on('message', async (message) => {
  const parsedMessage = JSON.parse(message);
  const processIds = parsedMessage?.processIds;

  for (let i = 0; i < processIds?.length; i += 1) {
    const processId = processIds[i];
    await killProcess(processId);
  }

  process.exit();
});