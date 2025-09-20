-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserAnalysisResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "lang" TEXT NOT NULL DEFAULT 'zh',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAnalysisResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserAnalysisResult" ("cost", "createdAt", "id", "result", "symbol", "type", "userId") SELECT "cost", "createdAt", "id", "result", "symbol", "type", "userId" FROM "UserAnalysisResult";
DROP TABLE "UserAnalysisResult";
ALTER TABLE "new_UserAnalysisResult" RENAME TO "UserAnalysisResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
