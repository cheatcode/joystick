const assignPreviousComponentIdsToElements = () => {
  const joystickDOMNodes = Array.from(document.querySelectorAll('[js-c]'));
  console.log(joystickDOMNodes);
  for (let i = 0; i < joystickDOMNodes?.length; i += 1) {
    const node = joystickDOMNodes[i];

    if (node) {
      node.setAttribute('js-pid', node.getAttribute('js-c'));
    }
  }
};

const serverAvailable = (callback = null) => {
  fetch(`${window.location.origin}/_joystick/heartbeat`)
    .then(async (response) => {
      const data = await response.text();
      if (data && data === "<3" && callback) {
        // console.clear();
        console.log("[hmr] Listening for changes...");

        setTimeout(() => {
          callback();
        }, 1000);
      }
    })
    .catch(async (error) => {
      console.log("Server unavailable. Trying again...");

      setTimeout(() => {
        serverAvailable(callback);
      }, 500);
    });
};

const cleanup = () => {
  if (typeof window !== "undefined" && window.__joystick__) {
    const eventListeners =
      window.__joystick__?._internal?.eventListeners?.attached;
    const timers = window.__joystick__?._internal?.timers;

    if (eventListeners && eventListeners.length > 0) {
      window.__joystick__?._utils?.removeEventListeners(eventListeners);
    }

    if (timers && timers.length > 0) {
      timers.forEach(({ type, id }) => {
        if (type === "timeout") {
          window.clearTimeout(id);
        }

        if (type === "interval") {
          window.clearInterval(id);
        }
      });
    }
  }
};

let reconnectInterval = null;
let reconnectAttempts = 0;

const websocketClient = (options = {}, onConnect = null) => {
  let client = new WebSocket(
    `ws://localhost:${window.__joystick__hmr_port}/_joystick/hmr`
  );

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
    },
  };

  client.addEventListener("open", () => {
    console.log(`[hmr] Listening for changes...`);
    reconnectAttempts = 0;
    if (onConnect) onConnect(connection);
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

        // NOTE: 12 attempts === try to reconnect for up to 1 minute (12 * 5 seconds between each attempt).
        if (reconnectAttempts < 12) {
          websocketClient(options, onConnect);

          console.log(
            `[hmr] Attempting to reconnect (${reconnectAttempts + 1}/12)...`
          );

          reconnectAttempts += 1;
        } else {
          console.log(
            `[hmr] Reconnection attempts exhausted. Server is unavailable.`
          );
          clearInterval(reconnectInterval);
        }
      }, 5000);
    }
  });

  return connection;
};

export default (() =>
  websocketClient(
    {
      autoReconnect: true,
      onMessage: (message = {}) => {
        // NOTE: Do this so we have a mappable reference back to the previous component IDs
        // before we re-mount.
        assignPreviousComponentIdsToElements();

        const isFileChange = message && message.type && message.type === "FILE_CHANGE";
        const isPageInLayout = !!window.__joystick_layout_page__;

        /*
          TODO:

          - state tree (child tree doesn't work because component IDs change).
            - Before and hmr update, get all elements with a js-c ID and generate an HMR ID.
            - Use that HMR ID to create the state tree map.
            - When "restoring" after update, find the new js-c ID on the element and replace
              the HMR ID in the corresponding slot with that ID.

          I think best path for this stuff is to have a watcher in the HMR server that pings on
          these specific files. That way we can selectively decide whether to reload or hot patch.

          - index.css
          - index.html
          - settings
          - index.client.js (eval?)
          - node modules?
        */

        if (isFileChange && isPageInLayout) {
          (async () => {
            // NOTE: Import the layout and page file from the server. This works because we delay restarting the
            // server in the CLI until the HMR update event has been sent to trigger this.
            window.__joystick_childrenBeforeHMRUpdate__ = window.joystick?._internal?.tree?.instance?.children;

            const layoutComponentFile = await import(`${window.__joystick_layout__}?t=${new Date().getTime()}`);
            const pageComponentFile = await import(`${window.window.__joystick_layout_page_url__}?t=${new Date().getTime()}`);
            const layout = layoutComponentFile.default;
            const page = pageComponentFile.default;

            window.joystick.mount(
              layout,
              Object.assign({ page }, window.__joystick_ssr_props__),
              document.getElementById('app'),
              true,
            );
          })();
        }

        if (isFileChange && !isPageInLayout) {
          (async () => {
            // NOTE: Import the page file from the server. This works because we delay restarting the
            // server in the CLI until the HMR update event has been sent to trigger this.
            window.__joystick_childrenBeforeHMRUpdate__ = window.joystick?._internal?.tree?.instance?.children;

            const pageComponentFile = await import(`${window.__joystick_page_url__}?t=${new Date().getTime()}`);
            const page = pageComponentFile.default;

            window.joystick.mount(
              page,
              Object.assign({}, window.__joystick_ssr_props__),
              document.getElementById('app'),
              true,
            );
          })();
        }

          // const path = message?.path;
          // const scriptPath = `/_joystick/${path}`;
          // const script = document.querySelector(`script[src="${scriptPath}"]`);
          // const isCSS = scriptPath.includes("index.css");
          // const isHTML = scriptPath.includes("index.html");
          // const isSettings = scriptPath.includes("settings.");
          // const stylesheet = isCSS
          //   ? document.querySelector(`link[href="${scriptPath}"]`)
          //   : null;

          // if (isHTML || isSettings) {
          //   location.reload();
          // }

          // if (stylesheet) {
          //   serverAvailable(() => {
          //     const newStylesheet = document.createElement("link");
          //     newStylesheet.rel = "stylesheet";
          //     newStylesheet.href = scriptPath;
          //     stylesheet.parentNode.removeChild(stylesheet);
          //     document.body.appendChild(newStylesheet);
          //   });
          // }

          // if (script && scriptPath.includes("ui/pages")) {
          //   cleanup();
          // }

          // if (script) {
          //   serverAvailable(() => {
          //     location.reload();
          //     // TODO: Figure out why type="module" is caching this even with max-age
          //     // header set on the server.
          //     // script.parentNode.removeChild(script);
          //     // const newScript = document.createElement("script");
          //     // newScript.type = "module";
          //     // newScript.src = scriptPath;
          //     // document.body.appendChild(newScript);
          //   });
          // }

          // if (window.__joystick_layout__ && path && path.includes("pages")) {
          //   serverAvailable(() => {
          //     location.reload();
          //     // TODO: Figure out why type="module" is caching this even with max-age
          //     // header set on the server.
          //     // const layoutScript = document.querySelector(
          //     //   `script[src="${window.__joystick_layout__}"]`
          //     // );
          //     // layoutScript.parentNode.removeChild(layoutScript);
          //     // const newScript = document.createElement("script");
          //     // newScript.type = "module";
          //     // newScript.src = window.__joystick_layout__;
          //     // document.body.appendChild(newScript);
          //   });
          // }
        //}
      },
    },
    (connection) => {
      const joystickScriptTags = [].map
        .call(document.querySelectorAll("script"), (scriptTag) => {
          return scriptTag && scriptTag.src;
        })
        .filter((scriptPath) => scriptPath.includes("/_joystick"))
        .filter((scriptPath) => !scriptPath.includes("/hmr"))
        .filter(
          (scriptPath) => !scriptPath.includes("/_joystick/utils/process.js")
        )
        .map((scriptPath) => {
          return scriptPath
            .replace(`${window.location.origin}/`, "")
            .replace("_joystick/", "");
        });

      connection.send({
        type: "HMR_WATCHLIST",
        tags: joystickScriptTags,
      });
    }
  ))();
