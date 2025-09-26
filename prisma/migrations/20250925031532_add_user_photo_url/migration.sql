/*
  Warnings:

  - You are about to alter the column `nomRol` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(255)`.
  - You are about to drop the column `apeUsuario` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `paswUsuario` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `tipdocUsuario` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `accesos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bicicletas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `manillas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehiculos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pasUsuario` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `accesos` DROP FOREIGN KEY `Accesos_bicicleta_id_fkey`;

-- DropForeignKey
ALTER TABLE `accesos` DROP FOREIGN KEY `Accesos_validadoPor_fkey`;

-- DropForeignKey
ALTER TABLE `bicicletas` DROP FOREIGN KEY `Bicicletas_manilla_id_fkey`;

-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `Usuarios_rol_idUsuario_fkey`;

-- DropForeignKey
ALTER TABLE `vehiculos` DROP FOREIGN KEY `Vehiculos_manilla_id_fkey`;

-- AlterTable
ALTER TABLE `roles` MODIFY `nomRol` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `apeUsuario`,
    DROP COLUMN `paswUsuario`,
    DROP COLUMN `tipdocUsuario`,
    ADD COLUMN `pasUsuario` VARCHAR(255) NOT NULL,
    ADD COLUMN `photoUrl` VARCHAR(255) NULL,
    MODIFY `nomUsuario` VARCHAR(255) NOT NULL,
    MODIFY `docUsuario` VARCHAR(255) NOT NULL,
    MODIFY `emaUsuario` VARCHAR(255) NOT NULL,
    MODIFY `rol_idUsuario` INTEGER NOT NULL DEFAULT 2;

-- DropTable
DROP TABLE `accesos`;

-- DropTable
DROP TABLE `bicicletas`;

-- DropTable
DROP TABLE `manillas`;

-- DropTable
DROP TABLE `vehiculos`;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_idUsuario_fkey` FOREIGN KEY (`rol_idUsuario`) REFERENCES `Roles`(`idRol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `usuarios` RENAME INDEX `Usuarios_docUsuario_key` TO `usuarios_docUsuario_key`;

-- RenameIndex
ALTER TABLE `usuarios` RENAME INDEX `Usuarios_emaUsuario_key` TO `usuarios_emaUsuario_key`;
