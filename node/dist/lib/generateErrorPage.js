!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(n="undefined"!=typeof globalThis?globalThis:n||self)["joystick-node"]=e()}(this,(function(){"use strict";return({frame:n,path:e,stack:i})=>`\n  <html>\n    <head>\n      <title>Build Error</title>\n      <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/styles/atom-one-dark.min.css" />\n      <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/highlight.min.js"><\/script>\n      <style>\n        body {\n          background: #fff;\n          font-size: 16px;\n          line-height: 24px;\n          color: #333;\n          font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;\n        }\n\n        * {\n          margin: 0;\n          padding: 0;\n        }\n\n        *, *:before, *:after {\n          box-sizing: border-box;\n        }\n\n        .container {\n          width: 90%;\n          margin: 0 auto;\n          max-width: 1200px;\n        }\n\n        h1,\n        h2,\n        h3,\n        h4,\n        h5,\n        h6 {\n          margin: 0;\n        }\n\n        .container > header {\n          padding: 30px 0;\n        }\n\n        .container > header h1 {\n          font-size: 26px;\n          font-weight: bold;\n          color: #333;\n        }\n\n        .container > header h1 .fa-exclamation-triangle {\n          color: #ffcc00;\n          margin-right: 5px;\n        }\n\n        .container > header h4 {\n          font-size: 18px;\n          font-weight: normal;\n          color: #888;\n          margin-top: 10px;\n        }\n\n        .container > header p {\n          margin: 20px 0 0;\n        }\n\n        .code-block {\n          margin-bottom: 40px;\n          border: 1px solid #eee;\n          border-radius: 3px;\n        }\n\n        .code-block header {\n          border-bottom: 1px solid #eee;\n          padding: 20px;\n          border-radius: 3px;\n        }\n\n        .code-block header .fas {\n          color: #888;\n          margin-right: 5px;\n        }\n\n        .code-block pre {\n          background: #fff;\n          overflow: scroll;\n          margin: -1px;\n          border-radius: 0px 0px 3px 3px;\n        }\n\n        @media screen and (min-width: 768px) {\n          .container {\n            max-width: 728px;\n          }\n\n          .container > header {\n            padding: 50px 0;\n          }\n\n          .container > header p {\n            margin: 30px 0 0;\n          }\n        }\n\n        @media screen and (min-width: 1240px) {\n          .container {\n            max-width: 1200px;\n          }\n\n          width: 100%;\n        }\n      </style>\n      <script src="https://kit.fontawesome.com/225f49d71f.js" crossorigin="anonymous"><\/script>\n    </head>\n    <body>\n      <div class="container">\n        <header>\n          <h1><i class="fas fa-exclamation-triangle"></i> Build Error</h1>\n          <h4>in ${e}</h4>\n          <p><strong>Your app is failing to build</strong>. Review the output below, correct the issue displayed, and then refresh the page:</p>\n        </header>\n        <div class="code-block">\n          <header>\n            <h4><i class="fas fa-code"></i> Code Frame</h4>\n          </header>\n          <pre><code>${n}</code></pre>\n        </div>\n        <div class="code-block">\n          <header>\n            <h4><i class="fas fa-layer-group"></i> Stack Trace</h4>\n          </header>\n          <pre><code>${i}</code></pre>\n        </div>\n      </div>\n      <script>hljs.highlightAll();<\/script>\n    </body>\n  </html>\n`}));
