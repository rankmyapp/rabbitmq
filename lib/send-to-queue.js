const debug = require('debug')('rabbitmq:sendToQueue');
/**
 * Send message to queue'
 * @name Rabbitmq#sendToQueue
 * @function
 * @param {Object} opts object config for create queue
 * @param {Object} debug object list field to debug data received on queue
 */

async function sendToQueue(opts) {
  try {
    const { data, queue } = opts;
    const ch = await this.conn.createChannel();
    await ch.assertQueue(queue, { durable: true });
    await ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
    debug(" [x] Sent '%s' to queue", queue);
    ch.close();
  } catch (err) {
    debug('ERROR:', err.message);
  }
}

module.exports = sendToQueue;
