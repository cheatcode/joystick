import api from '../../../api';
import addToQueue from '../../../lib/addToQueue';
import throwFrameworkError from "../../../lib/throwFrameworkError";
import fetchData from './fetch';
import trackFunctionCall from "../../../test/trackFunctionCall.js";
import generateId from "../../../lib/generateId.js";

const compileData = (dataFromWindow = {}, requestFromWindow = {}, componentInstance = {}) => {
  try {
    return {
      ...dataFromWindow,
      refetch: async (input = {}) => {
        trackFunctionCall(`ui.${componentInstance?.options?.test?.name || generateId()}.data.refetch`, [
          input
        ]);
        
        const data = await fetchData(
          api,
          requestFromWindow,
          input,
          componentInstance,
        );

        componentInstance.data = compileData(data, requestFromWindow, componentInstance);

        // NOTE: Make this conditional to avoid errors when refetching data in tests.
        if (window.__joystick_data__[componentInstance?.id]) {
          // NOTE: Keep data on window up to date so if a parent re-renders a child that's refetched it's data since
          // mount, the data rendered isn't stale.
          window.__joystick_data__[componentInstance?.id] = data;
        }

        if (!window?.__joystick_test__) {
          componentInstance.render({
            afterRefetchDataRender: () => {
              if (componentInstance?.lifecycle?.onRefetchData) {
                componentInstance?.lifecycle?.onRefetchData(componentInstance);
              }
            },
          });
        }

        return componentInstance.data;
      },
    };
  } catch (exception) {
    throwFrameworkError('component.data.compile', exception);
  }
}

export default compileData;
