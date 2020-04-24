/**
 * Set the initial portfolio values
 */
function initialize() {
  document.getElementById("balance").innerHTML = "$10,000.00";
  let loader = document.getElementById("loader");
  loader.style.display = "none";

}

initialize();

/**
 * Handle the click event on Submit (Generate) button
 */
document.getElementById("submit_trade").onclick = function () {
  Submit_Trade().catch(err => console.error(err));
};

/**
 * Handle the click event on Submit (Generate) button
 */
document.getElementById("submit_quote").onclick = function () {
  Submit_Quote().catch(err => console.error(err));
};

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

  trade_status_element.innerHTML = "Please wait...";

  // Show the loader element (spinning wheels)
  let loader = document.getElementById("loader");
  loader.style.display = "inline-block";
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

    //  Send an HTTP GET request to the backend

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
        // if backend places order with no error
        if (result[0].error === "NO_ERROR") {
          //const portfolio = JSON.stringify(result, null, 2);
          const portfolio = result.slice();
          console.log(portfolio);
          // update front end portfolio table
          Update_Positions(portfolio);
        }
      })
      .catch(error => console.log('error', error));

    // const portfolio = await fetch(request, requestOptions)
    //   .then(res => res.json())
    //   .then(json => console.log(json))
    //   .catch(error => console.log('error', error));


    // // const data = await axios.get(request);

    // console.log("data.data: ", JSON.stringify(portfolio, null, 2));

    // Display the random value
    trade_status_element.innerHTML = "Order placed";

  } catch (err) {
    trade_status_element.innerHTML = err;
  }
  // Set the cursor back to default
  document.body.style.cursor = "default";

  // Hide loader animation
  loader.style.display = "none";
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
  let symbol = document.getElementById("quote_symbol").value;
  quote_status_element.innerHTML = "Please wait...";


  // Show the loader element (spinning wheels)
  let loader = document.getElementById("loader");
  loader.style.display = "inline-block";
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

        // read error value from backend
        if (data.data.error === "NO_ERROR") {
          // Display the quote value
          quote_price_element.innerHTML = "$" + data.data.price;
          quote_status_element.innerHTML = "Quote recieved";
        }
        else {
          if (data.data.error === "Error: 404") {
            quote_price_element.innerHTML = "";
            quote_status_element.innerHTML = "Unknown symbol provided";
          } else {
            quote_price_element.innerHTML = "";
            quote_status_element.innerHTML = data.data.error;
          }
        }
      } catch (error) {
        console.log("error: ", error);
        throw new Error(error)
      }
    }
  } catch (err) {
    quote_price_element.innerHTML = "";
    quote_status_element.innerHTML = err;
  }



  // Set the cursor back to default
  document.body.style.cursor = "default";

  // Hide loader animation
  loader.style.display = "none";
}

/**
 * Update HTML positions table from backend post response 
 * @param {array} portfolio
 */
function Update_Positions(portfolio) {
  console.log("in Update_Positions()");
  // update balance
  console.log(portfolio[1].balance.toLocaleString('us-US', { style: 'currency', currency: 'USD' }));
  let balance_element = document.getElementById("balance");
  balance_element.innerHTML = portfolio[1].balance.toLocaleString('us-US', { style: 'currency', currency: 'USD' });

  // update table
  var positions_table_element = document.getElementById("table_body");
  positions_table_element.innerHTML = "";
  for (i = 2; i < portfolio.length; i++) {
    var row = positions_table_element.insertRow(i - 2);
    var cell_symbol = row.insertCell(0);
    var cell_shares = row.insertCell(1);
    var cell_cost = row.insertCell(2);
    var cell_market_value = row.insertCell(3);
    var cell_dollar_gain = row.insertCell(4);
    var cell_percent_gain = row.insertCell(5);

    cell_symbol.innerHTML = portfolio[i].symbol;
    cell_shares.innerHTML = portfolio[i].total_shares;
    cell_cost.innerHTML = portfolio[i].total_cost.toLocaleString('us-US', { style: 'currency', currency: 'USD' });
    cell_market_value.innerHTML = portfolio[i].market_value.toLocaleString('us-US', { style: 'currency', currency: 'USD' });
    cell_dollar_gain.innerHTML = (portfolio[i].market_value - portfolio[i].total_cost).toLocaleString('us-US', { style: 'currency', currency: 'USD' });
    cell_percent_gain.innerHTML = (100 * (portfolio[i].market_value - portfolio[i].total_cost) / portfolio[i].total_cost).toFixed(2) + "%";
  }




}
