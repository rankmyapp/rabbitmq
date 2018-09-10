const { expect } = require('chai');
const Rabbitmq = require('../index.js');

describe('Connect to rabbitmq server', async () => {
  it('should create connection', async () => {
    const rabbit = new Rabbitmq();
    await rabbit.connect();
    expect(rabbit.conn).to.be.an('Object');
  });
});
