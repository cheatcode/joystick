import fs from "fs";
var insecure_default = (req, res, next) => {
  const instanceToken = process.env.IS_PUSH_DEPLOYED ? fs.readFileSync("/root/token.txt", "utf-8") : null;
  const instanceTokenFromHeaders = req.get("x-instance-token");
  const hasValidToken = instanceTokenFromHeaders && instanceTokenFromHeaders === instanceToken;
  if (req.get("x-forwarded-proto") !== "https" && !hasValidToken) {
    res.setHeader("Content-Type", "text/html");
    return res.status(403).send(`
      <html>
        <head>
          <title>SSL Setup Required</title>
          <style>
            * {
              margin: 0;
              padding: 0;
            }

            *, *:before, *:after {
              box-sizing: border-box;
            }

            body {
              padding: 20px;
              font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
              font-size: 16px;
              line-height: 24px;
              color: #333;
            }

            .instructions {
              background: #eee;
              padding: 20px;
              border: 1px solid #ddd;
              max-width: 700px;
              margin: 0 auto;
              border-radius: 3px;
            }

            .instructions h1 {
              font-size: 18px;
              margin-bottom: 15px;
            }

            .instructions p:not(:last-child) {
              margin-bottom: 15px;
            }

            .instructions p a {
              color: #333;
            }

            @media screen and (min-width: 768px) {
              .instructions {
                margin-top: 50px;
              }
            }
          </style>
        </head>
        <body>
          <div class="instructions">
            <h1>SSL Setup Required</h1>
            <p>This request has been blocked by Joystick because it was made over an insecure connection in a production environment. In order to access this site, an SSL certificate must be provisioned for the domain pointed at the server hosting this app.</p>
            <p><a href="https://cheatcode.co/docs/deploy/ssl#setup-guide" target="_blank">Read a step-by-step guide here</a></p>
          </div>
        </body>
      </html>
    `);
  }
  next();
};
export {
  insecure_default as default
};
