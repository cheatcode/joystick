const allowedOptions = [
  "mimeTypes",
  "maxSizeInMegabytes",
  "fileName",
  "providers",
  "local",
  "s3",
  "onBeforeUpload",
  "onAfterUpload"
];
const allowedLocalOptions = [
  "path"
];
const allowedS3Options = [
  "region",
  "accessKeyId",
  "secretAccessKey",
  "bucket",
  "acl"
];
var validateUploaderOptions_default = (options = {}) => {
  const errors = [];
  const optionNames = Object.keys(options);
  optionNames.forEach((optionName) => {
    if (!allowedOptions.includes(optionName)) {
      errors.push(`${optionName} is not an allowed uploader option.`);
    }
  });
  if (options?.providers?.includes("local") && !options?.local) {
    errors.push(`If an uploader provider is 'local', local object must be specified in options with a storage path.`);
  }
  if (options?.providers?.includes("s3") && !options?.s3) {
    errors.push(`If an uploader provider is 's3', s3 object must be specified with configuration.`);
  }
  if (options?.provider?.includes("local") && options.local) {
    Object.keys(options.local).forEach((optionName) => {
      if (!allowedLocalOptions.includes(optionName)) {
        errors.push(`local.${optionName} is not an allowed uploader option.`);
      }
    });
  }
  if (options?.provider?.includes("s3") && options.s3) {
    Object.keys(options.s3).forEach((optionName) => {
      if (!allowedS3Options.includes(optionName)) {
        errors.push(`s3.${optionName} is not an allowed uploader option.`);
      }
    });
  }
  return errors;
};
export {
  validateUploaderOptions_default as default
};
