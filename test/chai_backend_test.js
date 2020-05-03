
//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let chai = require('chai');
const expect = chai.expect;
let chaiHttp = require('chai-http');
let backend = require('../backend/app.js');

chai.use(chaiHttp);

describe('/GET quote', () => {
  it('it should GET AAPL quote', (done) => {
    chai.request(backend)
      .get('/quote?symbol=AAPL')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal("NO_ERROR");
        expect(res.body).to.have.property("company_name");
        expect(res.body).to.have.property("symbol");
        expect(res.body).to.have.property("price");
        done();
      });
  });
  it('it should GET quote of invalid symbol', (done) => {
    chai.request(backend)
      .get('/quote?symbol=AFDJS')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal("Error: 404");
        done();
      });
  });
});

describe('/POST buy', () => {
  it('it should buy 10 shares of Apple stock', (done) => {
    let portfolio = {
      symbol: "AAPL",
      shares: "10",
    };

    chai.request(backend)
      .post('/buy')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(portfolio)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body[0].error).to.be.equal("NO_ERROR");

        expect(res.body[1]).to.have.property("cash");
        expect(res.body[1]).to.have.property("stock_value");

        expect(res.body[2]).to.have.property("company_name");
        expect(res.body[2]).to.have.property("symbol");
        expect(res.body[2]).to.have.property("shares");
        expect(res.body[2]).to.have.property("total_shares").to.be.equal(10);
        expect(res.body[2]).to.have.property("prices");
        expect(res.body[2]).to.have.property("total_cost");
        expect(res.body[2]).to.have.property("market_value");
        done();
      });
  });

  it('it should try to buy 100 shares of Apple stock', (done) => {
    let portfolio = {
      symbol: "AAPL",
      shares: "100",
    };

    chai.request(backend)
      .post('/buy')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(portfolio)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body[0].error).to.be.equal("ERROR: insufficient funds");

        expect(res.body[1]).to.have.property("cash");
        expect(res.body[1]).to.have.property("stock_value");

        expect(res.body[2]).to.have.property("company_name");
        expect(res.body[2]).to.have.property("symbol");
        expect(res.body[2]).to.have.property("shares");
        expect(res.body[2]).to.have.property("total_shares").to.be.equal(10);
        expect(res.body[2]).to.have.property("prices");
        expect(res.body[2]).to.have.property("total_cost");
        expect(res.body[2]).to.have.property("market_value");
        done();
      });
  });
});

describe('/POST sell', () => {
  it('it should sell 5 shares of Apple stock', (done) => {
    let portfolio = {
      symbol: "AAPL",
      shares: "5",
    };

    chai.request(backend)
      .post('/sell')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(portfolio)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body[0].error).to.be.equal("NO_ERROR");

        expect(res.body[1]).to.have.property("cash");
        expect(res.body[1]).to.have.property("stock_value");

        expect(res.body[2]).to.have.property("company_name");
        expect(res.body[2]).to.have.property("symbol");
        expect(res.body[2]).to.have.property("shares");
        expect(res.body[2]).to.have.property("total_shares").to.be.equal(5);
        expect(res.body[2]).to.have.property("prices");
        expect(res.body[2]).to.have.property("total_cost");
        expect(res.body[2]).to.have.property("market_value");
        done();
      });
  });

  it('it should try to sell 10 shares of Apple stock', (done) => {
    let portfolio = {
      symbol: "AAPL",
      shares: "10",
    };

    chai.request(backend)
      .post('/sell')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(portfolio)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body[0].error).to.be.equal("ERROR: insufficient shares to complete sale");

        expect(res.body[1]).to.have.property("cash");
        expect(res.body[1]).to.have.property("stock_value");

        expect(res.body[2]).to.have.property("company_name");
        expect(res.body[2]).to.have.property("symbol");
        expect(res.body[2]).to.have.property("shares");
        expect(res.body[2]).to.have.property("total_shares").to.be.equal(5);
        expect(res.body[2]).to.have.property("prices");
        expect(res.body[2]).to.have.property("total_cost");
        expect(res.body[2]).to.have.property("market_value");
        done();
      });
  });
});

describe('/GET refresh', () => {
  it('it should refresh portfolio array', (done) => {
    chai.request(backend)
      .get('/refresh')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body[0].error).to.be.equal("NO_ERROR");

        expect(res.body[1]).to.have.property("cash");
        expect(res.body[1]).to.have.property("stock_value");

        expect(res.body[2]).to.have.property("company_name");
        expect(res.body[2]).to.have.property("symbol");
        expect(res.body[2]).to.have.property("shares");
        expect(res.body[2]).to.have.property("total_shares").to.be.equal(5);
        expect(res.body[2]).to.have.property("prices");
        expect(res.body[2]).to.have.property("total_cost");
        expect(res.body[2]).to.have.property("market_value");
        done();
      });
  });
});

describe('/POST sell', () => {
  it('it should sell remaining 5 shares of Apple stock', (done) => {
    let portfolio = {
      symbol: "AAPL",
      shares: "5",
    };

    chai.request(backend)
      .post('/sell')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(portfolio)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.lengthOf(2);

        expect(res.body[0].error).to.be.equal("NO_ERROR");

        expect(res.body[1]).to.have.property("cash");
        expect(res.body[1]).to.have.property("stock_value");
        done();
      });
  });
});

describe('/GET refresh', () => {
  it('it should refresh portfolio array with an empty portfolio', (done) => {
    chai.request(backend)
      .get('/refresh')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0].error).to.be.equal("Portfolio Empty");

        expect(res.body[1]).to.have.property("cash");
        expect(res.body[1]).to.have.property("stock_value").to.be.equal(0);
        done();
      });
  });
});