import dayjs from "dayjs";
import generateId from "../../lib/generateId";

if (process.env.NODE_ENV !== 'test') {
  // NOTE: Do this to avoid a snarl with the dayjs mock for tests.
  const utc = (await import('dayjs/plugin/utc'));
  dayjs.extend(utc.default);
}

export default () => {
  return {
    token: generateId(64),
    tokenExpiresAt: dayjs().utc().add(30, "days").format(),
  };
};
