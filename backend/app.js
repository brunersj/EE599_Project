"use strict";

global.fetch = require("node-fetch");
const express = require("express");
const app = express();
let morgan = require('morgan');
let config = require('config'); //we load the db location from the JSON files
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// We need cors middleware to bypass CORS security in browsers.
const cors = require("cors");

//don't show the log when it is test
if (config.util.getEnv('NODE_ENV') !== 'test') {
  //use morgan to log at command line
  app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

app.use(express.static("static"));
app.use(cors());

let port = 5000;

// IEX Cloud API Key *** Change to your own key *** 
const iex_key = 'pk_a8ed94273cbb45918ade3846ab74bb26';

// initialize account balance to $10000
let cash = 10000;
let stock_value = 0;

let portfolio = [];
let balance = {
  cash: cash,
  stock_value: stock_value
};

portfolio.push(balance);

// print portfolio
let portfolioString = JSON.stringify(portfolio, null, 2);
console.log("portfolioString: ", portfolioString);

/**
 * A promise that resolves after t ms.
 * @param {Number} t 
 */
const delay = function (t) {
  return new Promise(resolve => setTimeout(resolve, t));
};

/**
 * Get stock quote from IEX API
 * @param {String} req_symbol
 */
async function GetQuote(req_symbol) {

  const iex_api_url = `https://cloud.iexapis.com/stable/stock/${req_symbol}/batch?types=quote&token=${iex_key}`;
  try {
    var response = await fetch(iex_api_url);
    const json = await response.json();
    // console.log(json);
    // let price = Number(json.quote.iexRealtimePrice.toFixed(2));
    let price = Number(json.quote.latestPrice.toFixed(2));
    let company_name = json.quote.companyName;
    console.log("companyName: ", company_name);
    console.log("price: ", price);
    let return_obj = {
      company_name: company_name,
      price: price
    };
    return return_obj;

  } catch (err) {
    console.log(response.status);
    throw new Error(response.status);
  }
}

/*
*** IEX API HTTP STATUS CODES ***
HTTP CODE	TYPE	            DESCRIPTION
400	      Incorrect Values	Invalid values were supplied for the API request
400	      No Symbol	        No symbol provided
400	      Type Required	    Batch request types parameter requires a valid value
401	      Authorization Restricted	Hashed token authorization is restricted
401	      Authorization Required	Hashed token authorization is required
401	      Restricted	      The requested data is marked restricted and the account does not have access.
401	      No Key	          An API key is required to access the requested endpoint.
401	      Secret Key Required	The secret key is required to access to requested endpoint.
401	      Denied Referer	The referer in the request header is not allowed due to API token domain restrictions.
402	      Over Limit	You have exceeded your allotted message quota and pay-as-you-go is not enabled.
402	      Free tier not allowed	The requested endpoint is not available to free accounts.
402	      Tier not allowed	The requested data is not available to your current tier.
403	      Authorization Invalid	Hashed token authorization is invalid.
403  	    Disabled Key	The provided API token has been disabled
403     	Invalid Key	The provided API token is not valid.
403 	    Test token in production	A test token was used for a production endpoint.
403     	Production token in sandbox	A production token was used for a sandbox endpoint.
403     	Circuit Breaker	Your pay-as-you-go circuit breaker has been engaged and further requests are not allowed.
403 	    Inactive	Your account is currently inactive.
404     	Unknown Symbol	Unknown symbol provided
404     	Not Found	Resource not found
413     	Max Types	Maximum number of types values provided in a batch request.
429 	    Too many requests	Too many requests hit the API too quickly. An exponential backoff of your requests is recommended.
451     	Enterprise Permission Required	The requested data requires additional permission to access.
500	      System Error	Something went wrong on an IEX Cloud server.
*/



/**
 * route get request to /refresh path
 */
app.get("/refresh", async function (req, res, next) {
  console.log("I got a query!");
  handleRefreshGet(res, res, req.query);
});

/**
 * route get request to /quote path
 */
app.get("/quote", async function (req, res, next) {
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("I got a query!");
    handleQuoteGet(res, res, req.query);
  }
});

/**
 * route post request to /buy path
 */
