import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import _ from 'lodash';
import cdn_mirrors from './cdn_mirrors.js';

const { readFile } = fs.promises;

const get_first_available_mirror = async () => {
  const results = (await Promise.allSettled(cdn_mirrors?.map(async (mirror) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 2000);
    
    const result = await fetch(`${mirror}/api/ping`, { signal: controller.signal }).catch((error) => {
      return { status: 503 };
    });

    return {
      mirror,
      status: result.status,
    };
  })))?.map((result) => {
    return result.value;
  });

  return _.orderBy(results, ['status', 'mirror'])[0];
};

const upload_build_to_cdn = async (build_timestamp = '', deployment = {}, session_token = '') => {
  const first_available_mirror = await get_first_available_mirror();
  const form_data = new FormData();

  form_data.append(
    "version_tar",
    await readFile(`.build/build.encrypted.tar.gz`),
    `${build_timestamp}.tar.gz`
  );

  form_data.append("build_timestamp", build_timestamp);
  form_data.append("domain", deployment?.domain);
  form_data.append("deployment_id", deployment?._id);

  return fetch(`${first_available_mirror?.mirror}/api/versions`, {
   method: "POST",
   headers: {
     ...form_data.getHeaders(),
     "x-push-session-token": session_token,
   },
   body: form_data,
  }).then(async (response) => {
   const data = await response.json();
   return data?.data;
  }).catch((error) => {
    console.warn(error);
  });
};

export default upload_build_to_cdn;

