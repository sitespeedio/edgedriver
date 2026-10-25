import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { ensureBinPath } from './index.js';

const require = createRequire(import.meta.url);
const packageVersion = require('./package.json').edgedriver_version;
const expectedVersionPrefix = `Microsoft Edge WebDriver ${packageVersion}`;

const driverVersion = execFileSync(await ensureBinPath(), [
  '--version'
]).toString();

if (!driverVersion.startsWith(expectedVersionPrefix)) {
  throw new Error(
    `Expected driver version to be ${expectedVersionPrefix} but it was ${driverVersion}`
  );
}
