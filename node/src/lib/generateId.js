import crypto from "crypto-extra";

export default (length = 16) => crypto.randomString(length);
