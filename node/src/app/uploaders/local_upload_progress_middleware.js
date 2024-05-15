import emit_websocket_event from "../websockets/emit_event.js";
import float_to_decimal_place from '../../lib/float_to_decimal_place.js';

const local_upload_progress_middleware = (providers = 1, req = {}, res = {}, next) => {
  let progress = 0;
  const file_size = parseInt(req.headers["content-length"], 10);

  req.on("data", (chunk) => {
    if (chunk.length > 0) {
      progress += chunk.length;
      const percentage = float_to_decimal_place((progress / (file_size * providers)) * 100, 2);
      emit_websocket_event(
        `uploaders_${req?.headers["x-joystick-upload-id"]}`,
        "progress",
        { provider: "local", progress: percentage }
      );
    }
  });

  next();
};

export default local_upload_progress_middleware;

