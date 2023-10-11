import escape from "pg-escape";
var createMetadataTableColumns_default = async (usersDatabase = "", sqlizedMetadata = {}) => {
  if (usersDatabase === "postgresql") {
    const columns = Object.keys(sqlizedMetadata || {});
    for (let i = 0; i < columns?.length; i += 1) {
      await process.databases.postgresql.query(escape(`ALTER TABLE users ADD COLUMN IF NOT EXISTS %I TEXT;`, columns[i]));
    }
  }
};
export {
  createMetadataTableColumns_default as default
};
