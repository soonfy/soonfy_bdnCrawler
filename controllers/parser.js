const rp = require('request-promise');
const cheerio = require('cheerio');

import {Config} from '../config.js';


/**
 * get data from url param
 * @method getData
 * @param {any} param
 * @param {number} [time=1] - run times
 * @returns
 */
const getData = async function (param, time = 1) {
  try {
    if(time > 10){
      return {};
    }
    let url = Config.host + param;
    console.log('now is parse', url);
    let options = {
      url,
      timeout: Config.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
        'Cookie': 'BDUSS=kp1VFA2QU5Hc0VqaEFRQjRuRmo0c1FIdGQ5SXlacEwxcnNCSVJPVUZhLXNvSzlZSVFBQUFBJCQAAAAAAAAAAAEAAACcBEoURGVpdHlfeGlhb2RpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKwTiFisE4hYb; BAIDUID=FDFF3008D9037881CFE34DB9F189A185:FG=1; MCITY=-131%3A; BIDUPSID=FDFF3008D9037881CFE34DB9F189A185; PSTM=1490167033; BDRCVFR[iL4hrzJ0zlT]=mbxnW11j9Dfmh7GuZR8mvqV; BD_CK_SAM=1; PSINO=2; BDSVRTM=505; H_PS_PSSID='
      },
      transform: function (body) {
        return cheerio.load(body);
      }
    }
    let $ = await rp(options);
    // console.log($);
    // $ = cheerio.load($);
    return $;
  } catch (error) {
    console.log(error);
    console.log(param, '第', time, '次采集出错。');
    console.log('休息', time, 's重新开始。');
    await Config.timestop(time++);
    await getData(param, time++);
  }
};

/**
 * parse count data
 * @countParser
 * @param {any} $
 * @param {any} time
 * @returns
 */
const countParser = function ($, time) {
  try {
    let div = $('.nums').first();
    let str = div.text();
    let count = str.replace(/\D/g, '');
    count = parseInt(count);
    if(count !== count){
      return countParser($, time++);
    }
    return count;
  } catch (error) {
    console.log(error);
    console.log('第', time, '次采集出错。');
    console.log('休息', time, 's重新开始。');
    countParser($, time++);
  }
}

/**
 * parse data from getData()
 * @dataParser
 * @param {any} $ - cheerio load html
 * @param {any} time - run times
 * @returns
 */
const dataParser = function ($, time) {
  try {
    let divs = $('div.result');
    let len = divs.length;
    console.log('本页总共', len, '条数据。');
    let results = [];
    divs.map((ind, div) => {
      let title = $(div).children('h3').text().trim();
      let info = $(div).find('.c-author').text().trim() || $(div).find('.c-title-author').text().trim() || '';
      info = info.trim().replace(/[年|月]/g, '-').replace(/日/g, '');
      let infos = info.split(/\s+/);
      let author
      if(!infos[0].match(/\d{4}\-\d{2}\-\d{2}/)){
        author = infos.shift();
      }else{
        author = ''
      }
      let time = [infos[0], infos[1]].join(' ');
      let publishedAt = new Date([infos[0], infos[1]].join(' ')) || new Date();
      let summary = $(div).find('.c-summary').text().trim() || $(div).find('.c-title-author').text().trim() || '';
      let url = $(div).children('h3').children('a').attr('href').trim() || '';
      results.push({
        title,
        author,
        publishedAt,
        summary,
        url,
        time
      })
    })
    let count = results.length;
    console.log('总共采集到', count, '条数据。');
    if(len !== count){
      throw new Error('结果采集数量不正确。');
    }
    return results;
  } catch (error) {
    console.log(error);
    console.log('第', time, '次采集出错。');
    console.log('休息', time, 's重新开始。');
    dataParser($, time++);
  }
};

/**
 * parse next page from getData()
 * @pageParser
 * @param {any} $ - cheerio load data
 * @param {any} time - run times
 * @returns
 */
const pageParser = function ($, time) {
  try {
    let pages = $('#page').find('a.n');
    let next;
    pages.map((ind, page) => {
      if($(page).text().includes('下一页')){
        next = $(page).attr('href');
        return;
      }
    })
    return next;
  } catch (error) {
    console.log(error);
    console.log('第', time, '次采集出错。');
    console.log('休息', time, 's重新开始。');
    dataParser($, time++);
  }
};

const parser = {
  getData,
  countParser,
  dataParser,
  pageParser
}

export {parser as Parser};
