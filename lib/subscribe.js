
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

    const consumer = async (data) => {
      debug('[x] Received messsage in channel "%s"', opts.channel);
      await opts.consume(buildData(data));
    };

    // `setup` re-runs on every reconnect. A fanout's exclusive queue dies
    // with the connection that created it, so binding + consuming has to
    // happen again here each time, not just once after the first connect.
    const ch = this.conn.createChannel({
      setup: async (chan) => {
        await chan.assertExchange(opts.channel, 'fanout', { durable: false });
        const q = await chan.assertQueue('', { exclusive: true });
        await chan.bindQueue(q.queue, opts.channel, '');
        await chan.consume(q.queue, consumer, { noAck: false });
      },
    });
    await ch.waitForConnect();
    debug('[] Waiting messsage in channel "%s"', opts.channel);
  } catch (err) {
    debug(err.message);
  }
}

module.exports = subscribe;
