const allowed_options = [
  'mimeTypes',
  'mime_types',
  'maxSizeInMegabytes',
  'max_size_in_megabytes',
  'fileName',
  'file_name',
  'providers',
  'local',
  's3',
  'onBeforeUpload',
  'on_before_upload',
  'onAfterUpload',
  'on_after_upload',
];

const allowed_local_options = [
  'path',
];

const allowed_s3_options = [
  'region',
  'accessKeyId',
  'access_key_id',
  'secretAccessKey',
  'secret_access_key',
  'bucket',
  'acl',
];

const validate_options = (uploader_options = {}) => {
  const errors = [];
  const option_names = Object.keys(uploader_options || {});

  for (let i = 0; i < option_names?.length; i += 1) {
  	const option_name = option_names[i];
  	if (!allowed_options.includes(option_name)) {
  		errors.push(`${option_name} is not an allowed uploader option.`);
  	}
  }

  if (uploader_options?.providers?.includes('local') && !uploader_options?.local) {
    errors.push(`If an uploader provider is 'local', local object must be specified in uploader_options with a storage path.`);
  }

  if (uploader_options?.providers?.includes('s3') && !uploader_options?.s3) {
    errors.push(`If an uploader provider is 's3', s3 object must be specified with configuration.`);
  }

  if (uploader_options?.provider?.includes('local') && uploader_options.local) {
  	const local_uploader_options = Object.keys(uploader_options?.local);
  	for (let i = 0; i < local_uploader_options?.length; i += 1) {
  		const local_uploader_option = local_uploader_options[i];
  		if (!allowed_local_options.includes(local_uploader_option)) {
        errors.push(`local.${local_uploader_option} is not an allowed uploader option.`);
      }
  	}
  }

  if (uploader_options?.provider?.includes('s3') && uploader_options.s3) {
  	const s3_uploader_options = Object.keys(uploader_options.s3 || {});

  	for (let i = 0; i < s3_uploader_options?.length; i += 1) {
  		const s3_uploader_option = s3_uploader_options[i];
  		if (!allowed_s3_options.includes(s3_uploader_option)) {
        errors.push(`local.${s3_uploader_option} is not an allowed uploader option.`);
      }
  	}
  }

  return errors;
};

export default validate_options;
