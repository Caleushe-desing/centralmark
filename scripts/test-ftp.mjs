import "dotenv/config";
import { Client } from "basic-ftp";
import fs from "fs/promises";
import path from "path";

const client = new Client(30_000);
client.ftp.verbose = true;

try {
  console.log("Conectando a", process.env.FTP_HOST, "...");
  await client.access({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    port: Number(process.env.FTP_PORT || 21),
  });
  console.log("Conectado OK");

  const remotePath = process.env.FTP_REMOTE_PATH || "/public_html/markmall/generated";
  await client.ensureDir(remotePath);
  console.log("Carpeta lista:", remotePath);

  const testFile = path.join(process.cwd(), "public", "generated", "ftp-test.txt");
  await fs.mkdir(path.dirname(testFile), { recursive: true });
  await fs.writeFile(testFile, `MarkMall FTP test ${new Date().toISOString()}\n`);

  const remoteFile = `${remotePath}/ftp-test.txt`;
  await client.uploadFrom(testFile, remoteFile);
  console.log("Subido:", remoteFile);
  console.log("URL:", `${process.env.APP_PUBLIC_URL}/generated/ftp-test.txt`);

  const list = await client.list(remotePath);
  console.log("Archivos en carpeta:", list.map((f) => f.name).join(", "));
} catch (err) {
  console.error("ERROR:", err.message || err);
  process.exit(1);
} finally {
  client.close();
}
