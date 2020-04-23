/**
 * Set the initial portfolio values
 */
function initialize() {
  document.getElementById("balance").innerHTML = "$10,000";
  let loader = document.getElementById("loader");
  loader.style.display = "none";

}

initialize();

/**
 * Handle the click event on Submit (Generate) button
 */
document.getElementById("submit_trade").onclick = function () {
  submit_trade().catch(err => console.error(err));
};

/**
 * Handle the click event on Submit (Generate) button
 */
document.getElementById("submit_quote").onclick = function () {
  submit_quote().catch(err => console.error(err));
};

/**
 * An async function to send the buy/sell request to the backend.
 */
async function submit_trade() {
  console.log("In trade submit!");

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
    let payload = {
      symbol: symbol,
      shares: shares
    };
    // axios({
    //   url: request,
    //   method: 'post',
    //   data: payload
    // })
    //   .then((res) => {
    //     console.log("post res:", res);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    // axios.post(request, {
    //   form: {
    //     symbol: symbol,
    //     shares: shares
    //   }
    // })
    //   .then((res) => {
    //     console.log("post res:", res);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    const data = await axios.post(request, {
      symbol: symbol,
      shares: shares
    });

    console.log("data.data: ", JSON.stringify(data.data, null, 2));


    // Display the random value
    trade_status_element.innerHTML = "success";

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
async function submit_quote() {
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
