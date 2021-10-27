import ui from "@joystick.js/ui";

const Quote = ui.component({
  css: `
    blockquote {
      background: #0099ff;
      padding: 20px;
    }

    blockquote p {
      color: #333;
    }
  `,
  render: ({ props }) => {
    return `
      <blockquote>
        <p>${props.quote}</p>
        <cite>${props.attribution}</cite>
      </blockquote>
    `;
  },
});

export default Quote;
