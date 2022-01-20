const request = require("supertest");
const mongoose = require("mongoose");
const { getType } = require("jest-get-type");
const app = require("../../app");
const { User } = require("../../models");

require("dotenv").config();

const { DB_TEST_HOST } = process.env;

describe("test auth", () => {
  let server;
  beforeAll(() => (server = app.listen(3000)));
  afterAll(() => server.close());

  const testUserData = {
    name: "TestName",
    email: "test-email@mail.com",
    password: "testpassword",
  };

  beforeEach((done) => {
    mongoose.connect(DB_TEST_HOST).then(async () => {
      await request(app).post("/api/auth/signup").send(testUserData);
      done();
    });
  });

  afterEach((done) => {
    mongoose.connection.db.dropCollection("users", () =>
      mongoose.connection.close(() => done())
    );
  });

  test("test login route", async () => {
    const loginData = {
      email: testUserData.email,
      password: testUserData.password,
    };

    const response = await request(app).post("/api/auth/login").send(loginData);

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(getType(response.body.user.email)).toBe("string");
    expect(getType(response.body.user.subscription)).toBe("string");

    const user = await User.find({ email: loginData.email });
    expect(user.length).not.toBe(0);
  });
});
