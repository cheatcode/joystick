/* eslint-disable consistent-return */

import log from "../lib/log";

const handleCheckUpload = ({
  uploaderName,
  maxSizeInMegabytes,
  mimeTypes,
  fileName,
  fileSize,
  mimeType,
}) => {
  try {
    const maxSizeInBytes = maxSizeInMegabytes * 1024 * 1024;
    const errors = [];

    if (maxSizeInBytes && !isNaN(maxSizeInBytes) && fileSize && fileSize > maxSizeInBytes) {
      const error = `The file ${fileName} is too big. Max file size for the uploader ${uploaderName} is ${maxSizeInMegabytes}MB.`;

      log(error, {
        level: 'danger',
        docs: 'https://github.com/cheatcode/joystick#uploaders',
      });

      errors.push(error);
    }

    if (mimeTypes?.length > 0 && !mimeTypes.includes(mimeType)) {
      const error = `The MIME type for the file ${fileName} is not supported by the uploader ${uploaderName} (only ${mimeTypes?.join(', ')}).`;

      log(error, {
        level: 'danger',
        docs: 'https://github.com/cheatcode/joystick#uploaders',
      });

      errors.push(error);
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

const formatUploads = (uploads = [], uploaderName = '', uploaderOptions = {}) => {
  try {
    return uploads.map((upload) => {
      return {
        uploaderName,
        maxSizeInMegabytes: uploaderOptions?.maxSizeInMegabytes,
        mimeTypes: uploaderOptions?.mimeTypes,
        fileName: upload?.originalname,
        fileSize: upload?.size,
        mimeType: upload?.mimetype,
        content: upload?.buffer,
      };
    });
  } catch (exception) {
    throw new Error(`[validateUploads.formatUploads] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.files) throw new Error('options.files is required.');
    if (!options.uploaderName) throw new Error('options.uploaderName is required.');
    if (!options.uploaderOptions) throw new Error('options.uploaderOptions is required.');
  } catch (exception) {
    throw new Error(`[validateUploads.validateOptions] ${exception.message}`);
  }
};

const validateUploads = (options, promise = {}) => {
  try {
    validateOptions(options);

    const formattedUploads = formatUploads(options?.files, options?.uploaderName, options?.uploaderOptions);
    const errors = handleCheckUploads(formattedUploads);

    if (errors?.length > 0) {
      return promise.reject(errors);
    }
    
    return promise.resolve(formattedUploads);
  } catch (exception) {
    promise.reject(exception);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    validateUploads(options, { resolve, reject });
  });
