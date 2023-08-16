var wait_default = (seconds = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), seconds * 1e3);
  });
};
export {
  wait_default as default
};
