# EE599 Final Project - Mock Stock 
Stock Market Simulator

This project requirement was to develop a complete software solution for an industrial problem. I designed a fullstack project for mock stock market trading using real-time market data in a risk-free environment called Mock Stock. 

<img alt="highlevel_workflow" src="https://github.com/brunersj/EE599_Project/blob/master/highlevelWorkflowScreenshot.png?raw=true" width="600" text-align="center">

## Functionality and Implementation
- The frontend web page is broken into three parts.
  1. Balances and Positions:
      - The current portfolio balances are displayed as well as a table providing a breakdown of each stock in the portfolio. This table includes relevant information such as number of shares owned, current market value, dollar and percent gain, etc. This information can be reloaded using a refresh button that sends an HTTP GET request to the backend. The backend responds with the portfolio array that is processed and displayed by the frontend.
  2. Get Quote:
      - A user can enter a stock symbol, and it is sent to the backend using HTTP GET request. The backend responds with the current stock price and full company name.
  3. Initiate New Trade:
      - A user can choose to buy / sell `x` shares of `y` company given there are sufficient funds in the account. The frontend sends theses parameters to the backend using an HTTP POST request. If a buy is placed, the backend increases shares of this stock in the portfolio and credits the cash account for the transaction. If a sell is placed, the backend reduces shares of this stock in the portfolio and debits the cash account for the transaction. In both cases, the backend responds with the updated portfolio array that is processed and displayed by the frontend.

<img alt="workflow" src="https://github.com/brunersj/EE599_Project/blob/master/workflowScreenshot.png?raw=true" width="500">

- The backend is a NodeJS server that processes the HTTP GET and HTTP POST requests based on four route paths:
  1. `/refresh`:
      - The backend will update the portfolio and account values based on the most recent quotes of each stock in the portfolio. The backend responds to the frontend with these updates.
  2. `/quote`:
      - The backend will query the IEX Cloud API with the `req_symbol`. If the symbol is valid, the IEX Cloud API will return a quote for the symbol including the current price per share. The backend responds to the frontend with this value and the full stock name.
  3. `/buy`:
      - The backend retrieves the updated share price, calculates the cost of the transactions, and adds these shares to the portfolio if there are sufficient funds in the account. The backend responds to the frontend with the updated portfolio.
  4. `/sell`:
      - The backend retrieves the updated share price, calculates the cost of the transactions, and deducts these shares from the portfolio if there are sufficient funds in the account. The backend responds to the frontend with the updated portfolio.

By default frontend listens on port 3000, and backend listens on port 5000.

## Future Work
- Support multi-user portfolios with frontend login
- Leverage Bootstrap4 for frontend dev
- Develop and test performance of trading algorithms such as Hidden Markov Models

# Install NodeJS

You can install NodeJs from [here](https://nodejs.org/en/download/).

# Running this package

To download and install:

```bash
git clone https://github.com/brunersj/EE599_Project.git
cd nodejs_project
npm install
```

## Running Backend:
Register with [IEX Cloud](https://iexcloud.io) to generate your own API Token. Replace `iex_key` in `/backend/app.js` with your API Token.
```bash
cd backend
node app.js
```

You can test backend by installing and running [Postman](https://www.postman.com/downloads/):

<img alt="Backend" src="https://github.com/brunersj/EE599_Project/blob/master/backend/screenshot.png?raw=true" width="700">


## Running Frontend:
```bash
cd frontend
node app.js
```

Then open your browser to http://localhost:3000:

<img alt="Frontend1" src="https://github.com/brunersj/EE599_Project/blob/master/frontend/screenshot.png?raw=true" width="700">

Conditional cell value color formatting for gain/loss:
<img alt="Frontend2" src="https://github.com/brunersj/EE599_Project/blob/master/frontend/gain_loss_color.png?raw=true" width="700">

## Running Tests:
Backend testing using [Chai](https://www.chaijs.com) and [Mocha](https://mochajs.org)

```bash
npm test
```

## Youtube Demo Video:
You can watch this demo [here](https://youtu.be/WHd30ijnD-U).
