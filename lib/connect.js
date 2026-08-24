const debug = require('debug')('rabbitmq:connect');
const amqp = require('amqp-connection-manager');

// How long to wait for the *first* connect before giving up and letting the
// caller move on. amqp-connection-manager keeps retrying forever in the
// background regardless, so this only bounds how long `connect()` blocks.
const CONNECT_TIMEOUT_MS = 10000;

/**
 * Connect to the Rabbitmq server.
 * @name Rabbitmq#connect
 * @function
 * NOTE:
 */
async function connect() {
  const cs = (this.username)
    ? `${this.protocol}://${this.username}:${this.password}@${this.host}:${this.port}`
    : `${this.protocol}://${this.host}:${this.port}`;

  this.conn = amqp.connect([cs], {
    reconnectTimeInSeconds: this.timeoutToRetryConnect / 1000,
  });

  this.conn.on('connect', () => {
    debug('Connected to Rabbitmq by host "%s" and port "%s"', this.host, this.port);
  });

  this.conn.on('connectFailed', ({ err }) => {
    debug('[AMQP] connection attempt failed: %s', err && err.message);
  });

  this.conn.on('disconnect', ({ err }) => {
    debug('[AMQP] disconnected, reconnecting automatically: %s', err && err.message);
  });

  try {
    await this.conn.connect({ timeout: CONNECT_TIMEOUT_MS });
  } catch (err) {
    // Broker not reachable yet: amqp-connection-manager keeps retrying on
    // its own from here on, so we just log instead of crashing/hanging.
    debug('[AMQP] initial connect did not complete, retrying in background: %s', err.message);
  }
}

module.exports = connect;
