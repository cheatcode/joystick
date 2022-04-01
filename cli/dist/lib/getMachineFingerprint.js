import systemInformation from "systeminformation";
import os from "os";
var getMachineFingerprint_default = () => {
  return new Promise((resolve) => {
    systemInformation.system((info = {}) => {
      resolve({
        device: os.hostname(),
        uuid: Buffer.from(info?.uuid).toString("base64")
      });
    });
  });
};
export {
  getMachineFingerprint_default as default
};
