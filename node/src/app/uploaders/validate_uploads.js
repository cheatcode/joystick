import log from "../../lib/log.js";
import track_function_call from "../../test/track_function_call.js";
import types from "../../lib/types.js";

const handle_check_upload = ({
  uploader_name,
  max_size_in_megabytes,
  mime_types,
  original_file_name,
  file_size,
  mime_type,
}) => {
  const max_size_in_bytes = max_size_in_megabytes * 1024 * 1024;
  const errors = [];

  if (types.is_number(max_size_in_bytes) && file_size && file_size > max_size_in_bytes) {
    const error = `The file ${original_file_name} is too big. Max file size is ${max_size_in_megabytes}MB.`;

    log(error, {
      level: 'danger',
      docs: 'https://docs.cheatcode.co/joystick/node/uploaders',
    });

    errors.push({ status: 400, error: new Error(error), message: error, location: `uploaders.${uploader_name}` });
  }

  if (mime_types?.length > 0 && !mime_types.includes(mime_type)) {
    const error = `The MIME type for the file ${original_file_name} is not supported by the uploader ${uploader_name} (only ${mime_types?.join(', ')}).`;

    log(error, {
      level: 'danger',
      docs: 'https://docs.cheatcode.co/joystick/node/uploaders',
    });

    errors.push({ status: 400, error: new Error(error), message: error, location: `uploaders.${uploader_name}` });
  }

  return errors;
};

const handle_check_uploads = (uploads = []) => {
  return uploads.flatMap((upload = {}) => {
    return handle_check_upload(upload);
  });
};

const format_uploads = ({
  files: uploads = [],
  uploader_name = '',
  uploader_options = {},
  uploader_input = {},
}) => {
  return Promise.all(uploads.map(async (upload) => {
  	// NOTE: The upload passed in here is controlled by multer, not Joystick.
  	// This is why property names are not converted to snake_case.
    const file_extension = upload?.mimetype?.split('/').pop();
    const file_name_is_function = types.is_function(uploader_options?.fileName) || types.is_function(uploader_options?.file_name);
    const max_size_is_function = types.is_function(uploader_options?.maxSizeInMegabytes) || types.is_function(uploader_options?.max_size_in_megabytes);

    if (file_name_is_function) {
      track_function_call(`node.uploaders.${uploader_name}.file_name`, [{
        uploader_input,
        file_name: upload?.originalname,
        file_size: upload?.size,
        file_extension,
        mime_type: upload?.mimetype
      }]);
    }

    if (max_size_is_function) {
      track_function_call(`node.uploaders.${uploader_name}.max_size_in_megabytes`, [
        { input: uploader_input, upload }
      ]);
    }

    const max_size_in_megabytes = max_size_is_function ?
      await (uploader_options?.maxSizeInMegabytes || uploader_options?.max_size_in_megabytes)({ input: uploader_input, upload }) :
      (uploader_options?.maxSizeInMegabytes || uploader_options?.max_size_in_megabytes);

    const file_name = file_name_is_function ?
        (uploader_options.fileName || uploader_options?.file_name)({
          input: uploader_input,
          fileName: upload?.originalname,
          file_name: upload?.originalname,
          fileSize: upload?.size,
          file_size: upload?.size,
          fileExtension: file_extension,
          file_extension,
          mimeType: upload?.mimetype,
          mime_type: upload?.mimetype
        }) :
        upload?.originalname;

    return {
      uploader_name,
      providers: uploader_options?.providers,
      local: uploader_options?.local,
      s3: uploader_options?.s3,
      maxSizeInMegabytes: max_size_in_megabytes,
      max_size_in_megabytes,
      mimeTypes: uploader_options?.mimeTypes,
      mime_types: uploader_options?.mimeTypes,
      fileName: file_name,
      file_name,
      original_file_name: upload?.originalname,
      originalFileName: upload?.originalname,
      file_size: upload?.size,
      fileSize: upload?.size,
      mime_type: upload?.mimetype,
      mimeType: upload?.mimetype,
      content: upload?.buffer,
    };
  }));
};

const validate_uploads = async (validate_uploads_options = {}) => {
  const formatted_uploads = await format_uploads(validate_uploads_options);
  const errors = handle_check_uploads(formatted_uploads);

  if (errors?.length > 0) {
    return { errors };
  }
  
  return formatted_uploads;
};

export default validate_uploads;
