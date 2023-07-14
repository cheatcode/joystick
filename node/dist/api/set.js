import fetch from "node-fetch";
import getOrigin from "./getOrigin";
var set_default = (setterName = "", setterOptions = {}) => {
  if (fetch) {
    return new Promise((resolve, reject) => {
      fetch(`${getOrigin()}/api/_setters/${setterName}`, {
        method: "POST",
        mode: "cors",
        headers: {
          ...setterOptions?.headers || {},
          "Content-Type": "application/json",
          "Cookie": `joystickSession=${setterOptions?.req?.context?.session?.id}`,
          "x-joystick-csrf": setterOptions?.req?.context?.session?.csrf
        },
        body: JSON.stringify(setterOptions),
        credentials: "include"
      }).then(async (response) => {
        const data = await response.json();
        if (data && data.errors) {
          console.log("%c\u274C set request failed with the following errors:", 'background-color: #ffcc00; padding: 7px; font-family: "inherit"; font-size: 11px; line-height: 10px; color: #000;');
          data.errors.forEach((error) => {
            console.log(error.message);
            if (error.stack) {
              console.log(error.stack);
            }
          });
          return reject(data);
        }
        resolve(data);
        return data;
      }).catch((error) => {
        console.log("%c\u274C set request failed with the following network error:", 'background-color: #ffcc00; padding: 7px; font-family: "inherit"; font-size: 11px; line-height: 10px; color: #000;');
        console.log(error);
        reject(error);
        return error;
      });
    });
  }
};
export {
  set_default as default
};
