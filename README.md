# Edgedriver

This is a simple package that downloads [Edgedriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/) and 
provides a node api for accessing the path to the binary. We want to keep this with minimimal dependencies.


How to use?
```node
import driver from '@sitespeed.io/edgedriver';

// Downloads Edgedriver the first time, then returns the path to the binary
const binPath = await driver.ensureBinPath();
// launch edgedriver from binPath
```

The package has no install script, so `npm install` does not download Edgedriver. If you need the driver before the first run, for example when you build a Docker image or on a machine without internet access during tests, download it with:

```
node node_modules/@sitespeed.io/edgedriver/install.js
```

`binPath()` returns the path without a download.

You can override where you download the Edgedriver by setting *process.env.EDGEDRIVER_BASE_URL*. You can skip downloading Edgedriver by setting *process.env.EDGEDRIVER_SKIP_DOWNLOAD*.

You can download another Edgedriver version by setting *process.env.EDGEDRIVER_VERSION*.

```
EDGEDRIVER_VERSION=81.0.4044.20 node install.js
```

If you don't set a version, [the version](https://github.com/sitespeedio/edgedriver/blob/master/package.json#L4) in the *package.json* is used. 

