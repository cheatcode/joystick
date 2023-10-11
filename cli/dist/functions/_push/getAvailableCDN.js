import fetch from "node-fetch";
import _ from "lodash";
import domains from "./domains.js";
var getAvailableCDN_default = async () => {
  const results = (await Promise.allSettled(domains?.versions?.production?.map(async (mirror) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 2e3);
    const result = await fetch(`${mirror}/api/ping`, { signal: controller.signal }).catch((error) => {
      return { status: 503 };
    });
    return {
      mirror,
      status: result.status
    };
  })))?.map((result) => {
    return result.value;
  });
  const firstAvailable = _.orderBy(results, ["status", "mirror"])[0];
  return firstAvailable?.status === 200 ? firstAvailable?.mirror : null;
};
export {
  getAvailableCDN_default as default
};
