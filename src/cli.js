import arg from "arg";
import create from "./commands/create";

function parseArgs2Options(rawArgs) {
  const args = arg(
    {
      "--mtga": Boolean,
      "-a": "--mtga"
    },
    {
      argv: rawArgs.slice(2)
    }
  );

  return {
    isMTGAInput: args["--mtga"] || false,
    cardListPath: args._[0] || false,
    exportPath: args._[1] || false
  };
}

export async function run(args) {
  try {
    const options = parseArgs2Options(args);

    await create(options);
  } catch (error) {}
}
