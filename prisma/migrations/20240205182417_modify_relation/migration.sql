-- CreateTable
CREATE TABLE "_first_layer_container" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_first_layer_snippet" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_first_layer_container_AB_unique" ON "_first_layer_container"("A", "B");

-- CreateIndex
CREATE INDEX "_first_layer_container_B_index" ON "_first_layer_container"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_first_layer_snippet_AB_unique" ON "_first_layer_snippet"("A", "B");

-- CreateIndex
CREATE INDEX "_first_layer_snippet_B_index" ON "_first_layer_snippet"("B");

-- AddForeignKey
ALTER TABLE "_first_layer_container" ADD CONSTRAINT "_first_layer_container_A_fkey" FOREIGN KEY ("A") REFERENCES "container"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_first_layer_container" ADD CONSTRAINT "_first_layer_container_B_fkey" FOREIGN KEY ("B") REFERENCES "version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_first_layer_snippet" ADD CONSTRAINT "_first_layer_snippet_A_fkey" FOREIGN KEY ("A") REFERENCES "snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_first_layer_snippet" ADD CONSTRAINT "_first_layer_snippet_B_fkey" FOREIGN KEY ("B") REFERENCES "version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
