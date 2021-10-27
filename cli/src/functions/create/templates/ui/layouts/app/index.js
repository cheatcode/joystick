import ui from "@joystick.js/ui";

const App = ui.component({
  render: ({ props, component }) => {
    return `
      <div>
        ${component(props.page, props)}
      </div>
    `;
  },
});

export default App;
