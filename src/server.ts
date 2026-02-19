import app from './app';
import config from './config';

async function main() {
  try {
    app.listen(config.port, () => {
      console.log(`Server listening on port http://localhost:${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();
