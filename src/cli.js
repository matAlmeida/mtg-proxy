import arg from "arg";
import chalk from "chalk";

import pkg from "../package.json";

import create from "./commands/create";

function parseArgs2Options(rawArgs) {
  const args = arg(
    {
      "--help": Boolean,
      "-h": "--help",
      "--version": Boolean,
      "-v": "--version"
    },
    {
      argv: rawArgs.slice(2)
    }
  );

  return {
    showHelp: args["--help"] || false,
    showVersion: args["--version"] || false,
    cardListPath: args._[0] || false,
    exportPath: args._[1] || false
  };
}

export async function run(args) {
  try {
    const options = parseArgs2Options(args);

    if (options.showHelp) {
      console.log(`Welcome to ${chalk.black.bgCyan("MTG Proxy")}
    
  ${chalk.bold("Use one of the following commands")}:
  
  mtg-proxy <card-list>
  mtg-proxy <card-list> <export-folder>
    `);

      process.exit(1);
    } else if (options.showVersion) {
      console.log(`${chalk.black.bgCyan("MTG Proxy")}
      
  v${pkg.version}
      `);

      process.exit(1);
    }

    await create(options);
  } catch (error) {}
}
