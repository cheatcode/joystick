import joystick from "@joystick.js/node";
import api from "./api/index.js";

joystick.app({
  api,
  routes: {
    "/": (req = {}, res = {}) => {
      res.render("ui/pages/index/index.js", {
        layout: "ui/layouts/app/index.js",
      });
    },
    "*": (req = {}, res = {}) => {
      res.render("ui/pages/error/index.js", {
        layout: "ui/layouts/app/index.js",
        props: {
          status_code: 404,
        },
      });
    },
  },
});
