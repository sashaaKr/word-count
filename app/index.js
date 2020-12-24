const express = require("express");
const bodyParser = require("body-parser");
const { celebrate } = require("celebrate");
const { v4: uuidv4 } = require("uuid");

const validators = require("../validators");

function initApp({ service } = {}) {
  const app = express();

  app.use(bodyParser.json({ type: "application/json" }));

  app.get("/health-check", (req, res) => {
    res.json({ healthStatus: "ok" });
  });

  app.use((req, res, next) => {
    req.ctx = { requestId: uuidv4() };
    next();
  });

  app.post("/word", async (req, res, next) => {
    const { headers, ctx } = req;

    const handler =
      headers["content-type"] === "text/plain"
        ? () => service.handleStreamCounting({ stream: req, ctx })
        : req.body.filePath
        ? () => service.handleFileCounting({ fileName: req.body.filePath, ctx })
        : req.body.url
        ? () => service.handleUrlCounting({ url: req.body.url, ctx })
        : null;

    if (handler === null) {
      const err = new Error("Provide filePath, url or plain text");
      err.code = "UNSUPPORTED";
      return next(err);
    }

    try {
      await handler();
      console.log("closing client connection", ctx);
      res.status(202).send("ok");
    } catch (error) {
      next(error);
    }
  });

  app.get(
    "/word/counter",
    celebrate(validators.counter, { abortEarly: true }),
    async (req, res) => {
      const {
        query: { term }
      } = req;
      const counter = await service.getWordCount(term);
      res.json({ counter });
    }
  );

  app.use((err, req, res, next) => {
    const { code } = err;

    let message = "Unknown error";
    let statusCode = 500;

    if (code === "ECONNREFUSED") {
      statusCode = 400;
      message = "Error from remote service";
    }

    if (code === "ENOENT") {
      statusCode = 400;
      message = "File not exist";
    }

    if (code === "UNSUPPORTED") {
      statusCode = 400;
      message = err.message;
    }

    res.status(statusCode).json({
      code,
      message
    });
  });

  return app;
}

module.exports = { initApp };
