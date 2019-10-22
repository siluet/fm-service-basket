module.exports = (() => {

  const levels = {
    fatal: 'fatal',
    error: 'error',
    warning: 'warning',
    info: 'info',
    debug: 'debug',
    trace: 'trace',
  };

  /**
   * Publish log message. Usage: logger.log(['moduleName', 'actionName'], 'logMessage', requestId))
   *
   * @TODO: Add fallback logging handler like file handler.
   * @TODO: Seperate this Writer/Publisher func to its own module and logger can accept writer/publisher as param.
   *
   * @param {string} appName
   * @param {string} level
   * @param {*} message
   */
  function publishMessage(appName, level, message) {
    const exchange = 'platform_logs';
    const key = `${appName}.${level}`;

    global.amqp.channel.assertExchange(exchange, 'topic', { durable: false });
    const opts = (level === levels.fatal || level === levels.error) ? {
      immediate: true, priority: 255,
    } : {};
    return global.amqp.channel.publish(exchange, key, Buffer.from(JSON.stringify(message)), opts);
  }

  function log(level, data) {
    const app = process.env.NAME || 'undefined';
    const message = {
      time: new Date().toISOString(),
      app,
      level,
      service: Array.isArray(data[0]) ? data[0].join('::') : data[0],
    };
    const [, logMsg = null, reqId = null] = data;

    // Add request Id if exists
    if (reqId) {
      message.id = reqId;
    }

    // Add log message if exists
    if (logMsg) {
      message.log = logMsg;
    }

    return publishMessage(app, level, message);
  }

  return {
    trace: (...data) => log(levels.trace, data),
    debug: (...data) => log(levels.debug, data),
    info: (...data) => log(levels.info, data),
    warning: (...data) => log(levels.warning, data),
    error: (...data) => log(levels.error, data),
    fatal: (...data) => log(levels.fatal, data),
  };

})();
