import dayjs from "dayjs";
import generateId from "../../lib/generateId";
var generateSession_default = () => {
  return {
    token: generateId(64),
    tokenExpiresAt: dayjs().add(30, "days").format()
  };
};
export {
  generateSession_default as default
};
