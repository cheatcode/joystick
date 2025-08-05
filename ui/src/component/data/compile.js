import api from '../../api/index.js';
import generate_id from "../../lib/generate_id.js";
import track_function_call from "../../test/track_function_call.js";
import run_tree_job from '../../tree/jobs/run.js';

const compile = (data_from_window = {}, request_from_window = {}, component_instance = {}) => {
  return {
    ...data_from_window,
    refetch: async (input = {}) => {
      track_function_call(`ui.${component_instance?.options?.test?.name || generate_id()}.data.refetch`, [
        input
      ]);
      
      const data = await component_instance.fetch_data(
        api,
        request_from_window,
        input,
        component_instance,
      );

      component_instance.data = compile(data, request_from_window, component_instance);

      // NOTE: Make this conditional to avoid errors when refetching data in tests.
      if (window.__joystick_data__[component_instance?.id]) {
        // NOTE: Keep data on window up to date so if a parent re-renders a child that's refetched it's data since
        // mount, the data rendered isn't stale.
        window.__joystick_data__[component_instance?.id] = data;
      }

      if (!window?.__joystick_test__) {
        component_instance.queue_rerender({
          after_refetch_data_rerender: () => {
            run_tree_job('lifecycle.onRefetchData', { root_instance_id: component_instance?.instance_id });
          },
        });
      }

      return component_instance.data;
    },
  };
}

export default compile;
