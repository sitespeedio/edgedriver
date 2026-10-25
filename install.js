import os from 'node:os';
import path from 'node:path';
import { mkdir, unlink, chmod, writeFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import StreamZip from 'node-stream-zip';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The version of the driver that will be installed
const EDGEDRIVER_VERSION =
  process.env.EDGEDRIVER_VERSION || pkg.edgedriver_version;

function getDriverArchiveName() {
  const platform = os.platform();
  const arch = os.arch();
  if (platform === 'darwin') {
    return arch === 'arm64'
      ? 'edgedriver_mac64_m1.zip'
      : 'edgedriver_mac64.zip';
  }
  if (platform === 'linux') {
    return 'edgedriver_linux64.zip';
  }
  if (platform === 'win32') {
    if (arch === 'x64') return 'edgedriver_win64.zip';
    if (arch === 'ia32') return 'edgedriver_win32.zip';
  }
  return;
}

function getDriverUrl(archive) {
  const base =
    process.env.EDGEDRIVER_BASE_URL ||
    `https://msedgedriver.microsoft.com/${EDGEDRIVER_VERSION}/`;
  return `${base}${archive}`;
}

async function downloadFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} ${response.statusText} for ${url}`
    );
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

async function extractDriver(zipPath, destPath) {
  const entry = path.basename(destPath);
  const zip = new StreamZip.async({ file: zipPath });
  try {
    await zip.extract(entry, destPath);
  } finally {
    await zip.close();
  }
}

async function tryUnlink(p) {
  try {
    await unlink(p);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

export async function install() {
  if (process.env.EDGEDRIVER_SKIP_DOWNLOAD) {
    console.log('Skip downloading Edgedriver');
    return;
  }

  const archive = getDriverArchiveName();
  if (!archive) {
    console.log(
      `Skipping installing Edgedriver on ${os.platform()} for ${os.arch()} since there's no official build`
    );
    return;
  }

  const url = getDriverUrl(archive);
  const vendorDir = path.resolve(__dirname, 'vendor');
  await mkdir(vendorDir, { recursive: true });

  const zipPath = path.join(vendorDir, 'msedgedriver.zip');
  const ext = os.platform() === 'win32' ? '.exe' : '';
  const binPath = path.join(vendorDir, `msedgedriver${ext}`);

  await tryUnlink(binPath);

  console.log(`Downloading Edgedriver ${EDGEDRIVER_VERSION} from ${url}`);
  await downloadFile(url, zipPath);
  await extractDriver(zipPath, binPath);
  await tryUnlink(zipPath);
  await chmod(binPath, 0o755);
  console.log(`Edgedriver ${EDGEDRIVER_VERSION} installed in ${vendorDir}`);
}

// Install only when this file runs as a script, not when index.js imports it.
if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    await install();
  } catch (error) {
    console.error(
      `Edgedriver ${EDGEDRIVER_VERSION} could not be installed: ${error.message}`
    );
    process.exitCode = 1;
  }
}
