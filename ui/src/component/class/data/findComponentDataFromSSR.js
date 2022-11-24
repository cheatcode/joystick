import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isArray } from "../../../lib/types";

export default (dataFromSSR = [], componentId = '') => {
  try {
    const dataForSSRId = isArray(dataFromSSR) && dataFromSSR.find((data) => {
      return data?.componentId === componentId;
    });
    
    return dataForSSRId?.data || {};
  } catch (exception) {
    throwFrameworkError('findComponentDataFromSSR', exception);
  }
};