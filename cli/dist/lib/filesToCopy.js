var filesToCopy_default = [
  { path: "css", regex: new RegExp(/^css\//) },
  { path: "i18n", regex: new RegExp(/^i18n\//) },
  { path: "public", regex: new RegExp(/^public\//) },
  { path: "private", regex: new RegExp(/^private\//) },
  { path: "index.html", regex: new RegExp(/^index.html/) },
  { path: "index.css", regex: new RegExp(/^index.css/) },
  { path: "package.json", regex: new RegExp(/^package.json/) },
  { path: "package-lock.json", regex: new RegExp(/^package-lock.json/) },
  { path: "settings.development.json", regex: new RegExp(/^settings.development.json/) },
  { path: "settings.staging.json", regex: new RegExp(/^settings.staging.json/) },
  { path: "settings.test.json", regex: new RegExp(/^settings.test.json/) },
  { path: "settings.production.json", regex: new RegExp(/^settings.production.json/) },
  { path: ".html", regex: new RegExp(/^([0-9a-zA-Z-._])+.html/) }
];
export {
  filesToCopy_default as default
};
