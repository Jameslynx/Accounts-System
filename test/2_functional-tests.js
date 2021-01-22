const chai = require("chai");
const assert = chai.assert;

const server = require("../server"); /** import the express app **/
const chaiHttp = require("chai-http"); /** require the chai-http plugin **/
chai.use(chaiHttp); /** use the chai-http plugin **/

const codes = require("../models/codes"); /** import code model **/

describe("Functional Tests", () => {
  before(function () {
    return new Promise((resolve, reject) => {
      server.on("appStarted", function () {
        return resolve();
      });
    });
  });

  describe("Get /", () => {
    it("/", (done) => {
      chai
        .request(server) // server is the express app
        .get("/")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.include(res.text, "Register");
          assert.include(res.text, "Login");
          done();
        });
    });
  });

  describe("Get /users", () => {
    it("/users/register", (done) => {
      chai
        .request(server)
        .get("/users/register")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Name");
          assert.include(res.text, "Email");
          done();
        });
    });

    it("/users/login", (done) => {
      chai
        .request(server)
        .get("/users/login")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Email");
          assert.include(res.text, "Password");
          done();
        });
    });
  });

  describe("Post /users/register", () => {
    // Post with empty fields
    it("/users/register; empty fields", (done) => {
      chai
        .request(server)
        .post("/users/register")
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Please fill in all fields");
          done();
        });
    });

    // Post with some fields
    it("/users/register; some fields", (done) => {
      chai
        .request(server)
        .post("/users/register")
        .send({ name: "Jimmy", email: "lynxjimmy@gmail.com" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Please fill in all fields");
          done();
        });
    });

    // Post with mismatch passwords fields
    it("/users/register; mismatch passwords field", (done) => {
      chai
        .request(server)
        .post("/users/register")
        .send({
          name: "Jimmy",
          email: "lynxjimmy@gmail.com",
          password: "password",
          password2: "passord",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Passwords do not match");
          done();
        });
    });

    // Post weak password (lacking symbols, upper and lowercase letters or digits)
    it("/users/register; weak password", (done) => {
      chai
        .request(server)
        .post("/users/register")
        .send({
          name: "Jimmy",
          email: "lynxjimmy@gmail.com",
          password: "password#8",
          password2: "password#8",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(
            res.text,
            "Password should contain LowerCase letter(s)"
          );
          done();
        });
    });

    // Post proper fields
    it("/users/register; proper fields", (done) => {
      chai
        .request(server)
        .post("/users/register")
        .send({
          name: "Jimmy",
          email: "lynxjimmy@gmail.com",
          password: "Password#8",
          password2: "Password#8",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Login link has been sent");
          done();
        });
    });
  });

  describe("Post /users/login", () => {
    // Post empty fields
    it("/users/login; empty fields", (done) => {
      chai
        .request(server)
        .post("/users/login")
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Missing credentials");
          done();
        });
    });

    // Post some fields
    it("/users/login; some fields", (done) => {
      chai
        .request(server)
        .post("/users/login")
        .send({ email: "lynxjimmy@gmail.com" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Missing credentials");
          done();
        });
    });

    // Post wrong password
    it("/users/login; wrong password", (done) => {
      chai
        .request(server)
        .post("/users/login")
        .send({ email: "jymryz@gmail.com", password: "helomambojumbo" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Password incorrect");
          done();
        });
    });

    // Post unregistered email
    it("/users/login; unregistered email", (done) => {
      chai
        .request(server)
        .post("/users/login")
        .send({ email: "lynxjimmy@gmail.com", password: "Password#8" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "account not verified");
          done();
        });
    });

    // Post registered email
    it("/users/login; registered email", (done) => {
      chai
        .request(server)
        .post("/users/login")
        .send({ email: "jymryz@gmail.com", password: "Bloodzone#2" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Dashboard");
          done();
        });
    });
  });

  describe("Get /users/verification/mailAuth/:code/:codeId", () => {
    // existing user and code
    it("Get /users/verification/mailAuth/:code/:codeId", (done) => {
      codes.findOneAndDelete({ email: "lynxjimmy@gmail.com" }, (err, code) => {
        assert.isNull(err);
        assert.isNotNull(code);
        chai
          .request(server)
          .get(`/users/verification/mailAuth/${code.code}/${code._id}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.include(res.text, "Account successfully verified");
            done();
          });
      });
    });
  });

  describe("Post /users/delete", () => {
    // Post empty field
    it("/users/delete; empty field", (done) => {
      chai
        .request(server)
        .post("/users/delete")
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(
            res.text,
            "Account deletion failed; password did not match"
          );
        });
    });
    // Post wrong password
    it("/users/delete; wrong password", (done) => {
      chai
        .request(server)
        .post("/users/delete")
        .send({ password: "helomambojumbo" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(
            res.text,
            "Account deletion failed; password did not match"
          );
        });
    });
    // Post correct password
    it("/users/delete; correct password", (done) => {
      chai
        .request(server)
        .post("/users/delete")
        .send({ password: "Password#8" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.text, "Account successfully closed");
        });
    });
  });
});
