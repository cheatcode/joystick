import dayjs from "dayjs";

export default (cookieName = '', res = {}) => {
  if (!cookieName || !res) return null;
  
  res.cookie(cookieName, null, {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
    expires: dayjs().toDate(),
  });
};
