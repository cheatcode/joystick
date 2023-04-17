import generateId from "../../../lib/generateId";
import findComponentDataFromSSR from '../data/findComponentDataFromSSR';
import validateForm from '../../../forms/validate';
import throwFrameworkError from "../../../lib/throwFrameworkError";
import compileProps from "../props/compile";
import compileCSS from '../css/compile';
import compileState from '../state/compile';
import compileLifecycle from '../lifecycle/compile';
import compileMethods from "../methods/compile";
import compileUrl from "../url/compile";
import windowIsUndefined from "../../../lib/windowIsUndefined";
import { isFunction, isObject } from "../../../lib/types";
import websocketClient from "../../../websockets/client";

export default (componentInstance = {}, componentOptions = {}) => {
  try {
    componentInstance.options = componentOptions || {};
    componentInstance.id = componentOptions?._componentId || null;
    componentInstance.instanceId = generateId(8);
    componentInstance.ssrId = componentOptions?._ssrId || null;
    componentInstance.css = compileCSS();
    componentInstance.data = findComponentDataFromSSR(componentOptions?.dataFromSSR, componentOptions?._componentId);
    componentInstance.defaultProps = componentOptions?.defaultProps || {};
    componentInstance.props = compileProps(componentOptions?.defaultProps, componentOptions?.props);
    componentInstance.state = compileState(componentInstance, componentOptions?.state);
    componentInstance.events = componentOptions?.events || {};
    componentInstance.lifecycle = compileLifecycle(componentInstance, componentOptions?.lifecycle);
    componentInstance.methods = compileMethods(componentInstance, componentOptions?.methods);
    componentInstance.wrapper = componentOptions?.wrapper || {};

    componentInstance.translations = componentOptions?.translations || {};
    componentInstance.validateForm = validateForm;

    componentInstance.DOMNode = null; // NOTE: Set after component is mounted to DOM.
    componentInstance.dom = {};
    componentInstance.dom.virtual = {};
    componentInstance.dom.actual = {};

    const windowExists = !windowIsUndefined();

    if (!windowExists) {
      componentInstance.url = compileUrl(componentOptions?.url);
    }

    if (windowExists && window.__joystick_url__) {
      componentInstance.url = compileUrl(window.__joystick_url__);
    }

    if (windowExists && componentOptions?.websockets && isFunction(componentOptions?.websockets)) {
      // TODO: For each websocket entry, try to establish a connect and assign it back to the websockets object on the component instance.
      const compiledWebsocketOption = componentOptions.websockets(componentInstance);
      const websocketDefinitions = isObject(compiledWebsocketOption) && Object.entries(compiledWebsocketOption);

      for (let i = 0; i < websocketDefinitions?.length; i += 1) {
        const [websocketName, websocketDefinition] = websocketDefinitions[i];

        websocketClient({
          url: `${window?.process?.env.NODE_ENV === 'development' ? 'ws' : 'wss'}://${location.host}/api/_websockets/${websocketName}`,
          options: websocketDefinition?.options || {},
          query: websocketDefinition?.query || {},
          events: websocketDefinition?.events || {},
        }, (websocketConnection = {}) => {
          componentInstance.websockets = {
            ...(componentInstance.websockets || {}),
            [websocketName]: websocketConnection,
          }
        });
      }
    }
  } catch (exception) {
    throwFrameworkError('component.registerOptions', exception);
  };
}