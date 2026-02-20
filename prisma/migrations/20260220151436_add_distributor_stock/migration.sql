-- CreateTable
CREATE TABLE "Distributor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "distributor_id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Stock_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "Distributor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "age_range" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "allergies" TEXT NOT NULL,
    "dietary_prefs" TEXT NOT NULL DEFAULT '[]',
    "vending_freq" TEXT,
    "would_seek" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Participant" ("age_range", "allergies", "created_at", "dietary_prefs", "gender", "id", "name", "vending_freq", "would_seek") SELECT "age_range", "allergies", "created_at", "dietary_prefs", "gender", "id", "name", "vending_freq", "would_seek" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE TABLE "new_Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participant_id" INTEGER NOT NULL,
    "distributor_id" TEXT NOT NULL DEFAULT 'SAFEBOX-A',
    "budget_set" REAL NOT NULL,
    "total_spent" REAL NOT NULL DEFAULT 0,
    "items_purchased" INTEGER NOT NULL DEFAULT 0,
    "session_start" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_end" DATETIME,
    "feedback_realism" INTEGER,
    "feedback_would_use" TEXT,
    "feedback_comment" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Session_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "Distributor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("budget_set", "completed", "feedback_comment", "feedback_realism", "feedback_would_use", "id", "items_purchased", "participant_id", "session_end", "session_start", "total_spent") SELECT "budget_set", "completed", "feedback_comment", "feedback_realism", "feedback_would_use", "id", "items_purchased", "participant_id", "session_end", "session_start", "total_spent" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Stock_distributor_id_product_id_key" ON "Stock"("distributor_id", "product_id");
