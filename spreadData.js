const CronJob = require("cron").CronJob;
const request = require("request");
const moment = require("moment");
const fs = require('fs');
let cookieJar = request.jar();

var stkSymbols = ["GODREJCP", "BOSCHLTD", "HINDALCO", "NESTLEIND", "SHREECEM", "UPL", "NMDC", "NTPC", "UBL", "BEL", "HINDPETRO", "TECHM", "NAUKRI", "TATAMOTORS", "CONCOR", "HCLTECH", "POWERGRID", "HDFCLIFE", "VEDL", "DABUR", "HINDUNILVR", "BAJAJ-AUTO", "RECLTD", "INFY", "IOC", "GODREJPROP", "WIPRO", "COALINDIA", "AMBUJACEM", "ULTRACEMCO", "HDFC", "HEROMOTOCO", "TATACONSUM", "MARICO", "SBIN", "BHARATFORG", "BPCL", "EICHERMOT", "BERGEPAINT", "MRF", "GRASIM", "FEDERALBNK", "TATAPOWER", "PETRONET", "CUMMINSIND", "TORNTPOWER", "TCS", "MARUTI", "KOTAKBANK", "CENTURYTEX", "DRREDDY", "ASHOKLEY", "BHARTIARTL", "INDIGO", "ICICIBANK", "GAIL", "DIVISLAB", "SIEMENS", "TORNTPHARM", "MUTHOOTFIN", "UJJIVAN", "MOTHERSUMI", "RELIANCE", "DLF", "EQUITAS", "LUPIN", "LICHSGFIN", "EXIDEIND", "APOLLOTYRE", "JUSTDIAL", "LT", "INFRATEL", "APOLLOHOSP", "BHEL", "BANDHANBNK", "M&M", "MGL", "TITAN", "PFC", "JSWSTEEL", "HDFCBANK", "ITC", "ZEEL", "ADANIENT", "ADANIPORTS", "AMARAJABAT", "TVSMOTOR", "AUROPHARMA", "SUNPHARMA", "AXISBANK", "JUBLFOOD", "GLENMARK", "PVR", "PNB", "MCDOWELL-N", "ASIANPAINT", "ONGC", "VOLTAS", "MANAPPURAM", "INDUSINDBK", "CADILAHC", "BANKBARODA", "CESC", "IDEA", "BAJAJFINSV", "CIPLA", "COLPAL", "BRITANNIA", "BALKRISIND", "NCC", "RBLBANK", "PIDILITIND", "SRTRANSFIN", "BAJFINANCE", "HAVELLS", "JINDALSTEL", "GMRINFRA", "ADANIPOWER", "PEL", "CANBK", "SAIL", "M&MFIN", "NIITTECH", "IDFCFIRSTB", "TATASTEEL", "TATACHEM", "SUNTV", "BIOCON", "CHOLAFIN", "SRF", "PAGEIND", "TATAGLOBAL", "MFSL", "BATAINDIA", "IBULHSGFIN", "YESBANK", "L&TFH", "NATIONALUM", "OIL", "ACC", "IGL", "ICICIPRULI", "MINDTREE", "ESCORTS", "RAMCOCEM"];
let futureExpiry = ["27-09-2018", "28-06-2018", "22-02-2018", "27-12-2018", "29-11-2018", "26-07-2018", "28-03-2018", "31-05-2018", "30-08-2018", "26-04-2018", "25-01-2018", "25-10-2018", "30-05-2019", "25-04-2019", "28-03-2019", "27-06-2019", "31-01-2019", "29-08-2019", "28-02-2019", "31-10-2019", "28-11-2019", "25-07-2019", "26-12-2019", "26-09-2019", "30-01-2020", "27-02-2020", "26-03-2020", "30-04-2020", "28-05-2020"];
stkSymbols = stkSymbols.sort();

function getData(addObj, stock, expiry) {
  return new Promise((resolve, reject) => {
    let fromDate = moment(expiry, 'DD-MM-YYYY').startOf('month').format('DD-MMM-YYYY');
    let endDate = moment(expiry, 'DD-MM-YYYY').endOf('month').format('DD-MMM-YYYY');

    var options = {
      method: 'GET',
      url: `https://www1.nseindia.com/products/dynaContent/common/productsSymbolMapping.jsp?instrumentType=FUTSTK&symbol=${stock}&expiryDate=${expiry}&optionType=select&strikePrice=&dateRange=&fromDate=${fromDate}&toDate=${endDate}&segmentLink=9&symbolCount=`,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Referer': 'https://nseindia.com/products/content/derivatives/equities/historical_fo.htm',
      },
      jar: cookieJar,
      keepAlive: true,
      gzip: true,
    };

    request(options, function (error, response, body) {
      if (error) resolve([]);
      else {
        try {
          let start = body.indexOf('"Symbol","Date",');
          let end = body.indexOf('</div>', start);
          if (start != -1 && end != -1) {
            let body_data = body.substring(start, end);
            body_data = body_data
              .split(':')
              .map(c => c
                .split(',')
                .map(c2 => c2
                  .replace(/"/g, '')
                )
              )
              .filter(c => c.length > 1)
              .splice(1)
              .map(c => ({
                'stock': c[0],
                'date': c[1],
                'expiryDate': c[2],
                'open': parseFloat(c[3]),
                'high': parseFloat(c[4]),
                'low': parseFloat(c[5]),
                'close': parseFloat(c[6]),
                'LTP': parseFloat(c[7]),
                'settlePrice': parseFloat(c[8]),
                'contracts': parseInt(c[9]),
                'turnover': parseInt(c[10]),
                'oi': parseInt(c[11]),
                'chg_oi': parseInt(c[12]),
                'underlying': parseInt(c[13]),
              }));

            resolve(body_data);
          } else {
            // console.log(stock, expiry);
            resolve([]);
          }
        } catch (err) {
          console.log(err);
          resolve([]);
        }
      }
    });
  });
}

function startSession() {
  return new Promise((resolve, reject) => {
    var headers = {
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-IN,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,hi;q=0.6,mr;q=0.5',
    };

    var options = {
      method: 'GET',
      url: 'https://www1.nseindia.com/products/content/derivatives/equities/historical_fo.htm',
      headers: headers,
      jar: cookieJar,
      gzip: true,
      keepAlive: true
    };

    function callback(error, response, body) {
      console.log('ok');
      if (!error && response.statusCode == 200) {
        console.log('connected');
        resolve();
      } else {
        console.log(error);
        reject();
      }
    }

    request(options, callback);
  });
}

async function init() {
  await startSession();
  for (i = 0; i < stkSymbols.length; i++) {
    console.log('downloading...' + i + '/' + stkSymbols.length, 'Stock: ' + stkSymbols[i]);
    await download(stkSymbols[i]);
  }
}

async function download(stock) {
  return new Promise(async (resolve, reject) => {
    let combine = await Promise.all(futureExpiry.map(expiry => {
      return getData({}, stock, expiry);
    }));
    var merged = [].concat.apply([], combine);
    merged = merged.sort((a, b) => {
      let d1 = moment(a.date, 'DD-MMM-YYYY');
      let d2 = moment(b.date, 'DD-MMM-YYYY');
      return d1.diff(d2);
    });
    fs.writeFileSync('wwwroot/data/' + stock + '.json', JSON.stringify(merged));
    resolve();
  })
}

init();
new CronJob('0 0 1 * * *', init, null, true, 'Asia/Kolkata');