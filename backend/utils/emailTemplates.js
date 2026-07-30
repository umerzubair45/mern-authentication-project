const newEmailVerificationTemplate = ({ userName, verificationLink }) => {
  return `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      padding: 30px;
      color: #333;
    ">

      <h2>
        Your Email Address Has Been Updated
      </h2>

      <p>
        Hello ${userName},
      </p>

      <p>
        An administrator has updated the email address
        associated with your account.
      </p>

      <p>
        Please verify your new email address before
        you can log in to your account.
      </p>

      <div style="margin: 30px 0;">

        <a
          href="${verificationLink}"
          style="
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
          "
        >
          Verify My Email
        </a>

      </div>

      <p>
        This verification link will expire in 15 minutes.
      </p>

      <p>
        If you did not expect this change,
        please contact support immediately.
      </p>

    </div>
  `;
};

const oldEmailNotificationTemplate = ({ userName, newEmail }) => {
  return `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      padding: 30px;
      color: #333;
    ">

      <h2>
        Your Account Email Address Was Changed
      </h2>

      <p>
        Hello ${userName},
      </p>

      <p>
        The email address associated with your account
        has been changed by an administrator.
      </p>

      <p>
        Your new account email address is:
      </p>

      <p>
        <strong>
          ${newEmail}
        </strong>
      </p>

      <p>
        If you did not expect this change,
        please contact support immediately.
      </p>

    </div>
  `;
};

const registerTemplate = ({ userName, verificationLink }) => {
  return `
      <h2>Welcome!${userName}</h2>

      <p>Thank you for registering.</p>

      <p>Please click the button below to verify your email.</p>

      <a
        href="${verificationLink}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Verify Email
      </a>

      <p>This link expires in 15 minutes.</p>
  `;
};

const passwordResetTemplate = ({ userName, resetLink }) => {
  return `
        <h2>Password Reset</h2>

        <p>Hello ${userName},</p>

        <p>Click the button below to reset your password.</p>

        <a
          href="${resetLink}"
          style="
            background:#2563eb;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
            display:inline-block;
          "
        >
          Reset Password
        </a>

        <p>This link expires in <strong>15 minutes</strong>.</p>

        <p>If you didn't request this, you can safely ignore this email.</p>
      `;
};
const resendVerificationTemplate = (verificationLink) => {
  return `
      <h2>Welcome!</h2>

      <p>Thank you for registering.</p>

      <p>Please click the button below to verify your email.</p>

      <a
        href="${verificationLink}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Verify Email
      </a>

      <p>This link expires in 15 minutes.</p>
  `;
};

module.exports = {
  newEmailVerificationTemplate,
  oldEmailNotificationTemplate,
  registerTemplate,
  passwordResetTemplate,
  resendVerificationTemplate,
};
