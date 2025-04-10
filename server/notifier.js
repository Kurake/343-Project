const EventEmitter = require('events');

class Notifier extends EventEmitter {}
const notifier = new Notifier();

module.exports = notifier;