
const debug = require('debug')('rabbitmq:connect');

/**
 * Connect to the Rabbitmq server.
 * @name Rabbitmq#close
 * @function
 * NOTE:
 */

async function close() {
  try {
    await this.conn.close();
    debug('closing connection');
  } catch (err) {
    debug(err.message);
  }
}

module.exports = close;
