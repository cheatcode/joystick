// src/app/middleware/hmr/client.js
var assignPreviousComponentIdsToElements = () => {
  const joystickDOMNodes = Array.from(document.querySelectorAll("[js-c]"));
  console.log(joystickDOMNodes);
  for (let i = 0; i < joystickDOMNodes?.length; i += 1) {
    const node = joystickDOMNodes[i];
    if (node) {
      node.setAttribute("js-pid", node.getAttribute("js-c"));
    }
  }
};
var reconnectInterval = null;
var reconnectAttempts = 0;
var websocketClient = (options = {}, onConnect = null) => {
  let client = new WebSocket(`ws://localhost:${window.__joystick__hmr_port}/_joystick/hmr`);
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
  const connection = {
    client,
    send: (message = {}) => {
      if (options.queryParams) {
        message = { ...message, ...options.queryParams };
      }
      return client.send(JSON.stringify(message));
    }
  };
  client.addEventListener("open", () => {
    console.log(`[hmr] Listening for changes...`);
    reconnectAttempts = 0;
    if (onConnect)
      onConnect(connection);
  });
  client.addEventListener("message", (event) => {
    if (event?.data && options.onMessage) {
      options.onMessage(JSON.parse(event.data));
    }
  });
  client.addEventListener("close", () => {
    console.log(`[hmr] Disconnected from server`);
    client = null;
    if (options.autoReconnect && !reconnectInterval) {
      reconnectInterval = setInterval(() => {
        client = null;
        if (reconnectAttempts < 12) {
          websocketClient(options, onConnect);
          console.log(`[hmr] Attempting to reconnect (${reconnectAttempts + 1}/12)...`);
          reconnectAttempts += 1;
        } else {
          console.log(`[hmr] Reconnection attempts exhausted. Server is unavailable.`);
          clearInterval(reconnectInterval);
        }
      }, 5e3);
    }
  });
  return connection;
};
var client_default = (() => websocketClient({
  autoReconnect: true,
  onMessage: (message = {}) => {
    assignPreviousComponentIdsToElements();
    const isFileChange = message && message.type && message.type === "FILE_CHANGE";
    const isPageInLayout = !!window.__joystick_layout_page__;
    if (isFileChange && isPageInLayout) {
      (async () => {
        window.__joystick_childrenBeforeHMRUpdate__ = window.joystick?._internal?.tree?.instance?.children;
        const layoutComponentFile = await import(`${window.__joystick_layout__}?t=${new Date().getTime()}`);
        const pageComponentFile = await import(`${window.window.__joystick_layout_page_url__}?t=${new Date().getTime()}`);
        const layout = layoutComponentFile.default;
        const page = pageComponentFile.default;
        window.joystick.mount(layout, Object.assign({ page }, window.__joystick_ssr_props__), document.getElementById("app"), true);
      })();
    }
    if (isFileChange && !isPageInLayout) {
      (async () => {
        window.__joystick_childrenBeforeHMRUpdate__ = window.joystick?._internal?.tree?.instance?.children;
        const pageComponentFile = await import(`${window.__joystick_page_url__}?t=${new Date().getTime()}`);
        const page = pageComponentFile.default;
        window.joystick.mount(page, Object.assign({}, window.__joystick_ssr_props__), document.getElementById("app"), true);
      })();
    }
  }
}, (connection) => {
  const joystickScriptTags = [].map.call(document.querySelectorAll("script"), (scriptTag) => {
    return scriptTag && scriptTag.src;
  }).filter((scriptPath) => scriptPath.includes("/_joystick")).filter((scriptPath) => !scriptPath.includes("/hmr")).filter((scriptPath) => !scriptPath.includes("/_joystick/utils/process.js")).map((scriptPath) => {
    return scriptPath.replace(`${window.location.origin}/`, "").replace("_joystick/", "");
  });
  connection.send({
    type: "HMR_WATCHLIST",
    tags: joystickScriptTags
  });
}))();
export {
  client_default as default
};
