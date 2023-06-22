import ui from "@joystick.js/ui";

const Button = ui.component({
  css: `
    .button {
      display: inline-block;
      background: #eee;
      padding: 15px 20px;
      border-radius: 3px;
      text-decoration: none;
      color: #333;
    }

    .button.brand {
      background: var(--brand);
      color: #333;
    }

    .button.github {
      background: #333;
      color: #fff;
      padding: 0px 20px 0px 0px;
    }

    .button.github span {
      display: inline-block;
      margin-right: 20px;
      font-weight: 500;
      background: #000;
      padding: 15px 20px;
      border-radius: 3px 0px 0px 3px;
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
