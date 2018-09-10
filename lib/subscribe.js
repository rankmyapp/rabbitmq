
const { unionWith, eqBy, prop } = require('ramda');
const debug = require('debug')('rabbitmq:publish');
const buildData = require('../utils/build-data');
/**
 * Start channel to receive message'
 * @name Rabbitmq#subscribe
 * @function
 * @param {Object} opts object config for create subscribe
 * @param {Object} debug object list field to debug data received on subscribe
 */
async function subscribe(opts) {
  try {
    this.subscribes = unionWith(eqBy(prop('channel')), [opts], this.subscribes);
    const ch = await this.conn.createChannel();
    await ch.assertExchange(opts.channel, 'fanout', { durable: false });
    const q = await ch.assertQueue('', { exclusive: true });
    await ch.bindQueue(q.queue, opts.channel, '');
    const consumer = async (data) => {
      debug('[x] Received messsage in channel "%s"', opts.channel);
      await opts.consume(buildData(data));
    };
    ch.consume(q.queue, consumer, { noAck: false });
    debug('[] Waiting messsage in channel "%s"', opts.channel);
  } catch (err) {
    debug(err.message);
  }
}

module.exports = subscribe;
