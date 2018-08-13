'use strict';

require('dotenv').config();

if (!process.env.NODE_ENV) {
  throw new Error('UNDEFINED NODE_ENV');
}

if (process.env.NODE_ENV !== 'production') {
  console.log('------------------------DEVELOPMENT SETTINGS----------------------'); // eslint-disable-line
  require('babel-register');
  require('./src/main');
} else {
  console.log('------------------------PRODUCTION SETTINGS----------------------'); // eslint-disable-line
  require('./build/main'); // eslint-disable-line
}
