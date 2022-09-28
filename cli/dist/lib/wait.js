var wait_default = (delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), delay);
  });
};
export {
  wait_default as default
};
