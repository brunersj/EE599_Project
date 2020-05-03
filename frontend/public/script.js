/**
 * Set the initial portfolio values
 */
function initialize() {
  document.getElementById("cash").innerHTML = "$10,000.00";
  document.getElementById("account_value").innerHTML = "$10,000.00";
  document.getElementById("stock_value").innerHTML = "$0.00";
  document.getElementById("account_dollar_gain").innerHTML = "$0.00";
  document.getElementById("account_percent_gain").innerHTML = "0.00%";
  let quote_loader = document.getElementById("quote_loader");
  quote_loader.style.display = "none";
  let trade_loader = document.getElementById("trade_loader");
  trade_loader.style.display = "none";
  let refresh_loader = document.getElementById("refresh_loader");
  refresh_loader.style.display = "none";

}
initialize();
Submit_Refresh();
/**
 * Handle the click event on place order button
 */
document.getElementById("submit_trade").onclick = function () {
  Submit_Trade().catch(err => console.error(err));
};

/**
 * Handle the click event on get quote button
 */
document.getElementById("submit_quote").onclick = function () {
  Submit_Quote().catch(err => console.error(err));
};

/**
 * Handle the click event on refresh portfolio button
 */
document.getElementById("submit_refresh").onclick = function () {
  Submit_Refresh().catch(err => console.error(err));
};

/**
 * An async function to send the refresh request to the backend.
 */
async function Submit_Refresh() {
  console.log("In submit_Refresh!");

  let refresh_status_element = document.getElementById("refresh_status");
  refresh_status_element.innerHTML = "Please wait...";
  // Set the mouse cursor to hourglass
  document.body.style.cursor = "wait";
  // Show the loader element (spinning wheels)
  let refresh_loader = document.getElementById("refresh_loader");
  refresh_loader.style.display = "inline-block";

  try {
    let request = `http://127.0.0.1:5000/refresh`;
    console.log("request: ", request);

    // Send an HTTP GET request to the backend
    const data = await axios.get(request);
    console.log("data:", data);
    //console.log("data.data: ", JSON.stringify(data.data, null, 2));

    // read error value from backend and display refresh status
    if (data.data[0].error === "NO_ERROR") {
      Update_Positions(data.data);
    } else {
      refresh_status_element.innerHTML = data.data[0].error;
    }

  } catch (error) {
    console.log("error: ", error);
    refresh_status_element.innerHTML = error;
    throw new Error(error);
  }

  // Set the cursor back to default
  document.body.style.cursor = "default";

  // Hide loader animation
  refresh_loader.style.display = "none";
}


/**
 * An async function to send the quote request to the backend.
 */
async function Submit_Quote() {
  console.log("In submit_quote!");

  // Set the mouse cursor to hourglass
  document.body.style.cursor = "wait";

  // Accessing the div that has quote elements 
  let quote_status_element = document.getElementById("quote_status");
  let quote_price_element = document.getElementById("quote_price");
  let quote_company_name_element = document.getElementById("quote_company_name");
  let symbol = document.getElementById("quote_symbol").value;
  quote_status_element.innerHTML = "Please wait...";

  // Show the loader element (spinning wheels)
  let quote_loader = document.getElementById("quote_loader");
  quote_loader.style.display = "inline-block";

  try {
    if (symbol === "") {
      throw new Error("No symbol entered");
    } else {
      try {
        // Get the symbol from the user 
        let request = `http://127.0.0.1:5000/quote/?symbol=${symbol}`;
        console.log("request: ", request);

        // Send an HTTP GET request to the backend
        const data = await axios.get(request);

        console.log("data.data: ", JSON.stringify(data.data, null, 2));

        // read error value from backend and display quote status
        if (data.data.error === "NO_ERROR") {
          // Display the quote value
          quote_price_element.innerHTML = data.data.price.toLocaleString('us-US', { style: 'currency', currency: 'USD' });
          quote_company_name_element.innerHTML = data.data.company_name;
          quote_status_element.innerHTML = "Quote sucessfully received at: " + getDateTime();
        }
        else {
          if (data.data.error === "Error: 404") {
            quote_company_name_element.innerHTML = "";
            quote_price_element.innerHTML = "";
            quote_status_element.innerHTML = "Unknown symbol provided";
          } else {
            quote_company_name_element.innerHTML = "";
            quote_price_element.innerHTML = "";
            quote_status_element.innerHTML = data.data.error;
          }
        }
      } catch (error) {
        console.log("error: ", error);
        throw new Error(error);
      }
    }
  } catch (err) {
    quote_company_name_element.innerHTML = "";
    quote_price_element.innerHTML = "";
    quote_status_element.innerHTML = err;
  }



  // Set the cursor back to default
  document.body.style.cursor = "default";

  // Hide loader animation
  quote_loader.style.display = "none";
}

