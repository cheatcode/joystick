export default (items, callback) => {
  return items
    .map((item) => {
      return callback(item);
    })
    .join("\n");
};
