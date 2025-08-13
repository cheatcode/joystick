import fs from 'fs';

const { readdir, readFile, writeFile } = fs.promises;

const replace_in_files = (root_path = '', options = {}) => {
  return readdir(root_path, { recursive: true }).then(async (files) => {
    let filtered_files = files;

    if (options?.exclude?.length) {
      for (let i = 0; i < options?.exclude?.length; i += 1) {
        const exclude_regex = options?.exclude[i];
        filtered_files = filtered_files?.filter((file) => {
          return !file.match(new RegExp(exclude_regex));
        });
      }
    }

    filtered_files = filtered_files.filter((file) => {
      return options?.match?.length ? options?.match?.some((match_regex) => {
        return file.match(new RegExp(match_regex));
      }) : true;
    });

    for (let i = 0; i < filtered_files?.length; i += 1) {
      const file = filtered_files[i];
      const file_path = `${root_path}/${file}`;
      const file_contents = await readFile(file_path, 'utf-8');
      const updated_file_contents = file_contents?.replace(
        options.replace_regex,
        options.replace_with
      );

      await writeFile(file_path, updated_file_contents);
    }
  }).catch((error) => {
    console.warn(error);
  });  
};

export default replace_in_files;
