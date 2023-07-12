import fetch from "node-fetch";
import _ from 'lodash';

const mirrors = [
  'https://push-versions-1.cheatcode.co',
  'https://push-versions-2.cheatcode.co',
  'https://push-versions-3.cheatcode.co',
  ];

export default async () => {
  const results = (await Promise.allSettled(mirrors?.map(async (mirror) => {
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

  const firstAvailable = _.orderBy(results, ['status', 'mirror'])[0];

  return firstAvailable?.status === 200 ? firstAvailable?.mirror : null;
};