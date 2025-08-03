import add_node_to_tree from "../tree/add_node_to_tree.js";
import run_tree_job from '../tree/jobs/run.js';
import track_function_call from "../test/track_function_call.js";

const mount_to_target = (dom_node = {}, target = {}) => {
  target.replaceChildren();
  target.appendChild(dom_node);
};

const mount = (Component, props = {}, target = {}) => {
  track_function_call(`ui.mount`, [
    Component,
    props,
    target,
  ]);

  // NOTE: Dump the component tree on mount to account for remounting via HMR. This ensures we
  // don't keep old node references in the tree which can trip up renders matching on the
  // wrong/old element.
  run_tree_job('reset_tree_for_hmr');

  const component_instance = Component({ props });

  const dom = component_instance.render_for_mount();
  
  add_node_to_tree(component_instance);

  run_tree_job('lifecycle.onBeforeMount', { root_instance_id: component_instance?.instance_id });
  run_tree_job('lifecycle.onBeforeRender', { root_instance_id: component_instance?.instance_id });
  run_tree_job('css', { is_mount: true });

  mount_to_target(dom, target);

  run_tree_job('attach_event_listeners', { root_instance_id: component_instance?.instance_id });

  run_tree_job('lifecycle.onMount', { root_instance_id: component_instance?.instance_id });
  run_tree_job('lifecycle.onRender', { root_instance_id: component_instance?.instance_id });
  run_tree_job('lifecycle.timers', { root_instance_id: component_instance?.instance_id });

  window.addEventListener('beforeunload', () => {
    run_tree_job('lifecycle.onBeforeUnmount', { root_instance_id: component_instance?.instance_id });
  });

  return component_instance;
};

export default mount;
