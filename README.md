
# Build and Run From Source

```bash
git clone https://github.com/Microsoft/sqlops-dataprotocolclient.git
cd sqlops-dataprotocolclient
yarn
yarn run watch
```

# Create a release
New releases need to be created off the release branch, the release branch contains the lib folder.
1. make the changes in the main branch
1. cherry-pick the changes to release branch and build it, lib folder will be updated
1. commit the changes to release branch
1. create a release: https://github.com/microsoft/sqlops-dataprotocolclient/releases, the source will be included automatically. 

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
