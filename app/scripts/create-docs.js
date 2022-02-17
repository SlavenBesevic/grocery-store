const { exec } = require('child_process');
const path = require('path');
const { NODE_ENV } = require('../config/environments');

const docsLocation = path.join(__dirname, '../doc');
const removePreviousDocs = `rm -rf ${docsLocation}`;
const components = path.join(__dirname, '../components');
const apiDocPath = path.join(__dirname, '../node_modules/apidoc/bin/apidoc');
const generateDocs = `${apiDocPath} -i ${components}`;
const runningDirectory = process.env.PWD;

exec(removePreviousDocs, (removeError) => {
  if (removeError) {
    console.error(`Remove documentation error: ${removeError}`);
    process.exit(1);
  }
  if (NODE_ENV === 'development') {
    exec(generateDocs, (genDocError) => {
      if (genDocError) {
        console.error(`Generate documentation error: ${genDocError}`);
        process.exit(1);
      }
      console.log(`Apidoc generated at ${runningDirectory}/doc`);
    });
  }
});
