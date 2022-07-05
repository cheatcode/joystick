import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isArray } from "../../../lib/types";

export default (dataFromSSR = [], componentSSRId = '') => {
  try {
    const dataForSSRId = isArray(dataFromSSR) && dataFromSSR.find((data) => data?.ssrId === componentSSRId);
    return dataForSSRId?.data || {};
  } catch (exception) {
    throwFrameworkError('findComponentDataFromSSR', exception);
  }
};