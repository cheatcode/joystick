import requiredOptions from './requiredOptions';
import throwFrameworkError from '../../lib/throwFrameworkError';

export default (options = {}) => {
  try {
    return requiredOptions.every((requiredOption) => Object.keys(options).includes(requiredOption));
  } catch (exception) {
    throwFrameworkError('component.hasAllRequiredOptions', exception);
  }
}