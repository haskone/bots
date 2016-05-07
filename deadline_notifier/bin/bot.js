'use strict';

var DeadLinerBot = require('../lib/deadline');
var grabber = require('../lib/grabber');
var config = require('../config');

var deadliner = new DeadLinerBot({
    token: config.token,
    name: config.name,
    giturl: config.giturl,
    channel: config.channel,
    grabber: grabber
});

deadliner.run();