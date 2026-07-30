const { Worker } = require("bullmq");
const sendEmail = require("../utils/sendEmail");
const { registerTemplate } = require("../utils/emailTemplates");

const emailWorker = new Worker(
  "email",
  async (job) => {
    try {
      console.log("Processing", job.name);

      if (job.name === "send-verification-email") {
        const { to, userName, verificationLink } = job.data;

        console.log("Sending email to:", to);

        await sendEmail({
          to,
          subject: "Verify Your Email",
          html: registerTemplate({
            userName,
            verificationLink,
          }),
        });

        console.log("Email sent successfully");
      }
    } catch (err) {
      console.error("Worker Error:", err);
      throw err; // Let BullMQ mark the job as failed
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  },
);
