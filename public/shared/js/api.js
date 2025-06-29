import { lsList, ssList } from "./lists.js";

export const api = {
  busy: false,
  async try(path, body = {}) {
    const token = await lsList.get("token");
    body.token = token;
    let response;

    const local = window.location.origin == "http://127.0.0.1:5500";
    console.log("local", local);
    if (local) {
      response = await this.tryLocal(path, body);
    } else {
      response = await this.tryGlobal(path, body);
    }
    console.log("response", response);
    if (response.status == 401) {
      // await lsList.clearAll();
      // await ssList.clearAll();
      console.error("kickout disabled");
      // userLogin();
    }
    if (response.status == 403) {
      // await lsList.clearAll();
      // await ssList.clearAll();
      console.error("kickout disabled");
      // userLogin();
      // throw new Error("Forbidden");
      return { message: "You can't do this!", code: 403 };
    }
    let json;
    try {
      json = await response.json();
      const logReply = {};
      for (const item in json) {
        logReply[item] = json[item];
      }
      if (response.ok) {
        console.groupCollapsed(
          `${local ? "tryLocal" : "tryGlobal"} ${path}`,
          logReply
        );
        console.groupEnd();
      } else {
        console.error(path, json);
      }

      return json;
    } catch (err) {
      console.error(err);
      console.warn("No json", response);
      return { message: "JSON error", code: 500 };
    }
  },
  async tryLocal(path, body = {}) {
    const content = { body: JSON.stringify(body) };

    try {
      content.method = "POST";
      content.headers = {
        "Content-Type": "application/json",
      };
      const response = await fetch(
        "http://localhost:3002/api/" + path,
        content
      );
      return response;
    } catch (error) {
      console.warn("error.message", error);
      this.local = false;
      return false;
    }
  },

  async tryGlobal(path, body = {}) {
    const token = await lsList.get("token");
    body.token = token;
    const content = { body: JSON.stringify(body) };

    let response;
    try {
      content.method = "Post";
      content.headers = {
        "Content-Type": "application/json",
      };

      response = await fetch("/.netlify/functions/" + path, content);

      return response;
    } catch (error) {
      return error.message;
    }
  },
};
8;
