
# Description

This repo is for the `dataprotocol-client` package, which is used by Azure Data Studio extensions wishing to implement certain core features, such as a Query Provider.

This is done through an implementation on top of the VS Code [Language Client](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide). This package is used to set up the features and messages that will then be implemented by the backing language server (such as [SQL Tools Service](https://github.com/Microsoft/sqltoolsservice)). You can see further descriptions of the messages defined [here](https://github.com/microsoft/sqltoolsservice/blob/main/docs/guide/jsonrpc_protocol.md)

Currently, this package is NOT published to npm or any other package manager. Instead, extensions will reference the Github releases directly. These releases point to commits out of the [release](https://github.com/microsoft/sqlops-dataprotocolclient/tree/release) branch, which contains the compiled
JS sources that extensions will be using at runtime.

See [the wiki](https://github.com/microsoft/sqlops-dataprotocolclient/wiki/Releasing-Changes#using-this-package) for more information.

# Build and Run From Source

```bash
git clone https://github.com/Microsoft/sqlops-dataprotocolclient.git
cd sqlops-dataprotocolclient
yarn
yarn run watch
```

# Create a release

See [the wiki](https://github.com/microsoft/sqlops-dataprotocolclient/wiki/Releasing-Changes) for instructions on making and releasing new changes.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