app.post("/buy", async function (req, res) {
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("I got a query!");
    handleBuyPost(res, res, req.body);
  }
});

/**
 * route post request to /sell path
 */
app.post("/sell", async function (req, res) {
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("I got a query!");
    handleSellPost(res, res, req.body);
  }
});


app.listen(port, err => {
  console.log(`Listening on port: ${port}`);
});

// for testing
module.exports = app;


//-----------------------------------------------------------------------------
/**
 * Handles a Get request for refresh
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} query 
 */
async function handleRefreshGet(req, res, query) {
  // *** to do ***
  // fix error handling
  // stock value is undefined?? why
  console.log("in handle refresh get");
  let error = "NO_ERROR";
  let new_stock_value = 0;

  try {
    if (portfolio.length < 2) {
      error = "Portfolio Empty";
    }
    for (let i = 1; i < portfolio.length; i++) {
      const req_symbol = portfolio[i].symbol;
      const quote = await GetQuote(req_symbol);
      const price = quote.price;
      const new_market_value = Number(price * portfolio[i].total_shares).toFixed(2);
      portfolio[i].market_value = new_market_value;
      new_stock_value += Number(new_market_value);
    }
    console.log("new stock value: ", new_stock_value);
    portfolio[0].stock_value = new_stock_value;
  } catch (err) {
    console.log(err);
    error = err;
  }

  // Generate the output
  let output_error = {
    error: error
  };
  let output = portfolio.slice();
  output.splice(0, 0, output_error);

  // Convert output to JSON
  let outputString = JSON.stringify(output, null, 2);
  console.log("outputString: ", outputString);

  // Let's generate some artificial delay!
  await delay(2000);

  // Send it back to the frontend.
  res.json(output);
}

//-----------------------------------------------------------------------------
/**
 * Handles a Get request for quote
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} query 
 */
async function handleQuoteGet(req, res, query) {
  let error = "NO_ERROR";
  let req_symbol;
  let price;
  let company_name;
  console.log("query: ", JSON.stringify(query));
  // If there was a query (a query string was sent)
  if (
    query !== undefined &&
    query.symbol !== undefined
  ) {
    console.log("This is a quote query");
    req_symbol = query.symbol.toUpperCase();
    try {
      const quote = await GetQuote(req_symbol);
      price = quote.price;
      company_name = quote.company_name;
    } catch (err) {
      console.log("Error from catch:" + err);
      error = "" + err;
    }

  } else {
    error = "ERROR: symbol not provided";
  }

  // Generate the output
  let output = {
    company_name: company_name,
    symbol: req_symbol,
    price: price,
    error: error
  };

  // Convert output to JSON
  let outputString = JSON.stringify(output, null, 2);
  console.log("outputString: ", outputString);

  // Let's generate some artificial delay!
  await delay(2000);

  // Send it back to the frontend.
  res.json(output);

}



//-----------------------------------------------------------------------------
/**
 * Handles a Post request for buy
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} body 
 */
