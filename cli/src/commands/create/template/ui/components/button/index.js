import joystick from "@joystick.js/ui";

const Button = joystick.component({
  css: `
    .button {
      display: inline-block;
      background: #eee;
      padding: 12px 20px;
      font-size: 15px;
      font-weight: 400;
      border-radius: 3px;
      text-decoration: none;
      color: #333;
      white-space: nowrap;
    }

    .button.brand {
      background: var(--brand);
      border: 2px solid var(--brand);
      color: #333;
      font-size: 15px;
      font-weight: 500;
    }

    .button.github {
      background: #111;
      color: #fff;
      padding: 0px 20px 0px 0px;
    }

    .button.github span {
      display: inline-block;
      margin-right: 20px;
      font-weight: 600;
      background: #000;
      padding: 12px 18px;
      border-radius: 3px 0px 0px 3px;
      color: #fff;
      border: 2px solid #111;
    }
  `,
  render: ({ props, when }) => {
    return `
      ${when(
        props?.href,
        `<a href="${props.href}" class="button ${props.theme} ${
          props.classes
        }" target="${props.target || "_self"}">${props.label}</a>`
      )}
      ${when(
        !props?.href,
        `<button class="button ${props.theme} ${props.classes}">${props.label}</button>`
      )}
    `;
  },
});

export default Button;
