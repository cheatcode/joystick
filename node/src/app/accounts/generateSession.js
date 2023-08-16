import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import generateId from "../../lib/generateId";

dayjs.extend(utc);

export default () => {
  return {
    token: generateId(64),
    tokenExpiresAt: dayjs().utc().add(30, "days").format(),
  };
};
