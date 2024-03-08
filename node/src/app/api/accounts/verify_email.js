import accounts from "../../accounts/index.js";

const verify_email = async (req = {}, res = {}) => {
  await accounts.verify_email({
    token: req?.query?.token,
  });

  res.redirect("/");
};

export default verify_email;
