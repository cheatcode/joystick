import generate_id from "../../lib/generate_id.js";

export default () => {
	const date = new Date();
	date.setDate(date.getDate() + 30);

  return {
    token: generate_id(64),
    token_expires_at: date,
  };
};
