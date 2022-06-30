import api from '../../../api';
import throwFrameworkError from "../../../lib/throwFrameworkError";
import fetchData from './fetch';

const compileData = (dataFromWindow = {}, requestFromWindow = {}, componentInstance = {}) => {
  try {
    return {
      ...dataFromWindow,
      refetch: async (input = {}) => {
        const data = await fetchData(
          api,
          requestFromWindow,
          input,
          componentInstance,
        );

        componentInstance.data = compileData(data, requestFromWindow, componentInstance);

        // NOTE: Keep data on window up to date so if a parent re-renders a child that's refetched it's data since
        // mount, the data rendered isn't stale.
        window.__joystick_data__[componentInstance?.ssrId] = data;
        
        // TODO: Tenative.
        componentInstance.queueRender();

        return data;
      },
    };
  } catch (exception) {
    throwFrameworkError('component.data.compile', exception);
  }
}

export default compileData;
