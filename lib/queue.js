
const { unionWith, eqBy, prop } = require('ramda');
const debug = require('debug')('rabbitmq:queue');
const buildData = require('../utils/build-data');
/**
 * Send messate to channel'
 * @name Rabbitmq#publish
 * @function
 * @param {Object} opts object config for create subscrive
 * @param {Array} debug object config for create subscrive
 */
async function queue(opts) {
  try {
    // this.checkConnection();
    this.queues = unionWith(eqBy(prop('queue')), [opts], this.queues);
    const prefetch = opts.prefetch || 1;

    const consumer = async (data) => {
      const parsedData = buildData(data);
      debug('[x] Received message');
      await opts.consumer(parsedData);
    };

    // `setup` re-runs on every reconnect, so the queue/prefetch keep
    // getting re-asserted automatically if the broker connection drops.
    const ch = this.conn.createChannel({
      setup: async (chan) => {
        await chan.assertQueue(opts.queue, { durable: true, 'x-queue-mode': 'lazy' });
        await chan.prefetch(prefetch);
      },
    });
    await ch.consume(opts.queue, consumer, { noAck: true });
    debug(' [*] Waiting for messages in %s. To exit press CTRL+C', opts.queue);
  } catch (err) {
    debug('ERROR QUEUE:', err.message);
  }
}

module.exports = queue;