/**
 * An async function to send the buy/sell request to the backend.
 */
async function Submit_Trade() {
  console.log("In submit trade");

  // Set the mouse cursor to hourglass
  document.body.style.cursor = "wait";

  // Accessing user entered parameters for trade
  let trade_status_element = document.getElementById("trade_status");
  let trade_type = "none";
  let buy_select_element = document.getElementById("buy_select");
  let sell_select_element = document.getElementById("sell_select");
  let symbol = document.getElementById("trade_symbol").value;
  let shares = document.getElementById("trade_shares").value;
  let portfolio = [];
  trade_status_element.innerHTML = "Please wait...";

  // Show the loader element (spinning wheels)
  let trade_loader = document.getElementById("trade_loader");
  trade_loader.style.display = "inline-block";
  // get value from trade type radio buttons
  try {
    // check if and only one trade type is selected with XOR
    if (buy_select_element.checked ^ sell_select_element.checked) {
      if (buy_select_element.checked) {
        trade_type = "buy";
      }
      else {
        trade_type = "sell";
      }
    } else {
      trade_status_element.innerHTML = "error"
      throw new Error("Buy or sell not selected");

    }
    console.log("trade type: ", trade_type);

    // check if stock symbol valid
    if (symbol === "") {
      throw new Error("No symbol entered");
    }
    console.log(symbol);
    if (!symbol.match(/^[a-z]+$/i)) {
      throw new Error("Symbol must have only letters")
    }
    // check if shares valid
    if (!shares.match(/^[0-9]+$/)) {
      throw new Error("Shares must be numerical")
    }

    let request = `http://127.0.0.1:5000/${trade_type}`;
    console.log("request: ", request);

    //  Send an HTTP POST request to the backend

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("symbol", symbol);
    urlencoded.append("shares", shares);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow'
    };

    await fetch(request, requestOptions)
      .then(res => res.json())
      .then(result => {
        console.log(result);

        portfolio = result.slice();
        console.log(portfolio);
        // if backend places order with no error
        if (result[0].error === "NO_ERROR") {

          // update front end portfolio table
          Update_Positions(portfolio);
        }
      })
      .catch(error => {
        console.log('error', error);
        throw new Error(error);
      });

    console.log("error: ", portfolio[0].error);
    // read error value from backend and display trade status
    if (portfolio[0].error === "NO_ERROR") {
      trade_status_element.innerHTML = "Order sucessfully placed at: " + getDateTime();
    }
    else {
      trade_status_element.innerHTML = portfolio[0].error;
    }
  } catch (err) {
    trade_status_element.innerHTML = err;
  }
  // Set the cursor back to default
  document.body.style.cursor = "default";

  // Hide loader animation
  trade_loader.style.display = "none";
}

/**
 * Update HTML positions table from backend post response 
 * @param {array} portfolio
 */
