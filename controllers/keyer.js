const moment = require('moment');

import {
  Key
} from '../models/key.js';

/**
 * get key model and date
 * @method getKey
 * @return
 */
let getKey = async function () {
  try {
    // let last = new Date(moment().subtract(1, 'days').startOf('day'));
    let last = new Date(moment().add(1, 'days').startOf('day'));
    console.log(last);
    let key = await Key.findOneAndUpdate({
      updatedAt: {
        $lt: last
      },
      isCrawled: 0
    }, {
      isCrawled: 1
    }, {
      sort: {
        updatedAt: 1
      }
    });
    console.log(key);
    if (key) {
      // 每天采集一次
      // let begin_date = moment(key.updatedAt).format('YYYY-MM-DD');
      // let end_date = moment(key.updatedAt).format('YYYY-MM-DD');
      let offsets = 3,
        dates = [];
      while (0 <= offsets) {
        let temp_date = moment(moment(key.updatedAt).subtract(offsets, 'days')).format('YYYY-MM-DD');
        dates.push({
          begin_date: temp_date,
          end_date: temp_date
        })
        offsets--;
      }
      return {
        key,
        dates
      };
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

let keyer = {
  getKey
}

export {
  keyer as Keyer
}