import {
  API_KEY_HEADER,
  CONTEXT_DEMO_DELAY_MS,
  USERS_ENDPOINT,
} from "../config/constants.js";
import { createHttpError } from "./utils/http.js";

/** Client for the ReqRes API. */
export class ReqResClient {
  /**
   * Reads baseUrl and apiKey from env.
   * @throws {Error} if API_BASE_URL or REQRES_API_KEY is not set
   */
  constructor() {
    if (!process.env.API_BASE_URL) {
      throw new Error("API_BASE_URL is not set");
    }
    if (!process.env.REQRES_API_KEY) {
      throw new Error("REQRES_API_KEY is not set");
    }
    this.baseUrl = process.env.API_BASE_URL;
    this.apiKey = process.env.REQRES_API_KEY;
  }

  /**
   * Sends a request and returns parsed json.
   * @param {string} endpoint - path after the base url
   * @param {object} [options] - fetch options
   * @returns {Promise<object>} response body
   * @throws {Error} with a `status` field if response is not ok
   */
  async _request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { [API_KEY_HEADER]: this.apiKey, ...options.headers },
    });

    // fetch does not throw on 404/500, so check it here
    if (!response.ok) {
      throw createHttpError(response.status);
    }

    return response.json();
  }

  /**
   * Gets one user.
   * @param {number|string} id - user id
   * @param {object} [options] - extra fetch options (signal for withTimeout)
   * @returns {Promise<object>} user
   */
  async getUser(id, options = {}) {
    return this._request(`${USERS_ENDPOINT}/${id}`, options);
  }

  /**
   * Creates a user.
   * @param {object} userData - request body
   * @returns {Promise<object>} created user
   */
  async createUser(userData) {
    return this._request(USERS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  }

  /**
   * Demo of losing `this` in a callback and fixing it with an arrow function.
   * @returns {void}
   */
  testContext() {
    // 1. regular function has its own `this`, baseUrl is undefined
    setTimeout(function () {
      // eslint-disable-next-line no-console
      console.log(this.baseUrl);
    }, CONTEXT_DEMO_DELAY_MS);

    // 2. method taken out of the object is called without it, `this` is lost
    const fn = this.getUser;
    fn().catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err.message);
    });

    // 3. arrow function has no own `this`, it takes it from testContext
    // (lexical this), so here it is the client
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log(this.baseUrl);
    }, CONTEXT_DEMO_DELAY_MS);
  }
}
