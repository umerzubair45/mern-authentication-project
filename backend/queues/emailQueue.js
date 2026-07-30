const { Queue } = require("bullmq");

const emailQueue = new Queue("email", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

module.exports = emailQueue;
