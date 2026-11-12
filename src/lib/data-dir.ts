import path from "path";

// Where the admin's saved content, uploads and database live. Set DATA_DIR to put them on a
// persistent volume when hosting; defaults to ./data in the project.
export const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
