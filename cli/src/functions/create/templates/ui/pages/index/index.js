import ui, { get } from "@joystick.js/ui";
import Quote from "../../components/quote";

const Index = ui.component({
  state: {
    quotes: [],
  },
  lifecycle: {
    onBeforeMount: async (component) => {
      const quotes = await get("quotes");
      component.setState({ quotes });
    },
    onMount: () => {},
    onBeforeUnmount: () => {},
  },
  methods: {
    handleLogHello: () => {
      console.log("Hello!");
    },
  },
  events: {
    "click .say-hello": (component) => {
      component.methods.handleLogHello();
    },
  },
  css: `
    h4 {
      font-size: 18px;
      font-weight: bold;
      border-bottom: 1px solid #eee;
      padding: 0px 0px 20px;
      margin-bottom: 40px;
      color: #333;
    }
  `,
  render: ({ state, i18n, each, component }) => {
    return `
      <div>
        <h4>${i18n("quotes")}</h4>
        <ul>
          ${each(state.quotes, (quote) => {
            return `
              <li>
                ${component(Quote, {
                  quote: quote.text,
                  attribution: quote.attribution,
                })}
              </li>
            `;
          })}
        </ul>
      </div>
    `;
  },
});

export default Index;
