/* eslint-disable no-unused-vars */
import request from "supertest";
import { cloneDeep } from "lodash";
import { connectDB } from "./dbHandler";
import user from "../src/models/user";

const serverAddr = "127.0.0.1:9999";

const mockUser = {
  userName: "testguy",
  email: "testmail@testy.com",
  password: "test"
};

const reqBody = { user: mockUser };

describe("User endpoints", () => {
  it("should create a new user", async () => {
    const res = await request(serverAddr)
      .post("/api/auth/signup")
      .send(reqBody);

    expect(res.statusCode).toEqual(201);
  });

  it("should create token and validate the newly created user", async () => {
    const createRes = await request(serverAddr)
      .post("/api/auth/verification")
      .send(reqBody);

    expect(createRes.statusCode).toEqual(201);
    expect(createRes.body.user.userName).toEqual(mockUser.userName);
    expect(createRes.body.user.email).toEqual(mockUser.email);

    const tokenUUID = createRes.body.token_uuid;
    // /?uuid=berkberk
    const validateRes = await request(serverAddr)
      .get("/api/auth/verification")
      .query({ uuid: tokenUUID });

    expect(validateRes.statusCode).toEqual(201);
  });

  it("should login the created user", async () => {
    const loginBody = cloneDeep(reqBody);
    delete loginBody.user.userName;

    const loginRes = await request(serverAddr)
      .post("/api/auth/login")
      .send(loginBody);

    expect(loginRes.statusCode).toEqual(200);
  });

  it("should get user details without authentication", async () => {
    const userBody = { user: { username: mockUser.userName } };
    const userRes = await request(serverAddr)
      .post("/api/auth/preload")
      .send(userBody);

    expect(userRes.statusCode).toEqual(200);
    expect(userRes.body.user.email).toEqual(mockUser.email);
  });

  it("should update an existing user", async () => {
    const userBody = { user: { username: mockUser.userName } };
    const userRes = await request(serverAddr)
      .post("/api/auth/preload")
      .send(userBody);

    expect(userRes.statusCode).toEqual(200);
    expect(userRes.body.user.email).toEqual(mockUser.email);

    const newEmail = "testrocks@testy.com";
    const updateBody = {
      user: { id: userRes.body.user.id, update: { email: newEmail } }
    };
    const updateRes = await request(serverAddr)
      .post("/api/users/update")
      .send(updateBody);
    expect(updateRes.statusCode).toEqual(200);
  });
});
