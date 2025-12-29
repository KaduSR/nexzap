
import fs from "fs";
import path from "path";

export const DeleteOldestFiles = () => {
  const directory = path.resolve("public");
  
  if (!fs.existsSync(directory)) return;

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      if (file === ".gitignore") continue;

      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) throw err;

        const now = new Date().getTime();
        const endTime = new Date(stats.ctime).getTime() + 24 * 60 * 60 * 1000; // 24 horas

        if (now > endTime) {
          fs.unlink(filePath, (err) => {
            if (err) throw err;
            console.log(`[Cleaner] Arquivo deletado: ${file}`);
          });
        }
      });
    }
  });
};
