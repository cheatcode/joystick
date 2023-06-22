import ui from "@joystick.js/ui";
import Button from "../../components/button";

const Index = ui.component({
  state: {
    stars: 0,
  },
  lifecycle: {
    onMount: async (instance = {}) => {
      const repo = await fetch(
        `https://api.github.com/repos/cheatcode/joystick`
      ).then(async (response) => {
        return response.json();
      });

      instance.setState({ stars: repo?.stargazers_count });
    },
  },
  css: `
    .splash {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .splash header {
      text-align: center;
      padding: 0px 30px;
    }

    .splash header p {
      color: #888;
      font-size: 18px;
      line-height: 26px;
      margin-top: 30px;
    }

    .splash header ul {
      display: inline-flex;
      margin-top: 30px;
    } 
    
    .splash header ul li:first-child {
      margin-right: 20px;
    }

    .splash footer {
      position: fixed;
      bottom: 20px;
      color: #aaa;
    }

    .splash footer a {
      color: #333;
      text-decoration: underline;
      text-decoration-color: var(--brand);
    }
  `,
  render: ({ state, component, i18n }) => {
    return `
      <div class="splash">
        <header>
          <img src="https://cheatcode-assets.s3.amazonaws.com/joystick-logo.svg" alt="CheatCode" />
          <p>A full-stack JavaScript framework for building web apps and websites.</p>
          <ul>
            <li>
              ${component(Button, {
                theme: "brand",
                target: "_blank",
                href: "https://github.com/cheatcode/joystick#tutorials",
                label: i18n("get_started"),
              })}
            </li>
            <li>
              ${component(Button, {
                theme: "github",
                target: "_blank",
                href: "https://github.com/cheatcode/joystick",
                label: i18n("view_on_github", { stars: state.stars }),
              })}
            </li>
          </ul>
        </header>
        <footer>
          <p>&copy; <a href="https://cheatcode.co">CheatCode</a> — Nullius in verba.</p>
        </footer>
      </div>
    `;
  },
});

export default Index;