function Update_Positions(portfolio) {
  console.log("in Update_Positions()");
  // update balance
  console.log(portfolio[1]);
  let cash_element = document.getElementById("cash");
  let stock_value_element = document.getElementById("stock_value");
  let account_value_element = document.getElementById("account_value");
  let account_dollar_gain_element = document.getElementById("account_dollar_gain");
  let account_percent_gain_element = document.getElementById("account_percent_gain");
  let refresh_status_element = document.getElementById("refresh_status");

  cash_element.innerHTML = portfolio[1].cash.toLocaleString('us-US', { style: 'currency', currency: 'USD' });
  stock_value_element.innerHTML = portfolio[1].stock_value.toLocaleString('us-US', { style: 'currency', currency: 'USD' });
  account_value_element.innerHTML = (portfolio[1].cash + portfolio[1].stock_value).toLocaleString('us-US', { style: 'currency', currency: 'USD' });
  account_dollar_gain_element.innerHTML = (portfolio[1].cash + portfolio[1].stock_value - 10000).toLocaleString('us-US', { style: 'currency', currency: 'USD' });
  account_percent_gain_element.innerHTML = (100 * (portfolio[1].cash + portfolio[1].stock_value - 10000) / 10000).toFixed(2) + "%";

  // color balance text for gain / loss
  // change text to green if positive gain
  if (portfolio[1].cash + portfolio[1].stock_value > 10000) {
    account_dollar_gain_element.style.color = 'green';
    account_percent_gain_element.style.color = 'green';
  } else if (portfolio[1].cash + portfolio[1].stock_value < 10000) {
    // change text to red if loss
    account_dollar_gain_element.style.color = 'red';
    account_percent_gain_element.style.color = 'red';
  } else if (portfolio[1].cash + portfolio[1].stock_value == 10000) {
    // change text to black if no gain or loss
    account_dollar_gain_element.style.color = 'black';
    account_percent_gain_element.style.color = 'black';
  }

  // clear table for refresh
  var positions_table_element = document.getElementById("table_body");
  positions_table_element.innerHTML = "";

  // update table if portfolio is not empty
  if (portfolio[0].error === "NO_ERROR") {
    for (i = 2; i < portfolio.length; i++) {
      var row = positions_table_element.insertRow(i - 2);
      var cell_company_name = row.insertCell(0);
      var cell_symbol = row.insertCell(1);
      var cell_shares = row.insertCell(2);
      var cell_cost = row.insertCell(3);
      var cell_market_value = row.insertCell(4);
      var cell_dollar_gain = row.insertCell(5);
      var cell_percent_gain = row.insertCell(6);

      cell_company_name.innerHTML = portfolio[i].company_name;
      cell_symbol.innerHTML = portfolio[i].symbol;
      cell_shares.innerHTML = portfolio[i].total_shares;
      cell_cost.innerHTML = portfolio[i].total_cost.toLocaleString('us-US', { style: 'currency', currency: 'USD' });
      cell_market_value.innerHTML = portfolio[i].market_value.toLocaleString('us-US', { style: 'currency', currency: 'USD' });
      cell_dollar_gain.innerHTML = (portfolio[i].market_value - portfolio[i].total_cost).toLocaleString('us-US', { style: 'currency', currency: 'USD' });
      cell_percent_gain.innerHTML = (100 * (portfolio[i].market_value - portfolio[i].total_cost) / portfolio[i].total_cost).toFixed(2) + "%";

      // change text to green if positive gain
      if ((portfolio[i].market_value - portfolio[i].total_cost) > 0) {
        cell_dollar_gain.style.color = 'green';
        cell_percent_gain.style.color = 'green';
      } else if ((portfolio[i].market_value - portfolio[i].total_cost) < 0) {
        // change text to red if loss
        cell_dollar_gain.style.color = 'red';
        cell_percent_gain.style.color = 'red';
      } else if ((portfolio[i].market_value - portfolio[i].total_cost) == 0) {
        // change text to black if no gain or loss
        cell_dollar_gain.style.color = 'black';
        cell_percent_gain.style.color = 'black';
      }
    }

    refresh_status_element.innerHTML = "Last updated: " + getDateTime();
  } else {
    refresh_status_element.innerHTML = "Portfolio is empty - Last updated: " + getDateTime();
  }
}

/**
 * Function to get current time in users time zone 
 */
function getDateTime() {

  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + ":" + month + ":" + day + " @ " + hour + ":" + min + ":" + sec;

}