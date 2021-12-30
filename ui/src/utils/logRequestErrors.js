export default (label = '', errors = []) => {
  console.log(
    `%c❌ ${label} failed with the following errors:`,
    'background-color: #ffcc00; padding: 7px; font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif; font-size: 13px; line-height: 13px; color: #000;'
  );

  errors.forEach((error) => {
    console.log(error.message);

    if (error.stack) {
      console.log(error.stack);
    }
  });
};
