const fs = require('fs');
const path = require('path');

function listFolders(rootPath) {
  if (!rootPath) {
    return [];
  }
  const dir = fs.readdirSync(rootPath);
  const res = [];
  for (const file of dir) {
    const subPath = path.join(rootPath, file);
    const isDir = fs.existsSync(subPath) && fs.lstatSync(subPath).isDirectory();
    if (isDir) res.push(subPath);
  }

  return res;
}

function folderContainsPackage(folderPath) {
  const packagePath = `${folderPath}/package.json`;
  return fs.existsSync(packagePath);
}

function extractDependencies(package) {
  const raw = fs.readFileSync(package);
  const packageJson = JSON.parse(raw);
  return [packageJson['dependencies'], packageJson['devDependencies']];
}

function mergeDependencies(d) {
  return d.reduce((accum, curr) => {
    const entries = Object.entries(curr);
    for (const entry of entries) {
      const [key, value] = entry;
      if(!accum[key] || accum[key] !== value) {
        accum[key] = value;
      }
    }
    return accum;
  }, {});
}

function operateDependencies() {
  const entryPath = 'C:/work/yuba-monorepo/packages/worker';
  const folders = listFolders(entryPath);
  const allD = [];
  const allDd = [];

  for (const folder of folders) {
    if (folderContainsPackage(folder)) {
      const packageJsonPath = `${folder}/package.json`;
      const [dependencies, devDependencies] = extractDependencies(packageJsonPath);
      allD.push(dependencies);
      allDd.push(devDependencies);
    }
  }

  const finalD = mergeDependencies(allD);
  const finalDd = mergeDependencies(allDd);

  const json = {
    'dependencies': finalD,
    'devDependencies': finalDd
  };

  fs.writeFileSync('./finalPackage.json', JSON.stringify(json));
}

operateDependencies();
