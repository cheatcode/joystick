import dayjs from "dayjs";

export default (tokenExpiresAt = null) => {
  return {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
    expires: dayjs(tokenExpiresAt).toDate(),
  };
};
