const core = require("@actions/core");
const exec = require("@actions/exec");

async function run() {
  try {
    const packPath = core.getInput("packPath");
    const codaApiToken = core.getInput("codaApiToken");
    const notes = core.getInput("notes").replace(/\n/g, "\\n");

    if (!codaApiToken) {
      throw new Error("Missing Coda API token");
    }

    if (!notes) {
      throw new Error("Missing release notes");
    }

    let releasingLogMessage = [`Releasing pack ${packPath}`];
    if (notes) {
      releasingLogMessage.push(`and notes ${notes}`);
    }
    core.info(releasingLogMessage.join(" "));

    let codaOutput = "";
    let codaError = "";
    const options = {
      listeners: {
        stdout: (data) => {
          codaOutput += data.toString();
        },
        stderr: (data) => {
          codaError += data.toString();
        },
      },
    };

    // handle properly if notes is multiline
    await exec.exec(
      "npx",
      [
        "coda",
        "release",
        packPath,
        "--apiToken",
        codaApiToken,
        "--notes",
        `"${notes}"`,
      ],
      options
    );
    if (codaError) {
      throw new Error(`Coda release failed with error: ${codaError}`);
    }
  } catch (error) {
    core.setFailed(`Action failed with error ${error} `);
  }
}

run();
