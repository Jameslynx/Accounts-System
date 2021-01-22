class PassParser {
  checkLength() {
    return this.password.length >= 8;
  }

  checkLower() {
    return /[a-z]/.test(this.password);
  }

  checkUpper() {
    return /[A-Z]/.test(this.password);
  }

  checkNumbers() {
    return /\d/.test(this.password);
  }

  checkSymbols() {
    return /[^0-9a-zA-Z]/.test(this.password);
  }

  test(password) {
    let errors = [
      { msg: "Password should be atleast 8 characters long" },
      { msg: "Password should contain LowerCase letter(s)" },
      { msg: "Password should contain UpperCase letter(s)" },
      { msg: "Password should contain Digit(s)" },
      { msg: "Password should contain Symbol(s)" },
    ];

    this.password = password;
    if (
      this.password &&
      this.checkLength() &&
      this.checkLower() &&
      this.checkUpper() &&
      this.checkNumbers() &&
      this.checkSymbols()
    ) {
      return [];
    } else return errors;
  }
}

module.exports = new PassParser();
