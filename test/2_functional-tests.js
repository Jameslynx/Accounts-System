require("chromedriver");
const webdriver = require("selenium-webdriver");
const { By, until } = webdriver;

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const driver = new webdriver.Builder().forBrowser("chrome").build();
const assert = chai.assert;
const expect = chai.expect;

const User = require("../models/User");
const logs = require("../models/maillog");
const codes = require("../models/codes");
const server = require("../server");

let clearDatabase = (done) => {
  User.findOneAndDelete({ email: "lynxjimmy@gmail.com" }).then((user) => {
    codes.deleteMany({}).then(() => {
      logs.deleteMany({}).then(() => {
        done();
      });
    });
  });
};

let clearSendKeys = (id, keys) => {
  let element = driver.findElement(By.id(id));
  element.clear();
  return element.sendKeys(keys);
};

describe("End to end Test Suite", (done) => {
  before((done) => {
    server.on("appStarted", () => {
      driver.get("http://localhost:3000").then(function (res) {
        driver.wait(until.elementLocated(By.css("h1>i")), 60000).then(() => {
          clearDatabase(done);
        });
      });
    });
  });

  describe("Post `/users/register` and `/users/verification/mailAuth` tests", (done) => {
    it("Loaded homepage and database", (done) => {
      driver
        .findElement(By.tagName("p"))
        .getAttribute("innerHTML")
        .then((response) => {
          assert.equal("Create and account or login", response);
          driver
            .findElement(By.id("reg-btn"))
            .click()
            .then(() => {
              driver
                .wait(until.elementLocated(By.css("h1>i")), 60000)
                .then(() =>
                  setTimeout(() => {
                    done();
                  }, 3000)
                );
            });
        });
    });

    it("Post /users/register (empty fields)", (done) => {
      driver
        .findElement(By.id("reg-sub"))
        .click()
        .then(() => {
          driver
            .findElement(By.id("errors"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "Please fill in all fields");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/register (some fields)", (done) => {
      driver
        .findElement(By.id("name"))
        .sendKeys("Jimmy")
        .then(() =>
          driver.findElement(By.id("email")).sendKeys("lynxjimmy@gmail.com")
        )
        .then(() => driver.findElement(By.id("reg-sub")).click())
        .then(() => {
          driver
            .findElement(By.id("errors"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "Please fill in all fields");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/register (short password)", (done) => {
      driver
        .findElement(By.id("name"))
        .then(() => clearSendKeys("email", "lynxjimmy@gmail.com"))
        .then(() => clearSendKeys("password", "Passw#7"))
        .then(() => clearSendKeys("password2", "Passw#7"))
        .then(() => driver.findElement(By.id("reg-sub")).click())
        .then(() => {
          driver.findElements(By.id("errors"), 10000).then((response) => {
            assert.isArray(response);
            assert.lengthOf(response, 5);
            setTimeout(() => {
              done();
            }, 3000);
          });
        });
    });

    it("Post /users/register (digitless password)", (done) => {
      driver
        .findElement(By.id("name"))
        .then(() => clearSendKeys("email", "lynxjimmy@gmail.com"))
        .then(() => clearSendKeys("password", "Passwor#"))
        .then(() => clearSendKeys("password2", "Passwor#"))
        .then(() => driver.findElement(By.id("reg-sub")).click())
        .then(() => {
          driver.findElements(By.id("errors"), 10000).then((response) => {
            assert.isArray(response);
            assert.lengthOf(response, 5);
            setTimeout(() => {
              done();
            }, 3000);
          });
        });
    });

    it("Post /users/register (symbolless password)", (done) => {
      driver
        .findElement(By.id("name"))
        .then(() => clearSendKeys("email", "lynxjimmy@gmail.com"))
        .then(() => clearSendKeys("password", "Passwor8"))
        .then(() => clearSendKeys("password2", "Passwor8"))
        .then(() => driver.findElement(By.id("reg-sub")).click())
        .then(() => {
          driver.findElements(By.id("errors"), 10000).then((response) => {
            assert.isArray(response);
            assert.lengthOf(response, 5);
            setTimeout(() => {
              done();
            }, 3000);
          });
        });
    });

    it("Post /users/register (letterless password)", (done) => {
      driver
        .findElement(By.id("name"))
        .then(() => clearSendKeys("email", "lynxjimmy@gmail.com"))
        .then(() => clearSendKeys("password", "123456#8"))
        .then(() => clearSendKeys("password2", "123456#8"))
        .then(() => driver.findElement(By.id("reg-sub")).click())
        .then(() => {
          driver.findElements(By.id("errors"), 10000).then((response) => {
            assert.isArray(response);
            assert.lengthOf(response, 5);
            setTimeout(() => {
              done();
            }, 3000);
          });
        });
    });

    it("Post /users/register (lowercase letters missing password)", (done) => {
      driver
        .findElement(By.id("name"))
        .then(() => clearSendKeys("email", "lynxjimmy@gmail.com"))
        .then(() => clearSendKeys("password", "PASSWO#8"))
        .then(() => clearSendKeys("password2", "PASSWO#8"))
        .then(() => driver.findElement(By.id("reg-sub")).click())
        .then(() => {
          driver.findElements(By.id("errors"), 10000).then((response) => {
            assert.isArray(response);
            assert.lengthOf(response, 5);
            setTimeout(() => {
              done();
            }, 3000);
          });
        });
    });

    it("Post /users/register (uppercase letters missing password)", (done) => {
      driver
        .findElement(By.id("name"))
        .then(() => clearSendKeys("email", "lynxjimmy@gmail.com"))
        .then(() => clearSendKeys("password", "passwo#8"))
        .then(() => clearSendKeys("password2", "passwo#8"))
        .then(() => driver.findElement(By.id("reg-sub")).click())
        .then(() => {
          driver.findElements(By.id("errors"), 10000).then((response) => {
            assert.isArray(response);
            assert.lengthOf(response, 5);
            setTimeout(() => {
              done();
            }, 3000);
          });
        });
    });

    it("Post /users/register (non-matching passwords)", (done) => {
      driver
        .findElement(By.id("name"))
        .then(() => clearSendKeys("email", "lynxjimmy@gmail.com"))
        .then(() => clearSendKeys("password", "Passwo#8"))
        .then(() => clearSendKeys("password2", "Passwo#7"))
        .then(() => driver.findElement(By.id("reg-sub")).click())
        .then(() => {
          driver
            .findElement(By.id("errors"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "Passwords do not match");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/register (with proper fields)", (done) => {
      driver
        .findElement(By.id("name"))
        .then(() => clearSendKeys("email", "lynxjimmy@gmail.com"))
        .then(() => clearSendKeys("password", "Passwo#8"))
        .then(() => clearSendKeys("password2", "Passwo#8"))
        .then(() => driver.findElement(By.id("reg-sub")).click())
        .then(() => {
          driver
            .findElement(By.id("log-alert"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(
                response,
                "Login link has been sent to your email for verification;"
              );
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });
  });

  describe("Get `/users/verification/mailAuth/:code/:codeId` & `/users/login` tests", (done) => {
    let userId, codeId;
    it("Get /users/verification/mailAuth/:code/:codeId (with no existent :codeId parameter)", (done) => {
      codes.findOne({ email: "lynxjimmy@gmail.com" }, (err, code) => {
        assert.isNull(err);
        assert.isNotNull(code);
        userId = code.code;
        codeId = code._id;
        driver
          .get(
            `http://localhost:3000/users/verification/mailAuth/${userId}/6002fb6e1bf8262cc82a6bb9`
          )
          .then((res) => {
            driver
              .findElement(By.id("error_msg"), 10000)
              .getAttribute("innerHTML")
              .then((response) => {
                assert.include(response, "resend verification link");
                setTimeout(() => {
                  done();
                }, 3000);
              });
          });
      });
    });

    it("Get /users/verification/mailAuth/:code/:codeId (with no existent(different user) :code parameter)", (done) => {
      driver
        .get(
          `http://localhost:3000/users/verification/mailAuth/6002fb6e1bf8262cc82a6bb9/${codeId}`
        )
        .then(() => {
          driver
            .findElement(By.id("error_msg"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "Account does not exist");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Get /users/verification/mailAuth/:code/:codeId (with no existent :code & :codeId parameter)", (done) => {
      driver
        .get(
          `http://localhost:3000/users/verification/mailAuth/6002fb6e1bf8262cc82a6bb9/6002fb6e1bf8262cc82a6bb9`
        )
        .then(() => {
          driver
            .findElement(By.id("error_msg"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "Account does not exist");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Get /users/verification/mailAuth/:code/:codeId (with proper parameters)", (done) => {
      driver
        .get(
          `http://localhost:3000/users/verification/mailAuth/${userId}/${codeId}`
        )
        .then((res) => {
          driver
            .findElement(By.id("success_msg"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "Account successfully verified");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });
  });

  describe("Post `/users/login`", (done) => {
    it("Post /users/login (with empty fields)", (done) => {
      driver
        .findElement(By.id("login"))
        .click()
        .then(() => {
          driver
            .findElement(By.id("error"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "Missing credentials");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/login (with some fields)", (done) => {
      clearSendKeys("email", "lynxjimmy@gmail.com");
      driver
        .findElement(By.id("login"))
        .click()
        .then(() => {
          driver
            .findElement(By.id("error"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "Missing credentials");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/login (with unregistered email)", (done) => {
      clearSendKeys("email", "jimdarkray@gmail.com");
      clearSendKeys("password", "hellohello");
      driver
        .findElement(By.id("login"))
        .click()
        .then(() => {
          driver
            .findElement(By.id("error"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "That email is not registered");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/login (with unverified email)", (done) => {
      clearSendKeys("email", "examplejimmy@gmail.com");
      clearSendKeys("password", "Bloodzone#2");
      driver
        .findElement(By.id("login"))
        .click()
        .then(() => {
          driver
            .findElement(By.id("error"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "account not verified");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/login (with wrong password)", (done) => {
      clearSendKeys("email", "lynxjimmy@gmail.com");
      clearSendKeys("password", "Passwo#7");
      driver
        .findElement(By.id("login"))
        .click()
        .then(() => {
          driver
            .findElement(By.id("error"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "Password incorrect");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/login (with proper fields)", (done) => {
      clearSendKeys("email", "lynxjimmy@gmail.com");
      clearSendKeys("password", "Passwo#8");
      driver
        .findElement(By.id("login"))
        .click()
        .then(() => {
          driver
            .wait(until.elementLocated(By.className("img-thumbnail")), 60000)
            .then(() => {
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });
  });

  describe("Get `/users/logout` and `/users/delete`", (done) => {
    it("Get /users/logout", (done) => {
      driver
        .findElement(By.id("logout"))
        .click()
        .then(() => {
          driver
            .findElement(By.id("success_msg"), 10000)
            .getAttribute("innerHTML")
            .then((response) => {
              assert.include(response, "You are logged out");
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/login", (done) => {
      clearSendKeys("email", "lynxjimmy@gmail.com");
      clearSendKeys("password", "Passwo#8");
      driver
        .findElement(By.id("login"))
        .click()
        .then(() => {
          driver
            .wait(until.elementLocated(By.className("img-thumbnail")), 60000)
            .then(() => {
              setTimeout(() => {
                done();
              }, 3000);
            });
        });
    });

    it("Post /users/delete (wrong password)", (done) => {
      driver
        .findElement(By.id("delete-launcher"), 10000)
        .click()
        .then(() => {
          driver.switchTo().activeElement();
        })
        .then(() => {
          setTimeout(() => {
            clearSendKeys("password", "Passwo#7");
            driver
              .findElement(By.id("delete_btn"), 10000)
              .click()
              .then(() => {
                driver
                  .findElement(By.id("error_msg"), 10000)
                  .getAttribute("innerHTML")
                  .then((response) => {
                    assert.include(
                      response,
                      "Account deletion failed; password did not match"
                    );
                    setTimeout(() => {
                      done();
                    }, 3000);
                  });
              });
          }, 3000);
        });
    });

    it("Post /users/delete (proper password)", (done) => {
      driver
        .findElement(By.id("delete-launcher"), 10000)
        .click()
        .then(() => {
          driver.switchTo().activeElement();
        })
        .then(() => {
          setTimeout(() => {
            clearSendKeys("password", "Passwo#8");
            driver
              .findElement(By.id("delete_btn"), 10000)
              .click()
              .then(() => {
                driver
                  .findElement(By.id("success_msg"), 10000)
                  .getAttribute("innerHTML")
                  .then((response) => {
                    assert.include(response, "Account successfully closed");
                    setTimeout(() => {
                      done();
                    }, 3000);
                  });
              });
          }, 3000);
        });
    });
  });
});
