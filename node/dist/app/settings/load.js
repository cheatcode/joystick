import o from"../../lib/is_valid_json.js";import r from"../../lib/parse_json.js";const s={config:{},global:{},public:{},private:{}},i=()=>{const t=!!process.env.JOYSTICK_SETTINGS,e=`${process.env.JOYSTICK_SETTINGS}`.replace(/\\/g,""),n=t&&o(e);return t?n?r(e)||s:(console.warn(`Could not parse settings. Please verify that your settings.${process.env.NODE_ENV}.json file exports a valid JSON object.`),s):s};var p=i;export{p as default};
