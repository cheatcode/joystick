import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isUndefined, isNull } from "../../../lib/types";

export default (defaultPropsFromOptions = {}, propsFromOptions = {}) => {
  try {
    // NOTE: Combine props and defaultProps key names and filter to uniques only.
    const props = [...Object.keys(propsFromOptions), ...Object.keys(defaultPropsFromOptions)]
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

    return props.reduce((compiledProps, propName) => {
      const prop = propsFromOptions[propName];
      const propDefault = defaultPropsFromOptions[propName] || null;
      const propHasValue = !isUndefined(prop) && !isNull(prop);

      compiledProps[propName] = propHasValue ? prop : propDefault;

      return compiledProps;
    }, {});
  } catch (exception) {
    throwFrameworkError('component.props.compile', exception);
  }
};
