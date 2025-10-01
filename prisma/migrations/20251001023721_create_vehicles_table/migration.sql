/*
  Warnings:

  - You are about to drop the `Accesos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bicicletas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Manillas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehiculos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Accesos` DROP FOREIGN KEY `Accesos_bicicleta_id_fkey`;

-- DropForeignKey
ALTER TABLE `Accesos` DROP FOREIGN KEY `Accesos_validadoPor_fkey`;

-- DropForeignKey
ALTER TABLE `Bicicletas` DROP FOREIGN KEY `Bicicletas_manilla_id_fkey`;

-- DropForeignKey
ALTER TABLE `Usuarios` DROP FOREIGN KEY `Usuarios_rol_idUsuario_fkey`;

-- DropForeignKey
ALTER TABLE `Vehiculos` DROP FOREIGN KEY `Vehiculos_manilla_id_fkey`;

-- DropTable
DROP TABLE `Accesos`;

-- DropTable
DROP TABLE `Bicicletas`;

-- DropTable
DROP TABLE `Manillas`;

-- DropTable
DROP TABLE `Roles`;

-- DropTable
DROP TABLE `Usuarios`;

-- DropTable
DROP TABLE `Vehiculos`;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `plate` VARCHAR(255) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `facePhoto` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `vehicles_plate_key`(`plate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `idUsuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nomUsuario` VARCHAR(255) NOT NULL,
    `docUsuario` VARCHAR(255) NOT NULL,
    `emaUsuario` VARCHAR(255) NOT NULL,
    `rol_idUsuario` INTEGER NOT NULL DEFAULT 2,
    `fecha_creacionUsuario` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pasUsuario` VARCHAR(255) NOT NULL,
    `photoUrl` VARCHAR(255) NULL,
    `habilitado2FA` BOOLEAN NOT NULL DEFAULT false,
    `secret2FA` VARCHAR(255) NULL,

    UNIQUE INDEX `usuarios_docUsuario_key`(`docUsuario`),
    UNIQUE INDEX `usuarios_emaUsuario_key`(`emaUsuario`),
    INDEX `usuarios_rol_idUsuario_fkey`(`rol_idUsuario`),
    PRIMARY KEY (`idUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `idRol` INTEGER NOT NULL AUTO_INCREMENT,
    `nomRol` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`idRol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_idUsuario_fkey` FOREIGN KEY (`rol_idUsuario`) REFERENCES `roles`(`idRol`) ON DELETE RESTRICT ON UPDATE CASCADE;
