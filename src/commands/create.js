import fs from "fs";
import path from "path";
import filesystem from "fs-jetpack";
import Listr from "listr";
import chalk from "chalk";
import Jimp from "jimp";

import api from "../services/api";

const template = path.join(__dirname, "..", "assets", "template.png");

async function checkCardList(options) {
  const { cardListPath } = options;

  if (!filesystem.exists(cardListPath)) {
    console.error(`> Card List file don't exists or not suplied!

    ${cardListPath ? chalk.red.bold(cardListPath) : ""}
    `);

    process.exit(1);
  }
}

async function checkExportPath(options) {
  const exportPath = options.exportPath ? options.exportPath : ".";

  try {
    if (!filesystem.exists(exportPath)) {
      fs.mkdirSync(exportPath);
    }
  } catch (error) {
    console.error(chalk.red(error.message));
    process.exit(1);
  }

  options.exportPath = exportPath;
}

async function fetchCard({ quantity, cardName }, options) {
  const { exportPath } = options;

  const response = await api.get(`/cards/named?fuzzy=${cardName}`).catch(e => {
    console.error(chalk.red.bold(e.response.data.details));

    process.exit(1);
  });

  const {
    name: fullName,
    mana_cost: manaCost,
    type_line: typeLine,
    oracle_text: oracleText,
    power,
    toughness
  } = response.data;

  const cardInfo = {
    quantity,
    fullName,
    lowCaseName: fullName.replace(" ", "_").toLowerCase(),
    manaCost,
    typeLine: typeLine.replace("—", "--"),
    oracleText: oracleText.replace("—", "--"),
    power,
    toughness
  };

  cardInfo.imagePath = path.join(exportPath, `${cardInfo.lowCaseName}.png`);

  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const image = await Jimp.read(template);

  image
    .print(font, 82, 77, cardInfo.fullName)
    .print(
      font,
      82,
      77,
      {
        text: cardInfo.manaCost ? cardInfo.manaCost : "",
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      },
      640
    )
    .print(font, 82, 642, cardInfo.typeLine)
    .print(
      font,
      82,
      717,
      { text: cardInfo.oracleText ? cardInfo.oracleText : "" },
      640
    )
    .print(
      font,
      82,
      1026,
      {
        text:
          cardInfo.power && cardInfo.toughness
            ? `${cardInfo.power} / ${cardInfo.toughness}`
            : "",
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      },
      640
    )
    .resize(227, Jimp.AUTO)
    .write(cardInfo.imagePath, e => {
      if (e) {
        console.error(chalk.red.bold(e.message));
        process.exit(1);
      }
      return;
    });

  return cardInfo;
}

async function fetchAllCards(options) {
  const { cardListPath } = options;

  const listPath = filesystem.path(cardListPath);
  const list = filesystem.read(listPath, "utf8").split(/\r?\n/);

  const tasks = list.map(item => {
    const [quantity, ...name] = item.split(/ |\t/);
    if (name.length > 0) {
      const cardName = name.join(" ");

      return {
        title: cardName,
        task: () => fetchCard({ quantity, cardName }, options)
      };
    }
  });

  return new Listr(tasks, { concurrent: true });
}

export default async function(options) {
  console.log(
    "Running create proxy from %s!\n",
    chalk.black.bgBlue("MTG Proxy")
  );

  options.cardsList = [];

  const tasks = new Listr([
    { title: "Checking Card List", task: () => checkCardList(options) },
    { title: "Checking Export Path", task: () => checkExportPath(options) },
    { title: "Fetching Cards", task: () => fetchAllCards(options) }
  ]);

  await tasks.run();
  console.log("\n%s Proxies created!", chalk.green.bold("DONE"));
}
