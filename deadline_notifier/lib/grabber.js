'use strict';

function grabber(url, onOk, onError) {
    requestp(url, true).then(function (data) {
        onOk(data)
    }, function (err) {
        onError(err)
    });
}

function requestp(url, json) {
    var Promise = require("promise");
    var request = require("request");
    json = json || false;
    var options = {
      url: url,
      json: json,
      headers: {
        'User-Agent': 'request'
      }
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, res, body) {
            if (err) {
                return reject(err);
            } else if (res.statusCode !== 200) {
                err = new Error("Unexpected status code: " + res.statusCode);
                err.res = res;
                return reject(err);
            }
            resolve(body);
        });
    });
}

module.exports = grabber;