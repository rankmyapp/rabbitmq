
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
    const ch = await this.conn.createChannel();
    await ch.assertExchange(channel, 'fanout', { durable: false });
    await ch.publish(channel, '', Buffer.from(JSON.stringify(data)));
    debug('Sent message to channel "%s"', channel);
    ch.close();
  } catch (err) {
    debug(err.message);
  }
}

module.exports = publish;
