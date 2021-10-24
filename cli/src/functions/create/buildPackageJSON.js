export default (projectName = "") => {
  const packageJSON = {
    name: projectName,
    version: "1.0.0",
    description: "",
    main: "index.js",
    scripts: {
      start: "joystick start",
      test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: [],
    author: "",
    license: "ISC",
  };

  return JSON.stringify(packageJSON, null, 2);
};
