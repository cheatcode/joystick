const master_ignore_list = [
  '._', // NOTE: Hidden MacOS metadata files.
  '.build',
  '.DS_Store',
  '.git',
  '.joystick/build',
  '.joystick/data',
  '.push',
  'node_modules',
  'settings.development.json',
  'settings.staging.json',
  'settings.production.json',
];

export default master_ignore_list;
