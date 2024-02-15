
const { unionWith, eqBy, prop } = require('ramda');
const debug = require('debug')('rabbitmq:queue');
const buildData = require('../utils/build-data');

/**
 * Send messate to channel'
 * @name Rabbitmq#makeConsumerContext
 * @function
 * @param {Object} opts object config for create subscrive
 * @param {object} originalMessage is a buffer message received from rabbitmq
 * @param {Object} ch is current rabbitmq channel
 */
function makeConsumerContext(opts, originalMessage, ch) {
  const noAck = opts.noAck !== undefined || opts.noAck !== null ? opts.noAck : true;

  const requeue = function() {
    ch.nack(originalMessage)
  }

  const confirm = function() {
    ch.ack(originalMessage)
  }

  if (noAck) {
    return {
      ch,
      originalMessage,
    }    
  }

  return {
    ch,
    originalMessage: data,
    requeue,
    confirm
  }
}

/**
 * Send messate to channel'
 * @name Rabbitmq#publish
 * @function
 * @param {Object} opts object config for create subscrive
 * @param {Array} debug object config for create subscrive
 */
async function queue(opts) {
  try {
    const noAck = opts.noAck !== undefined || opts.noAck !== null ? opts.noAck : true;

    // this.checkConnection();
    this.queues = unionWith(eqBy(prop('queue')), [opts], this.queues);
    const prefetch = opts.prefetch || 1;
    const ch = await this.conn.createChannel();

    await ch.assertQueue(opts.queue, { durable: true, 'x-queue-mode': 'lazy' });
    ch.prefetch(prefetch);

    const consumer = async (data) => {
      const parsedData = buildData(data);
      debug('[x] Received message');
      await opts.consumer(parsedData, makeConsumerContext(opts, data, ch));
    };
    await ch.consume(opts.queue, consumer, { noAck });
    debug(' [*] Waiting for messages in %s. To exit press CTRL+C', opts.queue);
  } catch (err) {
    debug('ERROR QUEUE:', err.message);
  }
}

module.exports = queue;