async function handleBuyPost(req, res, body) {
  let error = "NO_ERROR";
  let req_symbol;
  let price;
  let cost;
  let req_shares;
  console.log("body: ", JSON.stringify(body));
  // If there was a body (a body string was sent)
  if (
    body !== undefined &&
    body.symbol !== undefined &&
    body.shares !== undefined
  ) {
    console.log("This is a buy request");
    req_symbol = body.symbol.toUpperCase();
    req_shares = parseInt(body.shares);
    try {
      const quote = await GetQuote(req_symbol);
      price = quote.price;
      const company_name = quote.company_name;
      cost = Number((req_shares * price).toFixed(2));
      if (cost <= cash) {
        cash = Number((cash - cost).toFixed(2));
        console.log("cash: ", cash);
        console.log("cost: ", cost);

        // record purchase to portfolio

        // if symbol already exists in portfolio, push # of shares @ price purchased to portfolio

        if (portfolio.find(o => o.symbol === req_symbol)) {
          console.log("symbol found in portfolio");
          var existing_stock = portfolio.find(obj => obj.symbol === req_symbol);
          console.log(existing_stock);
          existing_stock.shares.push(req_shares);
          existing_stock.total_shares = (existing_stock.total_shares + req_shares);
          existing_stock.prices.push(price);
          existing_stock.total_cost += cost;
          existing_stock.market_value = Number((existing_stock.total_shares * price).toFixed(2));
        } else {
          // if doesn't exist then add to portfolio
          let stock = {
            company_name: company_name,
            symbol: req_symbol,
            shares: [req_shares],
            total_shares: req_shares,
            prices: [price],
            total_cost: cost,
            market_value: cost
          }
          portfolio.push(stock);
        }
      } else { //insufficient funds
        error = "ERROR: insufficient funds"
      }
    } catch (err) {
      console.error(err);
      error = "" + err;
    }
  } else {
    error = "ERROR: symbol not provided";
  }

  // Generate the output
  let output_error = {
    error: error
  };
  portfolio[0].cash = Number(cash);
  portfolio[0].stock_value += Number(cost);
  let output = portfolio.slice();
  output.splice(0, 0, output_error);

  // Let's generate some artificial delay!
  await delay(2000);

  // Send it back to the frontend.
  res.json(output);

  // portfolioString = JSON.stringify(portfolio, null, 2);
  // console.log("portfolio: ", portfolio);
  // console.log("portfolioString: ", portfolioString);

}

//-----------------------------------------------------------------------------
/**
 * Handles a Post request for sell - Sell only has FIFO option currently
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} body 
 */
async function handleSellPost(req, res, body) {
  let error = "NO_ERROR";
  let req_symbol;
  let price;
  let cost;
  let req_shares;
  console.log("body: ", JSON.stringify(body));
  // If there was a body (a body string was sent)
  if (
    body !== undefined &&
    body.symbol !== undefined &&
    body.shares !== undefined
  ) {
    console.log("This is a sell request");
    req_symbol = body.symbol.toUpperCase();
    req_shares = parseInt(body.shares);
    let req_shares_copy = req_shares;
    try {
      const quote = await GetQuote(req_symbol);
      price = quote.price;
      cost = Number((price * req_shares).toFixed(2));
      // find symbol in portfolio
      if (portfolio.find(o => o.symbol === req_symbol)) {
        //sum of shares of requested symbol:
        var existing_stock = portfolio.find(o => o.symbol === req_symbol);
        // get sum of total owned shares
        var sum = existing_stock.shares.reduce(function (a, b) {
          return a + b;
        }, 0);
        // check if shares owned > shares requested to sell 
        if (sum >= req_shares) {
          while (req_shares > 0) {
            let sell_shares = existing_stock.shares.shift();
            if (req_shares >= sell_shares) {
              req_shares -= sell_shares;
            } else {
              sell_shares -= req_shares;
              // push front balance of shares not sold
              existing_stock.shares.unshift(sell_shares);
              req_shares = 0;
            }

          }
          existing_stock.total_shares -= req_shares_copy;
          // if there are no more shares then remove stock from portfolio
          if (existing_stock.total_shares == 0) {
            portfolio.splice(portfolio.indexOf(existing_stock), 1);
          } else {
            // add total cost and market value
            existing_stock.total_cost -= cost;
            existing_stock.market_value = Number((existing_stock.total_shares * price).toFixed(2));
          }
          cash = Number((cash + cost).toFixed(2));
          console.log("cash: ", cash);
        } else { //insufficient shares
          error = "ERROR: insufficient shares to complete sale"
        }
      } else {
        error = "ERROR: symbol not found in portfolio"
      }
    } catch (err) {
      console.error(err);
      error = "" + err;
    }
  } else {
    error = "ERROR: symbol or shares not provided";
  }

  // Generate the output
  let output_error = {
    error: error
  };
  portfolio[0].cash = Number(cash);
  portfolio[0].stock_value -= Number(cost);
  let output = portfolio.slice();
  output.splice(0, 0, output_error);

  portfolioString = JSON.stringify(portfolio, null, 2);
  console.log("portfolioString: ", portfolioString);

  // Let's generate some artificial delay!
  await delay(2000);

  // Send it back to the frontend.
  res.json(output);
}

