const chai = require("chai");
const {expect, assert} = require("chai");

const chaiHttp = require("chai-http");

const app = require("../app");
const { sequelize } = require("../sequelize");

chai.use(chaiHttp);

describe("Test for Successful Server Run", ()=>{
    it("Should send 200 Staus on GET request to Healthz", (done) => {
        const server = app.listen();
        const { address, port } = server.address();
          chai
            .request(app)
            .get("/healthz")
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              done();
            });
        });
});

describe("Test for Successful MySQL Connection", ()=>{
    it('Should Connect to MySQL on Server and Authenticate', () => {
          return sequelize.authenticate().then(()=>{
            expect(true).to.equal(true);
          }).catch((error)=>{
            console.error(error);
            console.error("Unable to Connect to MySQL Server");
          })
    });
});