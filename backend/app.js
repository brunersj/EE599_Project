"use strict";

global.fetch = require("node-fetch");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
var mongo = require('mongodb');

// We need cors middleware to bypass CORS security in browsers.
const cors = require("cors");


app.use(express.static("static"));
app.use(cors());

let port = 5000;

// initialize account balance to $10000

let cash = 10000;

let portfolio = [];

// let stock = {
//   symbol: "",
//   shares: [],
//   total_shares: ,
//   prices: []
// }



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
async function getQuote(req_symbol) {
  const iex_key = 'pk_a8ed94273cbb45918ade3846ab74bb26';
  const iex_api_url = `https://cloud.iexapis.com/stable/stock/${req_symbol}/batch?types=quote&token=${iex_key}`;
  const response = await fetch(iex_api_url);
  const json = await response.json();
  let price = json.quote.iexRealtimePrice;
  console.log(json.quote.iexRealtimePrice);
  return price;
}

/**
 * The default path
 */
app.get("/", async function (req, res) {
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("I got a query!");
    handleGet(res, res, req.query);
  }
});

/**
 * route get request to /quote path
 */
app.get("/quote", async function (req, res) {
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
  console.log("query: ", JSON.stringify(query));
  // If there was a query (a query string was sent)
  if (
    query !== undefined &&
    query.symbol !== undefined
  ) {
    console.log("This is a quote query");
    req_symbol = query.symbol;
    price = await getQuote(req_symbol);
  } else {
    error = "ERROR: symbol not provided";
  }

  // Generate the output
  let output = {
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
  res.send(outputString);

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
  let req_shares;
  console.log("body: ", JSON.stringify(body));
  // If there was a body (a body string was sent)
  if (
    body !== undefined &&
    body.symbol !== undefined &&
    body.shares !== undefined
  ) {
    console.log("This is a buy request");
    req_symbol = body.symbol;
    req_shares = parseInt(body.shares);
    price = await getQuote(req_symbol);
    // **to do** check for valid price / symbol

    if (price * req_shares <= cash) {
      cash = parseFloat((cash - price * req_shares).toFixed(2));
      console.log("cash: ", cash);
      console.log("cost: ", req_shares * price);

      // record purchase to portfolio

      // if symbol already exists in portfolio, push # of shares @ price purchased to portfolio
      if (portfolio.find(o => o.symbol === req_symbol)) {
        var existing_stock = portfolio.find(o => o.symbol === req_symbol);

        existing_stock.shares.push(req_shares);
        existing_stock.total_shares.push(existing_stock.total_shares + req_shares);
        existing_stock.prices.push(price);
      } else {
        // else, add to portfolio
        let stock = {
          symbol: req_symbol,
          shares: [req_shares],
          total_shares: req_shares,
          prices: [price]
        }
        portfolio.push(stock);
      }
    } else { //insufficient funds
      error = "ERROR: insufficient funds"
    }
  } else {
    error = "ERROR: symbol not provided";
  }

  // Generate the output
  let output = {
    error: error
  };

  // Convert output to JSON
  let outputString = JSON.stringify(output, null, 2);
  console.log("outputString: ", outputString);

  // Let's generate some artificial delay!
  await delay(2000);

  // Send it back to the frontend.
  res.send(outputString);

  portfolioString = JSON.stringify(portfolio, null, 2);
  console.log("portfolioString: ", portfolioString);

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
  let req_shares;
  console.log("body: ", JSON.stringify(body));
  // If there was a body (a body string was sent)
  if (
    body !== undefined &&
    body.symbol !== undefined &&
    body.shares !== undefined
  ) {
    console.log("This is a sell request");
    req_symbol = body.symbol;
    req_shares = parseInt(body.shares);
    let req_shares_copy = req_shares;
    price = await getQuote(req_symbol);
    // **to do** check for valid price / symbol


    if (portfolio.find(o => o.symbol === req_symbol)) {
      //sum of shares of requested symbol:
      var existing_stock = portfolio.find(o => o.symbol === req_symbol);
      var sum = existing_stock.shares.reduce(function (a, b) {
        return a + b;
      }, 0);
      // check if portfolio shares > shares requested to sell 
      if (sum >= req_shares) {
        while (req_shares > 0) {
          let sell_shares = existing_stock.shares.pop();
          if (req_shares >= sell_shares) {
            req_shares = req_shares - sell_shares;
          } else {
            sell_shares = sell_shares - req_shares;
            // push front balance of shares not sold
            existing_stock.shares.unshift(sell_shares);
            req_shares = 0;
          }

        }
        existing_stock.total_shares -= req_shares_copy;
        cash = parseFloat((cash + price * req_shares_copy).toFixed(2));
        console.log("cash: ", cash);
      } else { //insufficient shares
        error = "ERROR: insufficient shares to complete sale"
      }
    }
    else {
      error = "ERROR: symbol not found in portfolio"
    }
  } else {
    error = "ERROR: symbol or shares not provided";
  }

  // Generate the output
  let output = {
    error: error
  };

  // Convert output to JSON
  let outputString = JSON.stringify(output, null, 2);
  console.log("outputString: ", outputString);

  // Let's generate some artificial delay!
  await delay(2000);

  // Send it back to the frontend.
  res.send(outputString);

  portfolioString = JSON.stringify(portfolio, null, 2);
  console.log("portfolioString: ", portfolioString);

}

