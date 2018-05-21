'use strict';

const config = require('../config');
const request = require('superagent');
const _ = require('lodash');
const co = require('co');
const log = require('../common/log');

/**
 * @api /login
 * @description 多种方式的登录，目前只实现的github
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
 * @api /login/github
 * @description 使用github oauth进行登录
 */
exports.githubOauth = function (req) {
  req.redirect(`https://github.com/login/oauth/authorize?client_id=${config.id}&scope=user,public_repo`);
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
  log.info('begin to request');
  co(function* () {
    const result = yield request.get(`https://github.com/login/oauth/access_token?client_id=${id}&client_secret=${secret}&code=${code}`);
    const astoken = _.get(result, 'body.access_token');
    log.info('request access_token success', astoken);
    if (astoken) {
      const user = (yield request.get(`https://api.github.com/user?access_token=${astoken}`)).body;
      req.session.user = user;
      log.info('request user info success', user);
      req.redirect('/');
    } else {
      callback('NO_ACCESS_TOKEN');
    }
  }).catch(e => {
    callback(e.stack || e.message || e);
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
