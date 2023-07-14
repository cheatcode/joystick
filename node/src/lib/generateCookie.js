import dayjs from "dayjs";

export default (tokenExpiresAt = null) => {
  const cookie = {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
  };
  
  if (tokenExpiresAt) {
    cookie.expires = dayjs(tokenExpiresAt).toDate();
  }
  
  return cookie;
};
