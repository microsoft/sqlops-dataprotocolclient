
# Description

This repo is for the `dataprotocol-client` package, which is used by Azure Data Studio extensions wishing to implement certain core features, such as a Query Provider.

This is done through an implementation on top of the VS Code [Language Client](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide). This package is used to set up the features and messages that will then be implemented by the backing language server (such as [SQL Tools Service](https://github.com/Microsoft/sqltoolsservice)). You can see further descriptions of the messages defined [here](https://github.com/microsoft/sqltoolsservice/blob/main/docs/guide/jsonrpc_protocol.md)

Currently, this package is NOT published to npm or any other package manager. Instead, extensions will reference the Github releases directly. These releases point to commits out of the [release](https://github.com/microsoft/sqlops-dataprotocolclient/tree/release) branch, which contains the compiled
JS sources that extensions will be using at runtime.

To reference this package, add an entry like this to your package.json dependencies :

`github:Microsoft/sqlops-dataprotocolclient#1.3.8`

replacing the version with the version of the release you wish to use.

# Build and Run From Source

```bash
git clone https://github.com/Microsoft/sqlops-dataprotocolclient.git
cd sqlops-dataprotocolclient
yarn
yarn run watch
```

# Create a release

New releases need to be created off the [release](https://github.com/microsoft/sqlops-dataprotocolclient/tree/release) branch, the release branch contains the lib folder.

1. Make the changes in the main branch (including a version bump)
2. Create a new branch off of the [release](https://github.com/microsoft/sqlops-dataprotocolclient/tree/release) branch
3. Merge the changes to your new branch
   * You can also cherry-pick changes over if desired, although generally we should always be releasing everything from main
4. Run `yarn compile` locally to build the sources, you should see changes in the lib folder
5. Commit the changes to your branch
6. Open a PR to merge these changes into the release branch and once approved merge it in
    * IMPORTANT : This should be done with a merge commit, NOT a squash merge
7. Create a release: https://github.com/microsoft/sqlops-dataprotocolclient/releases

Now you can reference the new release in your extension with an entry in the dependencies section like this

`github:Microsoft/sqlops-dataprotocolclient#1.3.8`

replacing the version with whatever the latest released version you just made is.

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
