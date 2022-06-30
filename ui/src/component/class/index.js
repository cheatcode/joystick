import validateOptions from "./validateOptions";
import registerOptions from "./registerOptions";

class Component {
  constructor(options = {}) {
    validateOptions(options);
    registerOptions(this, options);
    loadDataFromWindow(this);
  }
}

export default Component;
