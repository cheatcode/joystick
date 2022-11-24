import dayjs from "dayjs";
import generateId from "../../lib/generateId";
if (process.env.NODE_ENV !== "test") {
  const utc = await import("dayjs/plugin/utc");
  dayjs.extend(utc.default);
}
var generateSession_default = () => {
  return {
    token: generateId(64),
    tokenExpiresAt: dayjs().utc().add(30, "days").format()
  };
};
export {
  generateSession_default as default
};
