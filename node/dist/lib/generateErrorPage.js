var generateErrorPage_default = ({ frame, path, stack }) => `
  <html>
    <head>
      <title>Build Error</title>
      <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/styles/atom-one-dark.min.css" />
      <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/highlight.min.js"><\/script>
      <style>
        body {
          background: #fff;
          font-size: 16px;
          line-height: 24px;
          color: #333;
          font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
        }

        * {
          margin: 0;
          padding: 0;
        }

        *, *:before, *:after {
          box-sizing: border-box;
        }

        .container {
          width: 90%;
          margin: 0 auto;
          max-width: 1200px;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          margin: 0;
        }

        .container > header {
          padding: 30px 0;
        }

        .container > header h1 {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .container > header h1 .fa-exclamation-triangle {
          color: #ffcc00;
          margin-right: 5px;
          font-size: 22px;
        }

        .container > header h4 {
          font-size: 18px;
          font-weight: normal;
          color: #888;
          margin-top: 10px;
        }

        .container > header p {
          margin: 20px 0 0;
        }

        .code-block {
          margin-bottom: 40px;
          border: 1px solid #eee;
          border-radius: 3px;
        }

        .code-block header {
          background: #22252b;
          padding: 20px;
          border-radius: 3px 3px 0px 0px;
        }

        .code-block header .fas {
          color: #aaa;
          margin-right: 5px;
        }

        .code-block header h4 {
          color: #fff;
          font-weight: normal;
        }

        .code-block pre {
          background: #fff;
          overflow: scroll;
          margin: 0px;
          border-radius: 0px 0px 3px 3px;
        }

        @media screen and (min-width: 768px) {
          .container {
            max-width: 728px;
          }

          .container > header {
            padding: 50px 0;
          }

          .container > header p {
            margin: 30px 0 0;
          }
        }

        @media screen and (min-width: 1240px) {
          .container {
            max-width: 1200px;
          }

          width: 100%;
        }
      </style>
      <script src="https://kit.fontawesome.com/225f49d71f.js" crossorigin="anonymous"><\/script>
    </head>
    <body>
      <div class="container">
        <header>
          <h1><i class="fas fa-exclamation-triangle"></i> Build Error</h1>
          <h4>in ${path}</h4>
          <p><strong>Your app is failing to build</strong>. Review the output below, correct the issue displayed, and then refresh the page:</p>
        </header>
        <div class="code-block">
          <header>
            <h4><i class="fas fa-code"></i> Code Frame</h4>
          </header>
          <pre><code>${frame}</code></pre>
        </div>
        <div class="code-block">
          <header>
            <h4><i class="fas fa-layer-group"></i> Stack Trace</h4>
          </header>
          <pre><code>${stack}</code></pre>
        </div>
      </div>
      <script>hljs.highlightAll();<\/script>
    </body>
  </html>
`;
export {
  generateErrorPage_default as default
};
