const net = require("net");
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const MONGOD_PATH = path.join(os.homedir(), "mongodb", "MongoDB", "Server", "8.3", "bin", "mongod.exe");
const DB_PATH = path.join(os.homedir(), "mongodb-data", "db");
const LOG_PATH = path.join(os.homedir(), "mongodb-data", "log", "mongod.log");
const PORT = 27017;

function isPortOpen(port, host) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const alreadyRunning = await isPortOpen(PORT, "127.0.0.1");
  if (alreadyRunning) {
    console.log(`[mongo] already running on 127.0.0.1:${PORT}`);
    return;
  }

  console.log(`[mongo] starting mongod (dbpath: ${DB_PATH})`);
  const child = spawn(
    MONGOD_PATH,
    ["--dbpath", DB_PATH, "--logpath", LOG_PATH, "--port", String(PORT), "--bind_ip", "127.0.0.1"],
    { detached: true, stdio: "ignore" }
  );
  child.unref();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (await isPortOpen(PORT, "127.0.0.1")) {
      console.log(`[mongo] ready on 127.0.0.1:${PORT}`);
      return;
    }
  }

  console.error(`[mongo] did not become ready in time. Check log at ${LOG_PATH}`);
  process.exit(1);
}

main();
