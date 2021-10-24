import ui from "@joystick.js/ui";

const Quote = ui.component({
  css: ``,
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
