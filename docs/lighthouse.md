# Lighthouse

## How to run

In terminal window run 'npm run lighthouse'.

If you want to run lighthouse for already compiled code ready for production, run 'npm run lighthouse:build'.
This command is going to build the project and then run lighthouse.
Prior to this you have to comment out array of URLs section and uncomment static section in `./lighthouserc.js` file.

## How to configure

Project contains `./lighthouserc.js` file.
The file contains all of the configuration for running lighthouse.

### Add new url

To add new url add url path to 'url' array in the config file.

### Change passing score

To change passing score for a certain category change minScore in assertions object
