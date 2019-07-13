import fs from "fs";
import Listr from "listr";
import chalk from "chalk";

async function checkCardList(options) {
  const { cardListPath } = options;

  if (!fs.existsSync(cardListPath)) {
    console.error(`> Card List file don't exists or not suplied!

    ${cardListPath ? chalk.red.bold(cardListPath) : ""}
    `);

    process.exit(1);
  }
}

export default async function(options) {
  options.cardsList = [];
  console.log("Welcome to %s!\n", chalk.black.bgBlue("MTG Proxy"));

  const tasks = new Listr([
    { title: "Checking Card List", task: () => checkCardList(options) }
  ]);

  await tasks.run();
  console.log("\n%s Proxies created!", chalk.green.bold("DONE"));
}
