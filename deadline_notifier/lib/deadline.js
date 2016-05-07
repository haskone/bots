'use strict';

var Bot = require('slackbots');
var util = require('util');

var DeadLinerBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name;

    this.giturl = settings.giturl;
    this.grabber = settings.grabber;
    this.channelNumber = settings.channel;
    this.user = null;
};

util.inherits(DeadLinerBot, Bot);
module.exports = DeadLinerBot;

DeadLinerBot.prototype.run = function () {
    DeadLinerBot.super_.call(this, this.settings);
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

DeadLinerBot.prototype._onStart = function () {
    this._loadBotUser();
    this._welcomeMessage();
};

DeadLinerBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

DeadLinerBot.prototype._welcomeMessage = function () {
    this.postMessageToChannel(
        this.channels[this.channelNumber].name,
        'Hi guys! Do you know about our deadline? It is soon...',
        {as_user: true});
};

DeadLinerBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        !this._isFromDeadLinerBot(message) &&
        this._isMentioningDeadLiner(message)
    ) {
        this._getDeadline(message);
    }
};

DeadLinerBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

DeadLinerBot.prototype._isFromDeadLinerBot = function (message) {
    return message.user === this.user.id;
};

DeadLinerBot.prototype._isMentioningDeadLiner = function (message) {
    // not actually 'deadliner' but any deadline-phrase
    // should invoke deadliner-bot
    return message.text.toLowerCase().indexOf('deadline') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

DeadLinerBot.prototype._getDeadline = function (originalMessage) {
    var self = this;
    var postMsg = function(msg) {
        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, msg, {as_user: true});
    }
    var onOk = function (data) {
        var msg = '';
        if ('due_on' in data[0]) {
            // TODO: definitely it should be more pretty and smart
            data.sort(function (a, b) {
                return new Date(a.due_on - b.due_on);
            });

            var nearest = new Date(data[0].due_on);
            msg = util.format(
                'Some news about our project: the nearest deadline is %s',
                nearest);

            var timeNow = Date.now();
            if (nearest < timeNow) {
                msg += '\nBut we already can\'t do it in time =(';
            }

            if (data.length > 1) {
                var last = new Date(data[data.length - 1].due_on);
                msg += util.format(
                    '\n... and the last deadline is %s\n', last);
                if (last < timeNow) {
                    msg += '... and we can\'t do it in time too =(';
                } else {
                    msg += 'And we still have much time for it =)';
                }
            }
        } else {
            msg = 'Oops! I .... I didn\'t that :( Sorry...';
        }
        postMsg(msg)
    }
    var onError = function (data) {
        var msg = 'Oops! Something really bad happened. ' +
            'Maybe someone broke my configs? Or broke our github project...';
        postMsg(msg)
    }
    this.grabber(self.giturl, onOk, onError);
};

DeadLinerBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};
