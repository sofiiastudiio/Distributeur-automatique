-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "nutritional_info" TEXT NOT NULL,
    "origin_info" TEXT NOT NULL,
    "certifications" TEXT NOT NULL,
    "allergen_free" TEXT NOT NULL,
    "image_emoji" TEXT NOT NULL,
    "image_url" TEXT NOT NULL DEFAULT '',
    "color_from" TEXT NOT NULL,
    "color_to" TEXT NOT NULL,
    "is_vegan" BOOLEAN NOT NULL DEFAULT false,
    "is_vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("allergen_free", "category", "certifications", "color_from", "color_to", "created_at", "description", "id", "image_emoji", "ingredients", "is_vegan", "is_vegetarian", "name", "nutritional_info", "origin_info", "price") SELECT "allergen_free", "category", "certifications", "color_from", "color_to", "created_at", "description", "id", "image_emoji", "ingredients", "is_vegan", "is_vegetarian", "name", "nutritional_info", "origin_info", "price" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
