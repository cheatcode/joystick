import node from "@joystick.js/node";
import api from "./api";

node.app({
  api,
  routes: {
    "/": (req, res) => {
      res.render("ui/pages/index");
    },
    "*": (req, res) => {
      res.render("ui/pages/error/index.js", {
        layout: "ui/layouts/app/index.js",
        props: {
          statusCode: 404,
        },
      });
    },
  },
});
