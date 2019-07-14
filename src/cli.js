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
      "-v": "--version",
      "--papper": String,
      "-p": "--papper",
      "--output": String,
      "-o": "--output"
    },
    {
      argv: rawArgs.slice(2)
    }
  );

  return {
    showHelp: args["--help"] || false,
    showVersion: args["--version"] || false,
    paperSize: args["--papper"] || "A4",
    outputName: args["--output"] || false,
    cardListPath: args._[0] || false,
    exportPath: args._[1] || false
  };
}

export async function run(args) {
  try {
    const options = parseArgs2Options(args);

    if (options.showHelp) {
      console.log(`${chalk.black.bgCyan("MTG Proxy")} v${pkg.version}.

Usage:
  mtg-proxy <card-list-path> [<export-path>] [--output=<name>] [--papper=<size>]
  mtg-proxy -h | --help
  mtg-proxy --version

Options:
  <card-list-path>      Path to a valid MOL card list
  <export-path>         Path where the output PDF will be saved [default: current directory].
  -h --help             Show this screen.
  --version             Show version.
  (--output|-o)=<name>  Name of output PDF.
  (--papper|-p)=<size>  Papper size [default: A4].
                        ('A3', 'A4', 'Legal', 'Letter' or 'Tabloid')
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
