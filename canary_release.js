import fs from 'fs';
import child_process from 'child_process';
import util from 'util';

const [_node_path, _script_path, ...args] = process.argv;

const { readFile, writeFile } = fs.promises;
const exec = util.promisify(child_process.exec);

const git_branch_name = (await exec('git branch --show-current'))?.stdout?.replace('\n', '');

const check_for_uncommitted_changes = async () => {
  const { stdout } = await exec('git status -s');
  const uncommitted_changes = stdout?.split('\n')?.filter((line) => !!line);

  if (uncommitted_changes?.length > 0) {
    console.error(`Make sure to commit changes to ${git_branch_name} before releasing.`);
    process.exit();
  }

  return null;
};

const get_package_json = async (root = '') => {
  const package_json_raw = await readFile(`${root}/package.json`, 'utf-8');
  return JSON.parse(package_json_raw);
};

if (git_branch_name !== 'canary') {
  console.error('Automated releases are only supported on the canary branch.');
  process.exit(0);
}

if (git_branch_name === 'canary') {
  try {
    const package_folders = ['cli', 'node', 'test', 'ui'];

    // console.log('Check for and warn uncomitted changes');
    await check_for_uncommitted_changes();
  
    for (let i = 0; i < package_folders?.length; i += 1) {
      const package_folder = package_folders[i];
  
      // console.log(`Get the current package JSON for /${package_folder}`);
      const current_package_json = await get_package_json(package_folder);
  
      // console.log('Cache the current version in package.json');
      const existing_name = current_package_json?.name;
      const existing_version = current_package_json?.version;
  
      // console.log('Copy the existing canary_version field to version and update file');
      current_package_json.name = `${existing_name}-canary`;
      current_package_json.version = current_package_json.canary_version;
      await writeFile(`${package_folder}/package.json`, JSON.stringify(current_package_json, null, 2));
      await exec(`git add . && git commit -m "swap version with canary_version"`);
      
      // console.log('Version via NPM normally with npm version prerelease --preid=canary');
      await exec(`cd ${package_folder} && npm version prerelease --preid=canary`);
  
      // console.log('Release with NPM publish');
      await exec(`cd ${package_folder} && npm publish`);
  
      // console.log('Copy the updated version back to canary_version and swap back in the original version');
      const updated_package_json = await get_package_json(package_folder);
      updated_package_json.canary_version = updated_package_json.version;
      updated_package_json.name = existing_name;
      updated_package_json.version = existing_version;
      await writeFile(`${package_folder}/package.json`, JSON.stringify(updated_package_json, null, 2));
  
      // console.log('Git commit the version changes');
      await exec(`git add . && git commit -m "release ${updated_package_json.canary_version}"`);
    }
  
    // console.log('Run a git push to origin');
    await exec(`git push origin canary`);
  
    process.exit(0);
  } catch (exception) {
    console.warn(exception);
  }
}