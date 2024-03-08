import joystick from "@joystick.js/ui";
import Button from "../../components/button/index.js";

const Index = joystick.component({
  data: async (api = {}) => {
    return {
      stars: await api.fetch(
        `https://api.github.com/repos/cheatcode/joystick`
      ).then(async (response) => {
        const repo = await response.json();
        return repo?.stargazers_count;
      }),
    };
  },
  css: {
    min: {
      width: {
        0: `
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

          .splash header img {
            width: 100%;
            max-width: 250px;
          }

          .splash header p {
            color: #aaa;
            font-size: 18px;
            line-height: 26px;
            margin-top: 30px;
          }

          .splash header ul {
            margin-top: 40px;
            list-style: none;
          } 
          
          .splash header ul li {
            width: 100%;
          }
          
          .splash header ul li:first-child {
            margin-bottom: 20px;
          }

          .splash footer {
            position: fixed;
            bottom: 20px;
            color: #444;
          }

          .splash footer a {
            color: #444;
            text-decoration: underline;
            text-decoration-color: #222;
            text-underline-offset: 2px;
          }

          .splash footer a:hover {
            color: #fff;
            text-decoration-color: var(--brand);
          }
        `,
        768: `
          .splash header ul {
            display: inline-flex;
          }

          .splash header ul li:first-child {
            margin-bottom: 0px;
            margin-right: 0px;
          }
        `,
      }
    }
  },
  render: ({ data, component, i18n }) => {
    return `
      <div class="splash">
        <header>
          <img src="/joystick_logo.webp" alt="Joystick" />
          <p>A full-stack JavaScript framework for building web apps and websites.</p>
          <ul>
            <li>
              ${component(Button, {
                theme: "brand",
                target: "_blank",
                href: "https://github.com/cheatcode/joystick#tutorials",
                label: i18n("buttons.get_started"),
              })}
            </li>
            <li>
              ${component(Button, {
                theme: "github",
                target: "_blank",
                href: "https://github.com/cheatcode/joystick",
                label: i18n("buttons.view_on_github", { stars: data.stars > 1000 ? `${data.stars / 1000}K` : data.stars }),
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
