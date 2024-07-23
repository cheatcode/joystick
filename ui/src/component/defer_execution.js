const defer_execution = (callback, options = {}) => {
  const {
    can_execute,
    delay = 50, // NOTE: In milliseconds.
    max_attempts = Infinity
  } = options;

  let attempts = 0;

  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (attempts >= max_attempts) {
        reject(new Error(`Max attempts (${max_attempts}) reached`));
        return;
      }

      setTimeout(() => {
        attempts++;
        // Check the current value of can_execute
        if (typeof can_execute === 'function' ? can_execute() : can_execute) {
          try {
            const result = callback();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          attempt();
        }
      }, delay);
    }

    attempt();
  });
}

export default defer_execution;