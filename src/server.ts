import app from './app';
import config from './config';

const isVercel = process.env.VERCEL === "1";

async function main() {
  try {
    if (!isVercel) {
      app.listen(config.port, () => {
        console.log(`Server listening on port http://localhost:${config.port}`);
      });
    }
  } catch (err) {
    console.log(err);
  }
}

main();

export default app;
