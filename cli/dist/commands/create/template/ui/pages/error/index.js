import joystick from "@joystick.js/ui";

const Error = joystick.component({
  css: `
    .error {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .error > header {
      text-align: center;
      margin: 50px 0;
    }

    h1 {
      color: #444;
      font-size: 64px;
      font-weight: 400;
      letter-spacing: 0.03em;
    }

    h4 {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      margin-top: 40px;
    }

    p {
      font-size: 16px;
      color: #888;
      margin-top: 10px;
    }
  `,
  render: ({ i18n, props }) => {
    return `
      <div class="error">
        <header>
          <h1>${props.status_code}</h1>
          <h4>${i18n('page_not_found')}</h4>
          <p>${i18n('double_check_url')}</p>
        </header>
      </div>
    `;
  },
});

export default Error;
