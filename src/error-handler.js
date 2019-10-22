const path = require('path');

const { fatal } = require('./logger');
const AppError = require('./app-error');


module.exports = async function (err) {
  let errorStack = '';
  const basePath = path.resolve(__dirname, '../');
  if (err.stack && err.stack !== '') {
    err.stack.split('\n').forEach((log, idx) => {
      if (!log.includes('node_modules')) {
        errorStack += ` ${log.replace(basePath, '').trim()}`;
      }
    });
  }

  let reqId = '';
  let service = ['', ''];
  if (err instanceof AppError) {
    reqId = err.request.id;
    service = err.request.route;
  }

  fatal(service, errorStack, reqId);

  setTimeout(() => {
    process.exit(1);
  }, 100);
};
