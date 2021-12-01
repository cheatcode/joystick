import dayjs from "dayjs";
import generateId from "../../lib/generateId";

export default () => {
  return {
    token: generateId(64),
    tokenExpiresAt: dayjs().utc().add(30, "days").format(),
  };
};
