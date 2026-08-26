const nativeSetInterval = window.setInterval.bind(window);

window.setInterval = (handler, timeout, ...args) =>
  nativeSetInterval(handler, timeout === 60_000 ? 30 * 60_000 : timeout, ...args);

try {
  await import("/app.js");
} finally {
  window.setInterval = nativeSetInterval;
}
