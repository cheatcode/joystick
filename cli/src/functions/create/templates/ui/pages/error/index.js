import ui from "@joystick.js/ui";

const Error = ui.component({
  css: `
    .error {
      text-align: center;
      margin: 50px 0;
    }

    h4 {
      font-size: 20px;
      font-weight: bold;
    }

    p {
      font-size: 16px;
      color: #888;
      margin-top: 15px;
    }
  `,
  render: () => {
    return `
      <div class="error">
        <h4>404 &mdash; Page Not Found</h4>
        <p>Double-check the URL and try again.</p>
      </div>
    `;
  },
});

export default Error;
