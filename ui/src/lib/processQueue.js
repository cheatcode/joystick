import throwFrameworkError from "./throwFrameworkError";
import windowIsUndefined from "./windowIsUndefined";

const getQueue = (queueName = '') => {
  try {
    const [queueGroup, queueInGroup] = queueName?.split('.');
    const queue = queueInGroup ? window?.joystick?._internal?.queues[queueGroup][queueInGroup] : window?.joystick?._internal?.queues[queueGroup];
    return queue;
  } catch (exception) {
    throwFrameworkError('processQueue.getQueue', exception);
  }
};

export default (queueName = '', callback = null) => {
  try {
    if (!windowIsUndefined()) {
      const queue = getQueue(queueName) || {};
      queue.process(callback);
    }
  } catch (exception) {
    throwFrameworkError('processQueue', exception);
  }
};