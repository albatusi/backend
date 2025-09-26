-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `habilitado2FA` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `secret2FA` VARCHAR(255) NULL;
