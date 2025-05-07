import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import _ from 'lodash';

const { readFile } = fs.promises;

const upload_build_to_push = async (options = {}) => {
  const form_data = new FormData();

  form_data.append(
    "version_tar",
    await readFile(`.build/build.encrypted.tar.gz`),
    `${options?.build_timestamp}.tar.gz`
  );

  form_data.append("build_timestamp", options?.build_timestamp);
  form_data.append("domain", options?.deployment?.domain);
  form_data.append("deployment_id", options?.deployment?._id);
  form_data.append("settings", JSON.stringify(options?.settings));

  return fetch(`${options?.push_domain}/api/deploy`, {
   method: "POST",
   headers: {
     ...form_data.getHeaders(),
     "x-push-deployment-token": options?.deployment_token,
   },
   body: form_data,
  }).then(async (response) => {
  const text = await response.text();
	console.log(text); // TODO: Temporary for debugging.

   const data = await response.json();
   return data?.data;
  }).catch((error) => {
    console.warn(error);
  });
};

export default upload_build_to_push;