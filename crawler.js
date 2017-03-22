import {
  Parser
} from './controllers/parser.js';
import {
  ParamsParser
} from './controllers/paramsParser.js';

import * as fs from 'fs';
import * as os from 'os';

const starter = async() => {
  try {
    let filepath = './source/';
    let file = './source/news.csv';
    fs.writeFileSync(file, '项目,新闻标题,新闻链接,新闻来源,新闻发表时间,新闻采集时间\r\n')
    let lines = fs.readFileSync('./source/dianli.csv', 'utf-8').split(os.EOL);
    console.log(lines);
    for (let _line of lines) {
      let infos = _line.split('\t');
      let keyer = {
        key: {
          q1: infos[1]
        },
        date: {
          begin_date: '2017-03-01',
          end_date: '2017-03-22'
        }
      }
      let params = ParamsParser.parse(keyer);
      let urls = [];
      for (let key in params) {
        urls.push([key, params[key]].join('='))
      }
      let param = urls.join('&');
      param = ['/ns', param].join('?');
      let $ = await Parser.getData(param);
      let results = Parser.dataParser($);
      results.map(_res => {
        let str = [infos[1], _res.title.replace(/,/g, '，'), _res.url.replace(/,/g, '，'), _res.author.replace(/,/g, '，'), _res.publishedAt, new Date()].join(',') + '\r\n';
        fs.appendFileSync(file, str);
      })
      let next = Parser.pageParser($);
      while (next) {
        console.log(next);
        let $ = await Parser.getData(next);
        let results = Parser.dataParser($);
        results.map(_res => {
          let str = [infos[1], _res.title.replace(/,/g, '，'), _res.url.replace(/,/g, '，'), _res.author.replace(/,/g, '，'), _res.publishedAt, new Date()].join(',') + '\r\n';
          fs.appendFileSync(file, str);
        })
        next = Parser.pageParser($);
      }
      console.log(`${infos[1]} parse over...`);
      process.exit();
    }
    console.log(`all over...`);
  } catch (error) {
    console.log(error);
  }
}

starter();