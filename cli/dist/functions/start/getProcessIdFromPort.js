import condense from "selective-whitespace";
import netstats from "netstats";
const platform = process.platform;
function pushTo(target, item) {
  if (item !== "" && typeof item === "number" && item !== 0 && target.indexOf(item) === -1) {
    target.push(item);
  }
}
async function processNetStats(arr) {
  const pidindex = 1;
  let items = arr.slice(1);
  if (platform === "win32") {
    items = arr;
  }
  const pids = {
    all: [],
    tcp: [],
    udp: []
  };
  await Promise.all(items.map((item) => {
    const values = condense(item).split(" ");
    let pid = parseInt(values[pidindex], 10);
    if (platform === "win32") {
      pid = parseInt(values.pop(), 10);
    }
    if (values.length > 1) {
      if (values.indexOf("TCP") !== -1) {
        pushTo(pids.tcp, pid);
        pushTo(pids.all, pid);
      } else if (values.indexOf("UDP") !== -1) {
        pushTo(pids.udp, pid);
        pushTo(pids.all, pid);
      }
    }
    return Promise.resolve();
  }));
  return pids;
}
function getProcessIdFromPort(port) {
  if (typeof port !== "number") {
    throw new TypeError("Expected a port number");
  }
  return new Promise((resolve) => {
    netstats(port).then((stats) => {
      processNetStats(stats).then((ps) => {
        resolve(ps);
      });
    }).catch(() => {
      resolve({
        all: [],
        tcp: [],
        udp: []
      });
    });
  });
}
var getProcessIdFromPort_default = getProcessIdFromPort;
export {
  getProcessIdFromPort_default as default
};
