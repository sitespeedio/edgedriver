# Edgedriver

This is a simple package that downloads [Edgedriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/) and 
provides a node api for accessing the path to the binary. We want to keep this with minimimal dependencies.


How to use?
```node
const driver = require('@sitespeed.io/edgedriver');

const binPath = driver.binPath();
// launch edgedriver from binPath
```

You can override where you download the Edgedriver by setting *process.env.EDGEDRIVER_BASE_URL*. You can skip donwloading the Edgedriver by setting *process.env.EDGEDRIVER_SKIP_DOWNLOAD*.
