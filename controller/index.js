'use strict';

const config = require('../config');
const request = require('superagent');
const _ = require('lodash');
const co = require('co');

/**
 * @api /login
 */
exports.login = function (req, callback) {
  callback(null, {
    tpl: 'login.html',
    data: {
      prefix: config.prefix === '/' ? '' : config.prefix,
      id: _.get(config, 'oauth.github.id')
    }
  }, 'html');
};

/**
 * @api /oauth2/github/callback
 * @description 用于处理github oauth返回的结果
 */
exports.githubCb = function (req, callback) {
  const query = req.query;
  const code = query.code;
  const id = _.get(config, 'oauth.github.id');
  const secret = _.get(config, 'oauth.github.secret');
  co(function* () {
    const result = yield request.get(`https://github.com/login/oauth/access_token?client_id=${id}&client_secret=${secret}&code=${code}`);
    const astoken = _.get(result, 'body.access_token');
    if (astoken) {
      const user = yield request.get(`https://api.github.com/user?access_token=${astoken}`).body;
      req.session.user = user;
      callback(null);
    }
  }).catch(e => {
    callback(e);
  });
};

/**
 * @api /login/state
 * @description 用于判断用户是否登录，这里用比较简单的逻辑来处理
 */
exports.getUser = function (req, callback) {
  if (req.session.user) {
    callback(null, req.session.user, 'json');
  } else {
    callback('UNAUTHED');
  }
};

