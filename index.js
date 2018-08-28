#!/usr/bin/env node


const debug = require('debug');
const amqp = require('amqplib');
const { pick } = require('ramda');

const parseData = data => JSON.parse(data.content.toString());
const buildData = data => Buffer.from(JSON.stringify(data));

/**
 * @class Agenda
 * @param {Object} config - Rabbitmq connection config
 * @param {Object} options - custom options to connection
 * @property {Object} conn - instance of amqlib connection
 * @property {Object} _name - Name of the current Agenda queue
 * @property {Function} connect - start connection
*/

class Rabbitmq {
  constructor(config = {}, options = {}) {
    debug('rabbitmq:instance')('create instance');
    if (typeof config === 'string') {
      const splitedConfig = config.split(/[\s,://,@]+/);
      this.config = {
        protocol: splitedConfig[0],
        host: splitedConfig[splitedConfig.length - 2],
        port: splitedConfig[splitedConfig.length - 1],
        username: null,
        password: null,
      };
      if (splitedConfig.length === 5) {
        this.config.username = splitedConfig[1];
        this.config.password = splitedConfig[2];
      }
    } else {
      this.config = {
        host: config.host || 'localhost',
        port: config.port || '5672',
        protocol: config.protocol || 'amqp',
        username: config.username,
        password: config.password,
      };
    }

    this.maxAttemptConnect = options.maxAttemptConnect || 3;
    this.timeoutToRetryConnect = 10000;

    this.conn = null;
    this.attemptConnection = 0;
    this.subscribes = [];
    this.queues = [];

    debug('rabbitmq:instance')(this);
  }

  checkConnection() {
    if (!this.conn) throw new Error('You are not connected');
  }

  buildConnectionString() {
    const {
      protocol, host, port, username, password,
    } = this.config;
    if (username) {
      return `${protocol}://${username}:${password}@${host}:${port}`;
    }
    return `${protocol}://${host}:${port}`;
  }

  whenConnected() {
    const cDebug = debug('rabbitmq:connect');
    this.attempt = 0;
    cDebug('starting subscribe(s)');
    this.subscribes.map(c => this.subscribe(c));
    cDebug(`${this.subscribes.length} subscribe(s) started`);

    cDebug('starting queue(s)');
    this.queues.map(c => this.queue(c));
    cDebug(`${this.queues.length} queue(s) started`);
  }

  async reconnect() {
    const rDebug = debug('rabbitmq:reconnect');
    setTimeout(() => {
      rDebug('[AMQP] reconnecting %o', this.config);
      this.connect();
    }, this.timeoutToRetryConnect);
  }

  listenStatus() {
    this.conn.on('error', (error) => {
      switch (error.code) {
        case 'ECONNREFUSED': {
          if (this.attemptConnection > this.maxAttemptConnect) {
            throw error;
          }
          this.reconnect();
        }
      }
    });
    this.conn.on('close', () => {
      this.reconnect();
    });
  }

  async connect() {
    const cDebug = debug('rabbitmq:connect');
    try {
      const connectionString = this.buildConnectionString();
      this.conn = await amqp.connect(connectionString);
      this.listenStatus();
      cDebug('Connected to %o', pick(['protocol', 'host', 'port'], this.config));
      await this.whenConnected();
    } catch (err) {
      throw err;
    }
  }

  async subscribe(opts) {
    const qDebug = debug('rabbitmq:subscribe');
    try {
      this.checkConnection();
      const ch = await this.conn.createChannel();
      await ch.assertExchange(opts.channel, 'fanout', { durable: false });
      const q = await ch.assertQueue('', { exclusive: true });
      await ch.bindQueue(q.queue, opts.channel, '');
      const consumer = data => opts.consume(parseData(data));
      ch.consume(q.queue, consumer, { noAck: false });
      qDebug(' [*] Waiting for messages in %s. To exit press CTRL+C', opts.channel);
    } catch (err) {
      qDebug('ERROR:', err.message);
    }
  }

  async publish(opts) {
    const pDebug = debug('rabbitmq:publish');
    try {
      this.checkConnection();
      const { data, channel } = opts;
      const ch = await this.conn.createChannel();

      await ch.assertExchange(channel, 'fanout', { durable: true });
      await ch.publish(channel, '', buildData((data)));
      pDebug(" [x] Sent '%s' to channel", pick(opts.debug, data), channel);
      ch.close();
    } catch (err) {
      pDebug('ERROR:', err);
    }
  }

  async queue(opts) {
    const qDebug = debug('rabbitmq:queue');
    try {
      this.checkConnection();
      const prefetch = opts.prefetch || 1;
      const ch = await this.conn.createChannel();

      const q = await ch.assertQueue('', { durable: true });
      ch.prefetch(prefetch);
      qDebug(' [*] Waiting for messages in %s. To exit press CTRL+C', q);
      const consumer = data => opts.consume(parseData(data));
      ch.consume(q.queue, consumer, { noAck: false });
    } catch (err) {
      qDebug('ERROR:', err.message);
    }
  }

  async sendToQueue(opts) {
    const qDebug = debug('rabbitmq:queue');
    try {
      this.checkConnection();
      const { data, queue } = opts;
      const ch = await this.conn.createChannel();
      await ch.assertQueue(queue, { durable: true });
      await ch.sendToQueue(queue, buildData(data), { persistent: true });
      qDebug(" [x] Sent '%s' to queue", queue);
      ch.close();
    } catch (err) {
      qDebug('ERROR:', err.message);
    }
  }
}

module.exports = Rabbitmq;
