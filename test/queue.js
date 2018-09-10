const { expect } = require('chai');
const debug = require('debug')('rabbitmq:test');
const Rabbitmq = require('../index.js');

describe('Working with queue', async () => {
  const rabbit = new Rabbitmq();
  before(async () => {
    await rabbit.connect();
  });
  it('should create queue', async () => {
    await rabbit.queue({ queue: 'test', consumer: data => debug(data) });
    expect(rabbit.queues).to.an('Array');
    expect(rabbit.queues).lengthOf(1);
  });

  it('should send message to queue', async () => {
    await rabbit.sendToQueue({ queue: 'test', data: 'hello, queue!!' });
  });
  after(async () => {
    await rabbit.close();
  });
});
