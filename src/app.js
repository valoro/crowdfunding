const express = require('express');
const config = require('./config');

async function startServer() {
  const app = express();

  await require('./loaders')(app);

  app.listen(config.port, err => {
      if (err) {
          console.log(err);
          return;
      }
      console.log(`- Server is up and running on port: ${config.port}`);
  })
};

startServer();
