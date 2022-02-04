import systemInformation from "systeminformation";
var getSerialNumber_default = () => {
  return new Promise((resolve) => {
    systemInformation.system((info = {}) => {
      resolve(Buffer.from(info?.uuid).toString("base64"));
    });
  });
};
export {
  getSerialNumber_default as default
};
