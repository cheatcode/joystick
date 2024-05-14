import fs from 'fs';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import emit_websocket_event from "../websockets/emit_event.js";
import float_to_decimal_place from "../../lib/float_to_decimal_place.js";
import path_exists from "../../lib/path_exists.js";

const { mkdir, writeFile } = fs.promises;

const upload_to_s3 = async (upload = {}, upload_options = {}, on_upload_progress = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const s3_upload = new Upload({
        client: new S3Client({
          region: upload?.s3?.region,
          credentials:{
            accessKeyId: upload?.s3?.accessKeyId || upload?.s3?.access_key_id,
            secretAccessKey: upload?.s3?.secretAccessKey || upload?.s3?.secret_access_key,
          },
        }),
        params: {
          Bucket: upload?.s3?.bucket,
          Key: upload.file_name,
          Body: upload.content,
          ContentType: upload.mime_type,
        },
        queueSize: 4, // NOTE: How many parts to upload concurrently.
        partSize: 1024 * 1024 * 5, // NOTE: Size of each part (5MB).
      });

      let previous = 0;

      s3_upload.on("httpUploadProgress", (progress) => {
        on_upload_progress('s3', progress?.loaded - previous);
        previous = progress?.loaded;
      });

      const upload_result = await s3_upload.done();
      
      return resolve({
        id: upload_options?.req?.headers['x-joystick-upload-id'],
        provider: 's3',
        url: upload_result?.Location,
        size: upload?.fileSize,
        file_name: upload?.file_name,
        fileName: upload?.file_name,
        original_file_name: upload?.original_file_name,
        originalFileName: upload?.original_file_name,
        mime_type: upload?.mime_type,
        mimeType: upload?.mime_type,
      });
    } catch (error) {
      reject(error?.message || 'There was an error uploading your file to Amazon S3. Check the server logs for more information.');
    }
  });
};

const upload_to_local = async (upload = {}, upload_options = {}) => {
  if (upload?.local?.path) {
  	return new Promise(async (resolve, reject) => {
	    try {
        if (!(await path_exists(upload?.local?.path))) {
          await mkdir(upload?.local?.path, { recursive: true });
        }

        const directory_path = path.dirname(`${upload?.local?.path}/${upload?.file_name}`);
        
        if (!fs.existsSync(directory_path)) {
          fs.mkdirSync(directory_path, { recursive: true });
        }

        const file_path = `${upload?.local?.path}/${upload?.file_name}` || `_uploads/${upload?.file_name}`;

        await writeFile(file_path, upload.content);

        resolve({
          id: upload_options?.req?.headers['x-joystick-upload-id'],
          provider: 'local',
          url: file_path,
          size: upload?.file_size,
          file_name: upload?.file_name,
          fileName: upload?.file_name,
          original_file_name: upload?.original_file_name,
          originalFileName: upload?.original_file_name,
          mime_type: upload?.mime_type,
          mimeType: upload?.mime_type,
        });
      } catch(error) {
        reject(error);
      }
  	});
  }
};

const run_upload = async (run_upload_options = {}) => {
  const uploads = [];
  let existing_upload_progress = run_upload_options?.existing_upload_progress;

  // NOTE: Use a closure here so we can pass it into the provider uploaders and avoid the
  // existing_upload_progress value being cached (leading to incorrect progress percentage).
  const on_upload_progress = (provider = '', chunk = 0) => {
    const progress = existing_upload_progress + chunk;
    const percentage = float_to_decimal_place(((progress / run_upload_options?.total_upload_size_all_providers) * 100), 0);

    emit_websocket_event(
    	`uploaders_${run_upload_options?.req?.headers['x-joystick-upload-id']}`,
    	'progress',
      { provider, progress: percentage }
    );

    existing_upload_progress += chunk;
  };

  for (let i = 0; i < run_upload_options?.uploads?.length; i += 1) {
    const upload = run_upload_options?.uploads[i];

    if (upload?.providers?.includes('local')) {
      // NOTE: Do not pass existing_upload_progress or onProgress to upload_to_local as the existing total reflects
      // the transfer from the browser to the server (we assume that value is 1:1 with writing to disk
      // as the disk write is near-instant).
      const result = await upload_to_local(upload, run_upload_options);

      uploads.push(result);
    }

    if (upload?.providers?.includes('s3')) {
      const result = await upload_to_s3(upload, run_upload_options, on_upload_progress);
      uploads.push(result);
    }
  }

  return uploads;
};

export default run_upload;
