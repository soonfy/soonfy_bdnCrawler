"use strict";
const paramsParser = {
    dataCompare: function (asStartDate, asEndDate) {
        let miStart = Date.parse(asStartDate.replace(/\-/g, '/'));
        let miEnd = Date.parse(asEndDate.replace(/\-/g, '/'));
        return (miEnd - miStart) / 1000;
    },
    isDateString: function (sDate) {
        if (arguments.length !== 1) {
            return false;
        }
        let iaDate = sDate.toString().split("-");
        if (iaDate.length !== 3) {
            return false;
        }
        if (iaDate[1].length > 2 || iaDate[2].length > 2) {
            return false;
        }
        if (isNaN(iaDate[0]) || isNaN(iaDate[1]) || isNaN(iaDate[2])) {
            return false;
        }
        let year = iaDate[0] - 0, month = iaDate[1] - 0, day = iaDate[2] - 0;
        let iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (year < 1900 || year > 2100) {
            return false;
        }
        if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
            iaMonthDays[1] = 29;
        }
        if (month < 1 || month > 12) {
            return false;
        }
        if (day < 1 || day > iaMonthDays[month - 1]) {
            return false;
        }
        return true;
    },
    stringToDate: function (sDate, bIgnore) {
        bIgnore = bIgnore ? bIgnore : this.isDateString(sDate);
        if (bIgnore) {
            let iaDate = sDate.toString().split("-");
            let year = iaDate[0] - 0, month = iaDate[1] - 1, day = iaDate[2] - 0;
            return (new Date(year, month, day));
        }
        else {
            return (new Date(1900, 1, 1));
        }
    },
    parse: function (params) {
        let { key, date } = params;
        let { q1, q3, q4, q6, from, cl, submit, tn, s, mt, lm, ct, ct1, rn } = key;
        let { begin_date, end_date } = date;
        if (!q1 && !q3) {
            console.error("请填写关键词！");
            return;
        }
        if (!begin_date || !this.isDateString(begin_date)) {
            console.error("开始日期格式不正确，请按照yyyy-mm-dd的格式重新填写！");
            return;
        }
        if (!end_date || !this.isDateString(end_date)) {
            console.error("结束日期格式不正确，请按照yyyy-mm-dd的格式重新填写！");
            return;
        }
        if (this.stringToDate(begin_date, true) > this.stringToDate(end_date, true)) {
            console.error("日期区间不正确，请重新填写！");
            return;
        }
        q1 = q1 ? encodeURIComponent(q1) : '';
        q3 = q3 ? encodeURIComponent(q3) : '';
        q4 = q4 ? encodeURIComponent(q4) : '';
        q6 = q6 ? encodeURIComponent(q6) : '';
        from = from ? from : 'news';
        cl = cl ? cl : 2;
        submit = submit ? submit : '%B0%D9%B6%C8%D2%BB%CF%C2';
        s = s ? s : 2;
        tn = tn ? tn : 'newsdy';
        mt = mt ? mt : 0;
        lm = lm ? lm : '';
        ct1 = ct1 ? ct1 : 1;
        ct = ct ? ct : 1;
        rn = rn ? rn : 50;
        let bd = begin_date.split("-");
        let y0 = bd[0] - 0;
        let m0 = bd[1] - 0;
        let d0 = bd[2] - 0;
        let ed = end_date.split("-");
        let y1 = ed[0] - 0;
        let m1 = ed[1] - 0;
        let d1 = ed[2] - 0;
        let bt, et;
        if (s === 1) {
            bt = 0;
            et = 0;
        }
        else {
            let bstd = (this.dataCompare('1970-01-01', begin_date));
            bt = bstd - 28800;
            let estd = (this.dataCompare('1970-01-01', end_date));
            et = estd - 28800 + 86399;
        }
        let all_params = { from, cl, bt, y0, m0, d0, y1, m1, d1, et, q1, submit, q3, q4, mt, lm, s, begin_date, end_date, tn, ct, ct1, rn, q6 };
        return all_params;
    }
};
exports.ParamsParser = paramsParser;
