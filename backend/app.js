"use strict";

global.fetch = require("node-fetch");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// We need cors middleware to bypass CORS security in browsers.
const cors = require("cors");


app.use(express.static("static"));
app.use(cors());

let port = 5000;


/**
 * A promise that resolves after t ms.
 * @param {Number} t 
 */
const delay = function (t) {
  return new Promise(resolve => setTimeout(resolve, t));
};

/**
 * Get stock quote from IEX API
 * @param {String} symbol
 */
async function getQuote(symbol) {
  const iex_key = 'pk_a8ed94273cbb45918ade3846ab74bb26';
  const iex_api_url = `https://cloud.iexapis.com/stable/stock/${symbol}/batch?types=quote&token=${iex_key}`;
  const response = await fetch(iex_api_url);
  const json = await response.json();
  let price = json.quote.iexRealtimePrice;
  // console.log(json.quote.delayedPrice);
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
app.get("/buy", async function (req, res) {
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("I got a query!");
    handleBuyGet(res, res, req.query);
  }
});

app.listen(port, err => {
  console.log(`Listening on port: ${port}`);
});

//-----------------------------------------------------------------------------
/**
 * Handles a Get request
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} query 
 */
async function handleGet(req, res, query) {
  let error = "NO_ERROR";
  let type;
  let symbol;
  let shares;

  console.log("query: ", JSON.stringify(query));
  //quote query
  if (
    query !== undefined &&
    query.type == "quote" &&
    query.symbol !== undefined
  ) {
    console.log("This is a quote query");
    type = query.type;
    symbol = query.symbol;

  } else if ( // buy query
    query !== undefined &&
    query.type == "buy" &&
    query.symbol !== undefined &&
    query.shares !== undefined
  ) {
    type = query.type;
    symbol = query.symbol;
    shares = parseInt(query.shares);
    console.log("This is a buy query");
  } else if ( // sell query
    query !== undefined &&
    query.type == "sell" &&
    query.symbol !== undefined &&
    query.shares !== undefined
  ) {
    type = query.type;
    symbol = query.symbol;
    shares = parseInt(query.shares);
    console.log("This is a sell query");

  } else {
    error = "ERROR: min_value or max_value not provided";
  }

  // Generate the output
  let output = {
    type: type,
    symbol: symbol,
    shares: shares,
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
 * Handles a Get request for quote
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} query 
 */
async function handleQuoteGet(req, res, query) {
  let error = "NO_ERROR";
  let symbol;
  let price;
  console.log("query: ", JSON.stringify(query));
  // If there was a query (a query string was sent)
  if (
    query !== undefined &&
    query.symbol !== undefined
  ) {
    console.log("This is a quote query");
    symbol = query.symbol;
    price = await getQuote(symbol);
  } else {
    error = "ERROR: symbol not provided";
  }

  // Generate the output
  let output = {
    symbol: symbol,
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


// //-----------------------------------------------------------------------------
// /**
//  * Handles a Get request
//  * @param {Object} req 
//  * @param {Object} res 
//  * @param {Object} query 
//  */
// async function handleGet(req, res, query) {
//   let error = "NO_ERROR";
//   let randomValue;
//   let min_value;
//   let max_value;

//   console.log("query: ", JSON.stringify(query));
//   // If there was a query (a query string was sent)
//   if (
//     query !== undefined &&
//     query.min_value !== undefined &&
//     query.max_value !== undefined
//   ) {
//     // Convert min_value and max_value from String to integer
//     min_value = parseInt(query.min_value);
//     max_value = parseInt(query.max_value);

//     // Generate a random number
//     randomValue = generateRandomNumber(min_value, max_value);
//     console.log("randomValue: ", randomValue);
//   } else {
//     error = "ERROR: min_value or max_value not provided";
//   }

//   // Generate the output
//   let output = {
//     randomValue: randomValue,
//     min_value: min_value,
//     max_value: max_value,
//     error: error
//   };

//   // Convert output to JSON
//   let outputString = JSON.stringify(output, null, 2);
//   console.log("outputString: ", outputString);

//   // Let's generate some artificial delay!
//   await delay(2000);

//   // Send it back to the frontend.
//   res.send(outputString);
// }
