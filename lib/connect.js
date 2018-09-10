const debug = require('debug')('rabbitmq:connect');
const amqp = require('amqplib');

/**
 * Connect to the Rabbitmq server.
 * @name Rabbitmq#connect
 * @function
 * @param {String} url Rabbitmq server URI
 * @param {Object} options options for connecting
 * NOTE:
 */

const retryConnect = async (self) => {
  debug('waiting to reconnect');
  setTimeout(() => {
    debug('[AMQP] reconnecting %s', self.attemptConnection);
    Object.assign(self, { attemptConnection: self.attemptConnection + 1 });
    if (self.attemptConnection > self.maxAttemptConnect) return;
    self.connect();
  }, self.timeoutToRetryConnect);
};

const reconnect = (self, error) => {
  const code = error.code || error.message.match(/\b([0-9]{2,})\b/g)[0];
  switch (code) {
    case '320':
      retryConnect(self);
      break;
    case '403':
      throw new Error('authentication failed');
    default:
      retryConnect(self);
      break;
  }
};

async function connect() {
  try {
    const cs = (this.username)
      ? `${this.protocol}://${this.username}:${this.password}@${this.host}:${this.port}`
      : `${this.protocol}://${this.host}:${this.port}`;
    this.conn = await amqp.connect(cs);
    // this.conn.on('error', (err) => { console.log('deu error:', err);/* reconnect(this); */ });
    this.conn.on('close', () => { reconnect(this); });
    debug('Connected to Rabbitmq by host "%s" and port "%s"', this.host, this.port);
    await this.whenConnected(this);
  } catch (err) {
    reconnect(this, err);
  }
}
module.exports = connect;
