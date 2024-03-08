import accounts from "../../accounts/index.js";
import handle_api_error from "../handle_api_error.js";

const recover_password = async (req = {}, res = {}) => {
  try {
    await accounts.recover_password({
      email_address: req?.body?.emailAddress || req?.body?.email_address,
    });

    res.status(200).send(JSON.stringify({}));
  } catch(error) {
    handle_api_error('accounts.recover_password', error, res);
  }
};

export default recover_password;
