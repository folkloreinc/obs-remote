const isFunction = require('lodash/isFunction');

const getConfigValue = (val, env = process.env.NODE_ENV) => (isFunction(val) ? val(env) : val);

module.exports = getConfigValue;
