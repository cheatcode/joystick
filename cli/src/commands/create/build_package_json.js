const build_package_json = (project_name = "") => {
  const package_json = {
    type: "module",
    name: project_name,
    version: "0.0.1",
    description: "",
    main: "index.js",
    scripts: {
      start: "joystick start",
      test: "joystick test",
    },
    keywords: [],
    author: "",
    license: "ISC",
  };

  return JSON.stringify(package_json, null, 2);
};

export default build_package_json;
