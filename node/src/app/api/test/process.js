const test_process = (req = {}, res = {}) => {
  res.status(200).send({
    test: process?.test || {},
  });
};

export default test_process;
