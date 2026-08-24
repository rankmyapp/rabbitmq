
const debug = require('debug')('rabbitmq:publish');
/**
 * Send messate to channel'
 * @name Rabbitmq#publish
 * @function
 * @param {Object} opts object config for create subscrive
 * @param {Object} debug object config for create subscrive
 */

async function publish(opts) {
  try {
    const { data, channel } = opts;
    const ch = this.conn.createChannel({
      setup: chan => chan.assertExchange(channel, 'fanout', { durable: false }),
    });
    await ch.publish(channel, '', Buffer.from(JSON.stringify(data)));
    await ch.close();
    debug('Sent message to channel "%s"', channel);
  } catch (err) {
    debug(err.message);
  }
}

module.exports = publish;
