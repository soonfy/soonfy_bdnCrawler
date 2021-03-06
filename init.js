const mongoose = require('mongoose');

import {Config} from './config.js';

mongoose.connect(Config.dbUrl);
mongoose.Promise = global.Promise;
// mongoose.set('debug', true);

import {Key} from './models/key.js';

let main = async function () {
  try {
    console.log('keyer init...');
    let res = await Key.update({ isCrawled: 1 }, { isCrawled: 0 }, {multi: true});
    console.log('==================================keyer init success=====================');
    console.log('==================================keyer init success=====================');
    console.log('==================================keyer init success=====================');    
    console.log(res);
    await mongoose.disconnect();
  } catch (error) {
    console.log(error);
    console.log('==================================keyer init error=====================');
    console.log('==================================keyer init error=====================');
    console.log('==================================keyer init error====================='); 
    await main();
  }
}

main();
