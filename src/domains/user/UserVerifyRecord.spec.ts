import { UserVerifyRecord, VerifyType } from "./UserVerifyRecord";

var expect = require("chai").expect;

describe("UserVerifyRecord", () => {
  describe("create pair with code", () => {
    const [code, dao] = UserVerifyRecord.createPair(
      VerifyType.LOGIN,
      1,
      "1234"
    );
    it("code === '1234'", () => {
      expect(code).to.equal("1234");
    });
    const verify = new UserVerifyRecord().restore(dao);
    it("verify.check(code)", () => {
      expect(verify.check(code)).to.be.true;
    });
    const verifyExp = new UserVerifyRecord().restore(
      Object.assign(dao, { ttl: 1 })
    );
    it("verify.check(code) mast throw error because ttl ", () => {
      expect(() => verifyExp.check(code)).to.throws();
    });

    it("verify.check(code) mast throw error because code is not valid", () => {
      expect(() => verify.check("4321")).to.throws();
    });
  });

  describe("create pair without code", () => {
    const [code, dao] = UserVerifyRecord.createPair(VerifyType.LOGIN, 1);
    it("code is not undefuned", () => {
      expect(code).to.not.undefined;
      expect(code).to.be.a("string");
    });
    const verify = new UserVerifyRecord().restore(dao);
    it("verify.check(code)", () => {
      expect(verify.check(code)).to.be.true;
    });
    const verifyExp = new UserVerifyRecord().restore(
      Object.assign(dao, { ttl: 1 })
    );
    it("verify.check(code) mast throw error because ttl ", () => {
      expect(() => verifyExp.check(code)).to.throws();
    });

    it("verify.check(code) mast throw error because code is not valid", () => {
      expect(() => verify.check("4321")).to.throws();
    });
  });
});
