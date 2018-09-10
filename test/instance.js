const { expect } = require('chai');
const Rabbitmq = require('../index.js');

describe('Create Object', async () => {
  it('should create Rabbitmq Object using default values', async () => {
    const rabbit = new Rabbitmq();
    expect(rabbit.host).equals('127.0.0.1');
    expect(rabbit.port).equals('5672');
    expect(rabbit.protocol).equals('amqp');
  });

  it('should create Rabbitmq Object using connection string with authentication', async () => {
    const rabbit = new Rabbitmq('amqps://guest@guest:127.0.0.20:5656');
    expect(rabbit.host).equals('127.0.0.20');
    expect(rabbit.port).equals('5656');
    expect(rabbit.protocol).equals('amqps');
    expect(rabbit.username).equals('guest');
    expect(rabbit.password).equals('guest');
  });

  it('should create Rabbitmq Object using connection string', async () => {
    const rabbit = new Rabbitmq('amqps://127.0.0.20:5656');
    expect(rabbit.host).equals('127.0.0.20');
    expect(rabbit.port).equals('5656');
    expect(rabbit.protocol).equals('amqps');
  });

  it('should return an error when trying to use a wrong connection string', async () => {
    const rabbit = new Rabbitmq('amqps://127.0.0.20:5656');
    expect(rabbit.host).equals('127.0.0.20');
    expect(rabbit.port).equals('5656');
    expect(rabbit.protocol).equals('amqps');
  });

  it('should create Rabbitmq Object using object config', async () => {
    const rabbit = new Rabbitmq({ host: '127.0.0.10', port: '7272', protocol: 'amqp' });
    expect(rabbit.host).equals('127.0.0.10');
    expect(rabbit.port).equals('7272');
    expect(rabbit.protocol).equals('amqp');
  });
});
