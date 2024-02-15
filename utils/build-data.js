const debug = require('debug')('rabbitmq:queue');

module.exports = data => {
    try {
        return JSON.parse(data.content.toString())
    } catch(err) {
        debug('Fail to parse queue message')
        return {}
    }
};
