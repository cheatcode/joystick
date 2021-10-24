export default (message = "") => {
  throw new Error(`[joystick] ${message}`);
};
