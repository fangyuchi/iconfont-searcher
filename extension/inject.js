
function invokeContentScript(eventName, data, target = '*') {
  window.postMessage({ eventName, data }, target);
}
