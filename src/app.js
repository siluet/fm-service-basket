require('dotenv').config();
const amqplib = require('amqplib');

/**
 * Require our modules
 */
const logger = require('./logger');
const routes = require('./routes');
const errorHandler = require('./error-handler');
const actions = require('./actions');

global.amqp = {
  connection: null,
  channel: null,
};

/**
 * Initialize & return RabbitMQ connection & channel
 *
 * @returns {{ connection, channel }}
 */
async function initAmqp() {
  let connection, channel;

  try {
    // connect to RabbitMQ
    connection = await amqplib.connect(process.env.RABBITMQ_URL);

    // create a channel
    channel = await connection.createChannel();

  } catch (err) {
    throw new Error(`Error occurred while initializing RabbitMQ! ${(err && err.message) ? err.message : ''}`);
  }

  // handle connection closed
  connection.on('close', (err) => {
    throw new Error(`RabbitMQ connection closed! ${(err && err.message) ? err.message : ''}`);
  });

  // handle errors
  connection.on('error', (err) => {
    throw new Error(`RabbitMQ connection error! ${(err && err.message) ? err.message : ''}`);
  });

  return { connection, channel };
}


/**
 * Consume RabbitMQ messages
 *
 * @param {string} messageHandler
 */
async function consume(messageHandler) {
  const queue = 'request-basket';

  global.amqp.channel.assertQueue(queue, {
    durable: false,
  });

  global.amqp.channel.prefetch(1);

  console.log(`[${new Date().toISOString()}] ${process.env.NAME} service awaiting requests. To exit press CTRL+C`);

  global.amqp.channel.consume(queue, async (msg) => {
    const resp = await messageHandler(msg);
    global.amqp.channel.sendToQueue(msg.properties.replyTo,
      Buffer.from(JSON.stringify(resp)), {
        correlationId: msg.properties.correlationId,
      });
    global.amqp.channel.ack(msg);
  });
}


/**
 * Clean up on exit
 */
const cleanUp = (code) => {
  console.log(`About to exit with code/signal: ${code}`);
  if (global.amqp && global.amqp.connection) {
    global.amqp.connection.close();
  }
};

// Call cleanup when app is closing
process.on('exit', cleanUp);

// Call cleanup on ctrl+c event
process.on('SIGINT', cleanUp);

process.on('unhandledRejection', errorHandler);
process.on('uncaughtException', errorHandler);


/**
 * Create & return a request object.
 * 
 * @param {string} reqId 
 * @param {string} msg 
 * @param {object | null} params 
 * @returns {{ id, params }}
 */
const requestFactory = (reqId, msg, params = null) => {
  return { 
    id: reqId,
    msg,
    route: null,
    params,
  };
};


async function messageHandlerConsole(msg) {  
  const objMsg = JSON.parse(msg.content.toString());
  const reqId = objMsg.id || null;

  console.log(`[${new Date().toISOString()}] ${msg.fields.routingKey}: ${msg.content.toString()}`);
  return routes.callAction(objMsg.action, requestFactory(reqId, objMsg.action, objMsg.params ? objMsg.params : {}), ({ key, request }) => {
    logger.trace(request.route, 'start', request.id);
  });
}


(async () => {
  // init RabbitMQ
  global.amqp = await initAmqp();

  // register all actions
  routes.init(actions);

  // listen for messages
  consume(messageHandlerConsole);

})();




// const basketRepo = require('./basket-repo');

// const basketProducts = basketRepo.getAll(1);
// console.log('basketProducts');
// console.log(basketProducts);
// console.log(JSON.stringify(basketProducts));


// basketRepo.add(1, 3);
// basketRepo.add(1, 5);
// basketRepo.add(1, 2);
// basketRepo.add(1, 3);
// basketRepo.add(1, 3);
// basketRepo.remove(1, 3);
// basketRepo.remove(1, 3);
// basketRepo.remove(1, 3);
// basketRepo.remove(1, 3);

// const basketProducts2 = basketRepo.getAll(1);
// console.log('basketProducts2');
// console.log(basketProducts2);
// console.log(JSON.stringify(basketProducts2));
