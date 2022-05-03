import { AnyUserSpecification } from "./AnyUserSpecification";

var expect = require("chai").expect;

class TestItem {
  constructor(private id: number, private name: string) {}
  toJSON() {
    return { id: this.id, name: this.name };
  }
}
describe("AnyUserSpecification", () => {
  describe("sql script", () => {
    it("where('firstName').like('anton').build()", () => {
      const specification = new AnyUserSpecification();
      const sql = specification.where("firstName").like("anton").build();
      expect(sql).to.be.a("string");
      expect(sql).to.be.equal(`firstName LIKE '%anton%'`);
    });
    it("where('lastName').equal('dzhigurda').build()", () => {
      const specification = new AnyUserSpecification();
      const sql = specification.where("lastName").equal("dzhigurda").build();
      expect(sql).to.be.a("string");
      expect(sql).to.be.equal(`lastName = 'dzhigurda'`);
    });
    it("where('secondName').in(['petrov','ivanov']).build()", () => {
      const specification = new AnyUserSpecification();
      const sql = specification
        .where("secondName")
        .in(["petrov", "ivanov"])
        .build();
      expect(sql).to.be.a("string");
      expect(sql).to.be.equal(`secondName IN ('petrov', 'ivanov')`);
    });
    it("where('id').in([1,2]).where('lastName').equal('dzhigurda').where('firstName').like('anton').build()", () => {
      const specification = new AnyUserSpecification();
      const sql = specification
        .where("id")
        .in([1, 2])
        .where("lastName")
        .equal("dzhigurda")
        .where("firstName")
        .like("anton")
        .build();
      expect(sql).to.be.a("string");
      expect(sql).to.be.equal(
        "id IN ('1', '2') AND lastName = 'dzhigurda' AND firstName LIKE '%anton%'"
      );
    });
  });

  describe("predicat script", () => {
    const items = [
      new TestItem(1, "anton"),
      new TestItem(2, "alex"),
      new TestItem(3, "petrov"),
      new TestItem(4, "igor"),
    ];
    it("where('name').like('ant').buildStrategy()", () => {
      const specification = new AnyUserSpecification();
      const predicat = specification.where("name").like("ant").buildStrategy();
      expect(predicat).to.be.a("function");
      const res = items.filter(predicat);
      expect(res).to.be.lengthOf(1);
      expect(res[0]).to.have.property("name").with.valueOf("anton");
    });
    it("where('id').equal(3).buildStrategy()", () => {
      const specification = new AnyUserSpecification();
      const predicat = specification.where("id").equal(3).buildStrategy();
      expect(predicat).to.be.a("function");
      const res = items.filter(predicat);
      expect(res).to.be.lengthOf(1);
      expect(res[0]).to.have.property("name").with.valueOf("petrov");
    });
    it("where('id').in(2,4).buildStrategy()", () => {
      const specification = new AnyUserSpecification();
      const predicat = specification.where("id").in([2, 4]).buildStrategy();
      expect(predicat).to.be.a("function");
      const res = items.filter(predicat); 
      expect(res).to.be.lengthOf(2);
      expect(res[0]).to.have.property("name").with.valueOf("alex");
      expect(res[1]).to.have.property("name").with.valueOf("igor");
    });

    it("where('id').in([1,2,3]).where('name').equal('a').buildStrategy()", () => {
      const specification = new AnyUserSpecification();
      const predicat = specification
        .where("id")
        .in([1, 2, 3])
        .where("name")
        .like("a")
        .buildStrategy();
      const res = items.filter(predicat);
      expect(res).to.be.lengthOf(2);
      expect(res[0]).to.have.property("name").with.valueOf("anton");
      expect(res[1]).to.have.property("name").with.valueOf("alex");
    });
  });
});
