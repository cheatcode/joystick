const t=(i="",n="")=>{const e=`https://${i}${n}`;return`
    <html>
      <head>
        <title>Insecure Connection</title>
        <style type="text/css">
          body {
            font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
            font-size: 16px;
            line-height: 24px;
            background: #fafafa;
            display: flex;
            margin: 0;
            padding: 20px;
            justify-content: center;
          }

          .warning {
            width: 100%;
            max-width: 500px;
            background: #fff;
            border: 1px solid #eee;
            border-radius: 3px;
            padding: 35px;
            align-self: flex-start;
          }

          .warning h1 {
            color: #000;
            font-size: 22px;
            line-height: 30px;
            margin: 0;
          }

          .warning p {
            font-size: 16px;
            line-height: 25px;
            font-weight: 400;
            color: #555;
            margin: 10px 0 0;
          }

          .warning p a {
            color: #555;
          }

          @media screen and (min-width: 768px) {
            body {
              padding: 40px;
            }
          }
        </style>
      </head>
      <body>
        <div class="warning">
          <h1>Insecure Connection<h1>
          <p>The site at this URL requires an SSL-secured connection. Please visit <a href="${e}">${e}</a> instead. You will be automatically redirected in 15 seconds.</p>
        </div>
        <script>
          setTimeout(() => {
            location.href = '${e}';
          }, 15 * 1000);
        </script>
      </body>
    </html>
  `};var a=t;export{a as default};
