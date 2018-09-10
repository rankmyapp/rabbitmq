const { expect } = require('chai');
const debug = require('debug')('rabbitmq:test');
const Rabbitmq = require('../index.js');

describe('Working with pub/sub', async () => {
  const rabbit = new Rabbitmq();
  before(async () => {
    await rabbit.connect();
  });
  it('should create subscribe', async () => {
    await rabbit.subscribe({ channel: 'test', consume: data => debug(data) });
    expect(rabbit.subscribes).to.be.an('Array');
    expect(rabbit.subscribes).lengthOf(1);
  });

  it('should publish message to channel', async () => {
    await rabbit.publish({ channel: 'test', data: 'hello, channel!!' });
  });
  after(async () => {
    await rabbit.close();
  });
});
