import {
  Parser
} from './controllers/parser.js';
import {
  ParamsParser
} from './controllers/paramsParser.js';

import * as fs from 'fs';
import * as os from 'os';

import * as moment from 'moment';

const starter = async() => {
  try {
    let filepath = './source/';
    let file = './source/news.csv';
    fs.writeFileSync(file, '项目,新闻标题,新闻链接,新闻来源,新闻摘要,新闻发表时间,新闻采集时间\r\n')
    let lines = fs.readFileSync('./source/dianli.csv', 'utf-8').split(os.EOL);
    lines.shift();
    for (let _line of lines) {
      let infos = _line.split('\t');
      infos.filter(x => x && x.trim());
      let keyer = {
        key: {
          q3: infos.slice(3).join('+')
        },
        date: {
          begin_date: infos[1].replace(/\./g, '-'),
          end_date: infos[2].replace(/\./g, '-')
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
        let str = [infos[0] + '-' + infos[3], _res.title.replace(/,/g, '，'), _res.url.replace(/,/g, '，'), _res.author.replace(/,/g, '，'), _res.summary.replace(/,/g, '，'), _res.publishedAt, new Date()].join(',') + '\r\n';
        fs.appendFileSync(file, str);
      })
      let next = Parser.pageParser($);
      while (next) {
        console.log(next);
        let $ = await Parser.getData(next);
        let results = Parser.dataParser($);
        results.map(_res => {
          let str = [infos[0] + '-' + infos[3], _res.title.replace(/,/g, '，'), _res.url.replace(/,/g, '，'), _res.author.replace(/,/g, '，'), _res.summary.replace(/,/g, '，'), _res.publishedAt, new Date()].join(',') + '\r\n';
          fs.appendFileSync(file, str);
        })
        next = Parser.pageParser($);
      }
      console.log(`${infos[0] + '-' + infos[3]} parse over...`);
    }
    console.log(`all over...`);
  } catch (error) {
    console.log(error);
  }
}

starter();