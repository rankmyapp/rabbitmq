const debug = require('debug')('rabbitmq:connect');
const Promise = require('bluebird');

module.exports = async (self) => {
  const opts = { concurency: 1 };
  if (self.subscribes.length) {
    debug('starting subscribe(s)');
    await Promise.map(self.subscribes, c => self.subscribe(c), opts);
    debug(`${self.subscribes.length} subscribe(s) started`);
  }

  if (self.queues.length) {
    debug('starting queue(s)');
    await Promise.map(self.queues, c => self.queue(c), opts);
    debug(`${self.queues.length} queue(s) started`);
  }
  Object.assign(self, { attemptConnection: 0 });
};
