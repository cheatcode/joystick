import log from "../lib/log";
import trackFunctionCall from "../test/trackFunctionCall.js";
const handleCheckUpload = ({
  uploaderName,
  maxSizeInMegabytes,
  mimeTypes,
  originalFileName,
  fileSize,
  mimeType
}) => {
  try {
    const maxSizeInBytes = maxSizeInMegabytes * 1024 * 1024;
    const errors = [];
    if (maxSizeInBytes && !isNaN(maxSizeInBytes) && fileSize && fileSize > maxSizeInBytes) {
      const error = `The file ${originalFileName} is too big. Max file size for the uploader ${uploaderName} is ${maxSizeInMegabytes}MB.`;
      log(error, {
        level: "danger",
        docs: "https://github.com/cheatcode/joystick#uploaders"
      });
      errors.push({ message: error });
    }
    if (mimeTypes?.length > 0 && !mimeTypes.includes(mimeType)) {
      const error = `The MIME type for the file ${originalFileName} is not supported by the uploader ${uploaderName} (only ${mimeTypes?.join(", ")}).`;
      log(error, {
        level: "danger",
        docs: "https://github.com/cheatcode/joystick#uploaders"
      });
      errors.push({ message: error });
    }
    return errors;
  } catch (exception) {
    throw new Error(`[validateUploads.handleCheckUpload] ${exception.message}`);
  }
};
const handleCheckUploads = (uploads = []) => {
  try {
    return uploads.flatMap((upload) => {
      return handleCheckUpload(upload);
    });
  } catch (exception) {
    throw new Error(`[validateUploads.handleCheckUploads] ${exception.message}`);
  }
};
const formatUploads = ({
  files: uploads = [],
  uploaderName = "",
  uploaderOptions = {},
  input = {}
}) => {
  try {
    return Promise.all(uploads.map(async (upload) => {
      const fileExtension = upload?.mimeType?.split("/").pop();
      const fileNameIsFunction = typeof uploaderOptions?.fileName === "function";
      if (fileNameIsFunction) {
        trackFunctionCall(`node.uploaders.${uploaderName}.fileName`, [{
          input,
          fileName: upload?.originalname,
          fileSize: upload?.size,
          fileExtension,
          mimeType: upload?.mimetype
        }]);
      }
      return {
        uploaderName,
        providers: uploaderOptions?.providers,
        local: uploaderOptions?.local,
        s3: uploaderOptions?.s3,
        maxSizeInMegabytes: typeof uploaderOptions?.maxSizeInMegabytes === "function" ? await uploaderOptions?.maxSizeInMegabytes({ input, upload }) : uploaderOptions?.maxSizeInMegabytes,
        mimeTypes: uploaderOptions?.mimeTypes,
        fileName: fileNameIsFunction ? uploaderOptions.fileName({ input, fileName: upload?.originalname, fileSize: upload?.size, fileExtension, mimeType: upload?.mimetype }) : upload?.originalname,
        originalFileName: upload?.originalname,
        fileSize: upload?.size,
        mimeType: upload?.mimetype,
        content: upload?.buffer
      };
    }));
  } catch (exception) {
    throw new Error(`[validateUploads.formatUploads] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.files)
      throw new Error("options.files is required.");
    if (!options.uploaderName)
      throw new Error("options.uploaderName is required.");
    if (!options.uploaderOptions)
      throw new Error("options.uploaderOptions is required.");
  } catch (exception) {
    throw new Error(`[validateUploads.validateOptions] ${exception.message}`);
  }
};
const validateUploads = async (options, promise = {}) => {
  try {
    validateOptions(options);
    const formattedUploads = await formatUploads(options);
    const errors = handleCheckUploads(formattedUploads);
    if (errors?.length > 0) {
      return promise.reject(errors);
    }
    return promise.resolve(formattedUploads);
  } catch (exception) {
    promise.reject(exception);
  }
};
var validateUploads_default = (options) => new Promise((resolve, reject) => {
  validateUploads(options, { resolve, reject });
});
export {
  validateUploads_default as default
};
