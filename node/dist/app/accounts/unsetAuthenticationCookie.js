!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("dayjs")):"function"==typeof define&&define.amd?define(["dayjs"],t):(e="undefined"!=typeof globalThis?globalThis:e||self)["joystick-node"]=t(e.dayjs)}(this,(function(e){"use strict";function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var o=t(e);return(e=null)=>e?(e.cookie("joystickLoginToken",null,{secure:"development"!==process.env.NODE_ENV,httpOnly:!0,expires:o.default().toDate()}),e.cookie("joystickLoginTokenExpiresAt",null,{secure:"development"!==process.env.NODE_ENV,httpOnly:!0,expires:o.default().toDate()}),e):null}));
