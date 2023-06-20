// src/app/middleware/hmr/client.js
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
      options.onMessage(JSON.parse(event.data), connection);
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
  onMessage: async (message = {}, connection = {}) => {
    const previous = Object.assign({}, { scrollTop: window.scrollY });
    const isFileChange = message && message.type && message.type === "FILE_CHANGE";
    const isPageInLayout = !!window.__joystick_layout_page__;
    const CSS = document.head.querySelector('link[href="/_joystick/index.css"]');
    const clientIndex = document.body.querySelector('script[src^="/_joystick/index.client.js"]');
    if (message?.indexHTMLChanged) {
      location.reload();
    }
    if (message?.settings) {
      window.__joystick_settings__ = JSON.stringify(message?.settings);
      window.joystick.settings = message?.settings;
    }
    if (clientIndex) {
      clientIndex.parentNode.removeChild(clientIndex);
      const updatedClientIndex = document.createElement("script");
      updatedClientIndex.setAttribute("type", "text/javascript");
      updatedClientIndex.setAttribute("src", `/_joystick/index.client.js?v=${new Date().getTime()}`);
      document.body.appendChild(updatedClientIndex);
    }
    if (CSS) {
      const updatedCSS = document.createElement("link");
      updatedCSS.setAttribute("rel", "stylesheet");
      updatedCSS.setAttribute("href", "/_joystick/index.css");
      document.head.appendChild(updatedCSS);
    }
    if (isFileChange && isPageInLayout) {
      (async () => {
        window.__joystick_childrenBeforeHMRUpdate__ = window.joystick?._internal?.tree?.instance?.children;
        const layoutComponentFile = await import(`${window.__joystick_layout__}?t=${new Date().getTime()}`);
        const pageComponentFile = await import(`${window.window.__joystick_layout_page_url__}?t=${new Date().getTime()}`);
        const layout = layoutComponentFile.default;
        const page = pageComponentFile.default;
        window.joystick.mount(layout, Object.assign({ page }, window.__joystick_ssr_props__), document.getElementById("app"), true);
        if (connection.send) {
          connection.send({ type: "HMR_UPDATE_COMPLETE" });
        }
      })();
    }
    if (isFileChange && !isPageInLayout) {
      (async () => {
        window.__joystick_childrenBeforeHMRUpdate__ = window.joystick?._internal?.tree?.instance?.children;
        const pageComponentFile = await import(`${window.__joystick_page_url__}?t=${new Date().getTime()}`);
        const page = pageComponentFile.default;
        window.joystick.mount(page, Object.assign({}, window.__joystick_ssr_props__), document.getElementById("app"), true);
        if (connection.send) {
          connection.send({ type: "HMR_UPDATE_COMPLETE" });
        }
      })();
    }
    if (CSS) {
      setTimeout(() => {
        CSS.parentNode.removeChild(CSS);
      }, 1e3);
    }
    window.scrollTo(0, previous.scrollTop);
  }
}))();
export {
  client_default as default
};
