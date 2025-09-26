-- CreateTable
CREATE TABLE `Roles` (
    `idRol` INTEGER NOT NULL AUTO_INCREMENT,
    `nomRol` ENUM('SUPERADMIN', 'ADMINISTRADOR', 'USUARIO') NOT NULL,

    PRIMARY KEY (`idRol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuarios` (
    `idUsuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nomUsuario` VARCHAR(60) NOT NULL,
    `apeUsuario` VARCHAR(60) NOT NULL,
    `tipdocUsuario` ENUM('TI', 'CC', 'PS') NOT NULL,
    `docUsuario` VARCHAR(15) NOT NULL,
    `emaUsuario` VARCHAR(100) NOT NULL,
    `paswUsuario` VARCHAR(250) NOT NULL,
    `rol_idUsuario` INTEGER NOT NULL DEFAULT 3,
    `fecha_creacionUsuario` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuarios_docUsuario_key`(`docUsuario`),
    UNIQUE INDEX `Usuarios_emaUsuario_key`(`emaUsuario`),
    PRIMARY KEY (`idUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehiculos` (
    `idVehiculo` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('BICICLETA', 'MOTO', 'CARRO') NOT NULL,
    `placa` VARCHAR(15) NULL,
    `manilla_id` INTEGER NOT NULL,
    `fotoEntrada` VARCHAR(255) NOT NULL,
    `vectorCaracteristicas` JSON NULL,
    `fechaEntrada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaSalida` DATETIME(3) NULL,
    `estado` ENUM('DENTRO', 'FUERA') NOT NULL DEFAULT 'DENTRO',

    UNIQUE INDEX `Vehiculos_placa_key`(`placa`),
    PRIMARY KEY (`idVehiculo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Manillas` (
    `idManilla` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `estado` ENUM('LIBRE', 'ASIGNADA') NOT NULL DEFAULT 'LIBRE',

    UNIQUE INDEX `Manillas_codigo_key`(`codigo`),
    PRIMARY KEY (`idManilla`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bicicletas` (
    `idBicicleta` INTEGER NOT NULL AUTO_INCREMENT,
    `manilla_id` INTEGER NOT NULL,
    `fotoEntrada` VARCHAR(255) NOT NULL,
    `vectorCaracteristicas` JSON NULL,
    `fechaEntrada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaSalida` DATETIME(3) NULL,
    `estado` ENUM('DENTRO', 'FUERA') NOT NULL DEFAULT 'DENTRO',

    PRIMARY KEY (`idBicicleta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accesos` (
    `idAcceso` INTEGER NOT NULL AUTO_INCREMENT,
    `bicicleta_id` INTEGER NOT NULL,
    `fotoEntrada` VARCHAR(255) NOT NULL,
    `fotoSalida` VARCHAR(255) NULL,
    `fechaEntrada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaSalida` DATETIME(3) NULL,
    `validadoPor` INTEGER NULL,
    `estado` ENUM('DENTRO', 'FUERA', 'EN_REVISION') NOT NULL DEFAULT 'DENTRO',

    PRIMARY KEY (`idAcceso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuarios` ADD CONSTRAINT `Usuarios_rol_idUsuario_fkey` FOREIGN KEY (`rol_idUsuario`) REFERENCES `Roles`(`idRol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehiculos` ADD CONSTRAINT `Vehiculos_manilla_id_fkey` FOREIGN KEY (`manilla_id`) REFERENCES `Manillas`(`idManilla`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bicicletas` ADD CONSTRAINT `Bicicletas_manilla_id_fkey` FOREIGN KEY (`manilla_id`) REFERENCES `Manillas`(`idManilla`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accesos` ADD CONSTRAINT `Accesos_bicicleta_id_fkey` FOREIGN KEY (`bicicleta_id`) REFERENCES `Bicicletas`(`idBicicleta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accesos` ADD CONSTRAINT `Accesos_validadoPor_fkey` FOREIGN KEY (`validadoPor`) REFERENCES `Usuarios`(`idUsuario`) ON DELETE SET NULL ON UPDATE CASCADE;
