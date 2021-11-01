import ui, { get } from "@joystick.js/ui";
import Quote from "../../components/quote";

const Index = ui.component({
  methods: {
    handleLogHello: () => {
      console.log("Hello!");
    },
  },
  events: {
    "click .say-hello": (event, component) => {
      component.methods.handleLogHello();
    },
  },
  css: `
    div p {
      font-size: 18px;
      background: #eee;
      padding: 20px;
    }
  `,
  render: ({ component, i18n }) => {
    return `
      <div>
        <p>${i18n("quote")}</p>
        ${component(Quote, {
          quote: "Light up the darkness.",
          attribution: "Bob Marley",
        })}
      </div>
    `;
  },
});

export default Index;
