const chai = require("chai");
const assert = chai.assert;

const PassTest = require("../config/passparser");

describe("Unit Tests", () => {
  describe("Password Parser tests", () => {
    // Missing password
    it("Missing password", () => {
      let result = PassTest.test();
      assert.isArray(result);
      assert.lengthOf(result, 5, "Array of error messages");
    });

    // Short password
    it("Short password (less than 8 characters)", () => {
      let result = PassTest.test("Short#7");
      assert.isArray(result);
      assert.lengthOf(result, 5, "Array of error messages");
    });

    // Password lacking Digits
    it("Password lacking digits (8 chars long)", () => {
      let result = PassTest.test("Octopus#");
      assert.isArray(result);
      assert.lengthOf(result, 5, "Array of error messages");
    });

    // Password lacking Digits
    it("Password lacking letters (8 chars long)", () => {
      let result = PassTest.test("1234567#");
      assert.isArray(result);
      assert.lengthOf(result, 5, "Array of error messages");
    });

    // Password lacking lowercase letters
    it("Password lacking lowercase letters (8 chars long)", () => {
      let result = PassTest.test("HELIUM#8");
      assert.isArray(result);
      assert.lengthOf(result, 5, "Array of error messages");
    });

    // Password lacking uppercase letters
    it("Password lacking uppercase letters (8 chars long)", () => {
      let result = PassTest.test("helium#8");
      assert.isArray(result);
      assert.lengthOf(result, 5, "Array of error messages");
    });

    // Password lacking symbols
    it("Password lacking symbols (8 chars long)", () => {
      let result = PassTest.test("helium78");
      assert.isArray(result);
      assert.lengthOf(result, 5, "Array of error messages");
    });

    // Password with digits, symbols and lowercase, uppercase letters (8 chars long)
    it("Password with digits, symbols and lowercase, uppercase letters (8 chars long)", () => {
      let result = PassTest.test("Helium#8");
      assert.isArray(result);
      assert.isEmpty(result, "no error messages");
    });
  });
});
