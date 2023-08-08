import ui from "@joystick.js/ui";

const ResetPassword = ui.component({
  render: ({ props }) => {
    return `
      <p>A password reset was requested for this email address (${props.emailAddress}). If you requested this reset, click the link below to reset your password:</p>
      <p><a href="${props.url}">Reset Password</a></p>
    `;
  },
});

export default ResetPassword;
