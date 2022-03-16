const app = require('./app');

const LISTEN_PORT = 3001;

async function init() {
  try {
    app.listen(LISTEN_PORT, () => {
      console.log(`Express App Listening on Port ${LISTEN_PORT}`);
      console.log(`Swagger documentation is available at localhost:${LISTEN_PORT}/doc`);
    });
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}

(async () => init())();
