const moment = require('moment');

import {Key} from '../models/key.js';

/**
 * get key model and date
 * @method getKey
 * @return
 */
let getKey = async function () {
  try {
    // let last = new Date(moment().subtract(1, 'days').startOf('day'));
    let last = new Date(moment().add(1, 'days').startOf('day'));
    let key = await Key.findOneAndUpdate({updatedAt: {$lt: last}, isCrawled: 0 }, { isCrawled: 1 }, {sort: {updatedAt: 1}});
    if (key) {
      // 每天采集一次
      // let begin_date = moment(key.updatedAt).format('YYYY-MM-DD');
      // let end_date = moment(key.updatedAt).format('YYYY-MM-DD');
      let begin_date = moment(moment(key.updatedAt).subtract(3, 'days')).format('YYYY-MM-DD');
      let end_date = moment(moment(key.updatedAt).add(1, 'days')).format('YYYY-MM-DD');
      let date= {
        begin_date,
        end_date
      }
      return {key, date};
    }else{
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

let keyer = {
  getKey
}

export {keyer as Keyer}