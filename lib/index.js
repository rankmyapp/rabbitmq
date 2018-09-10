function Rabbitmq(config = {}, options = {}) {
  if (typeof config === 'string') {
    const splitedConfig = config.split(/[\s,://,@]+/);

    this.protocol = splitedConfig[0];
    this.host = splitedConfig[splitedConfig.length - 2];
    this.port = splitedConfig[splitedConfig.length - 1];
    this.username = null;
    this.password = null;

    if (splitedConfig.length === 5) {
      this.username = splitedConfig[1];
      this.password = splitedConfig[2];
    }
  } else {
    this.host = config.host || '127.0.0.1';
    this.port = config.port || '5672';
    this.protocol = config.protocol || 'amqp';
    this.username = config.username;
    this.password = config.password;
  }

  this.maxAttemptConnect = options.maxAttemptConnect || 3;
  this.timeoutToRetryConnect = 3000;

  this.conn = null;
  this.attemptConnection = 0;
  this.subscribes = [];
  this.queues = [];
}

Rabbitmq.prototype.connect = require('./connect');
Rabbitmq.prototype.close = require('./close');
Rabbitmq.prototype.subscribe = require('./subscribe');
Rabbitmq.prototype.publish = require('./publish');
Rabbitmq.prototype.whenConnected = require('./when-connected');
Rabbitmq.prototype.queue = require('./queue');
Rabbitmq.prototype.sendToQueue = require('./send-to-queue');

module.exports = Rabbitmq;
