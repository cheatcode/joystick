let reconnect_interval = null;
let reconnect_attempts = 0;

const websocket_client = (options = {}, on_connect = null) => {
  let client = new WebSocket(
    `ws://localhost:${window.__joystick_hmr_port__}/_joystick/hmr?${new URLSearchParams(options.query).toString()}`
  );

  if (reconnect_interval) {
    clearInterval(reconnect_interval);
    reconnect_interval = null;
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
    reconnect_attempts = 0;
    if (on_connect) on_connect(connection);
  });

  client.addEventListener("message", (event) => {
    if (event?.data && options.onMessage) {
      options.onMessage(JSON.parse(event.data), connection);
    }
  });

  client.addEventListener("close", () => {
    console.log(`[hmr] Disconnected from server.`);

    client = null;

    if (options.autoReconnect && !reconnect_interval) {
      reconnect_interval = setInterval(() => {
        client = null;

        // NOTE: 12 attempts === try to reconnect for up to 1 minute (12 * 5 seconds between each attempt).
        if (reconnect_attempts < 12) {
          websocket_client(options, on_connect);

          console.log(
            `[hmr] Attempting to reconnect (${reconnect_attempts + 1}/12)...`
          );

          reconnect_attempts += 1;
        } else {
          console.log(
            `[hmr] Reconnection attempts exhausted. Server is unavailable.`
          );
          clearInterval(reconnect_interval);
        }
      }, 5000);
    }
  });

  return connection;
};

const remount_standalone_page = async () => {
	const page_component_file = await import_page_component();

	window.joystick.mount(
	  page_component_file,
	  Object.assign({}, window.__joystick_ssr_props__),
	  document.getElementById("app")
	);
};

const import_page_component = async () => {
	const page_component_file = await import(`${window.__joystick_page_url__}?v=${new Date().getTime()}`).catch((error) => {
	  // NOTE: If this fails, the file was likely deleted or renamed. Trigger a full reload
	  // so the developer is aware.
	  location.reload();
	});

	return page_component_file?.default;
};

const import_layout_component = async () => {
	const layout_component_file = await import(`${window.__joystick_layout_url__}?v=${new Date().getTime()}`).catch((error) => {
	  // NOTE: If this fails, the file was likely deleted or renamed. Trigger a full reload
	  // so the developer is aware.
	  location.reload();
	});

	return layout_component_file?.default;
};

const remount_page_in_layout = async () => {
	const layout_component_file = await import_layout_component();
	const page_component_file = await import_page_component();

	window.joystick.mount(
	  layout_component_file,
	  Object.assign({ page: page_component_file }, window.__joystick_ssr_props__),
	  document.getElementById("app")
	);
};

const update_index_css = (joystick_index_css) => {
	const updated_css = document.createElement("link");

	updated_css.setAttribute("rel", "stylesheet");
	updated_css.setAttribute("href", `/_joystick/index.css`);

	document.head.replaceChild(updated_css, joystick_index_css);
};

const update_index_client_js = (joystick_index_client_js = {}) => {
  const updated_index_client_js = document.createElement("script");

  updated_index_client_js.setAttribute("type", "text/javascript");
  updated_index_client_js.setAttribute(
    "src",
    `/_joystick/index.client.js`
  );

  joystick_index_client_js.parentNode.replaceChild(updated_index_client_js, joystick_index_client_js);
};

const hmr_client = (() =>
  websocket_client({
    autoReconnect: true,
    query: {
      user_language: window?.__joystick_user__?.language || '',
      browser_language: navigator?.language || '',
      page_component_path: window.__joystick_page_url__?.replace('/_joystick/', ''),
    },
    onMessage: async (message = {}, websocket_client_connection = {}) => {
      const is_build_error = message && message.type && message.type === "BUILD_ERROR";

      if (is_build_error) {
        return location.reload();
      }

      // NOTE: Set this to disable the auto mount code in layouts/pages when
      // working in an HMR/development context.
      window.__joystick_hmr_update__ = true;
      window.__joystick_hmr_previous_tree__ = [...(window.joystick._internal.tree || [])];
      window.__joystick_hmr_previous_websockets__ = [...(window.joystick._internal.websockets || [])];

      const previous_window_position = Object.assign({}, { scrollTop: window.scrollY });

      const is_file_change = message && message.type && message.type === "FILE_CHANGE";
      const is_page_in_layout = !!window.__joystick_layout_url__ && !!window.__joystick_page_url__;
      const joystick_index_css = document.head.querySelector('link[href="/_joystick/index.css"]');
      const joystick_index_client_js = document.body.querySelector('script[src="/_joystick/index.client.js"]');

      console.log('MESSAGE', message);
      
      if (message?.index_html_changed) {
        location.reload();
      }

      if (message?.i18n) {
        window.__joystick_i18n__ = message?.i18n;
      }

      if (message?.settings) {
        window.__joystick_settings__ = message?.settings;
        window.joystick.settings = message?.settings;
      }

      if (joystick_index_client_js && message?.index_client_changed) {
      	update_index_client_js(joystick_index_client_js);
      }

      if (joystick_index_css && message?.index_css_changed) {
      	update_index_css(joystick_index_css);
      }

      if (is_file_change && is_page_in_layout) {
        remount_page_in_layout(websocket_client_connection);
      }

      if (is_file_change && !is_page_in_layout) {
        remount_standalone_page(websocket_client_connection);
      }

      // NOTE: Set scroll back to what it was before the HMR update.
      window.scrollTo(0, previous_window_position.scrollTop);

      if (websocket_client_connection.send) {
        websocket_client_connection.send({ type: "HMR_UPDATE_COMPLETE" });
      }
    },
  }))();

export default hmr_client;
