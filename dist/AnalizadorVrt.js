"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalizadorVrt = void 0;
const promises_1 = require("node:fs/promises");
const fs = require('fs');
//import {compareImages} from  "resemblejs/compareImages"
const compareImages = require("resemblejs/compareImages");
const config = require('../config.json');
const { viewportHeight, viewportWidth, browsers, options } = config;
const Resultado_1 = require("./Resultado");
class AnalizadorVrt {
    //procesa archivos
    procFiles(directorios, datetime, resultados) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(directorios.map((infoEscenario) => __awaiter(this, void 0, void 0, function* () {
                let archivos_before = yield (0, promises_1.readdir)(infoEscenario[1], { withFileTypes: true });
                let archivos_after = yield (0, promises_1.readdir)(infoEscenario[2], { withFileTypes: true });
                yield Promise.all(archivos_before.filter(c => c.isFile).map((file) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    let arrayId = file.name.split('-');
                    let arrayName = file.name.split('__');
                    let browser = 'default';
                    if (arrayName.length > 1)
                        browser = (arrayName[arrayName.length - 1]) || "default";
                    let afterFileName = ((_a = (archivos_after.filter(item => item.name = file.name)[0])) === null || _a === void 0 ? void 0 : _a.name) || "";
                    let beforeFilename = file.name;
                    let beforePathFile = infoEscenario[1] + "\\" + beforeFilename;
                    let afterPathFile = infoEscenario[2] + "\\" + afterFileName;
                    let resultPath = `./resultVrt/${datetime}/${infoEscenario[0]}`;
                    let beforeCopyPath = resultPath + "\\" + 'before_' + beforeFilename;
                    let afterCopyPath = resultPath + "\\" + 'after_' + afterFileName;
                    let id = +arrayId[0];
                    if (!fs.existsSync(resultPath)) {
                        fs.mkdirSync(resultPath, { recursive: true });
                    }
                    yield (0, promises_1.copyFile)(beforePathFile, beforeCopyPath);
                    yield (0, promises_1.copyFile)(afterPathFile, afterCopyPath);
                    let streamFileBefore = yield (0, promises_1.readFile)(beforePathFile);
                    let streamFileAfter = yield (0, promises_1.readFile)(afterPathFile);
                    const data_result_comparation = yield compareImages(streamFileBefore, streamFileAfter, options);
                    let resultado = new Resultado_1.Resultado();
                    resultado.browser = browser;
                    resultado.escenario = infoEscenario[0];
                    resultado.dataResultCompare = {
                        isSameDimensions: data_result_comparation.isSameDimensions,
                        dimensionDifference: data_result_comparation.dimensionDifference,
                        rawMisMatchPercentage: data_result_comparation.rawMisMatchPercentage,
                        misMatchPercentage: data_result_comparation.misMatchPercentage,
                        diffBounds: data_result_comparation.diffBounds,
                        analysisTime: data_result_comparation.analysisTime
                    };
                    beforeCopyPath = `../${datetime}/${infoEscenario[0]}/before_${beforeFilename}`;
                    afterCopyPath = `../${datetime}/${infoEscenario[0]}/after_${afterFileName}`;
                    resultado.pathImgBefore = beforeCopyPath;
                    resultado.pathImgAfter = afterCopyPath;
                    resultado.step = beforeFilename;
                    resultado.id = id;
                    var fileNameCompare = `${resultPath}/compare-${file.name}`;
                    yield (0, promises_1.writeFile)(fileNameCompare, data_result_comparation.getBuffer());
                    fileNameCompare = `../${datetime}/${infoEscenario[0]}/compare-${file.name}`;
                    resultado.imagenResult = fileNameCompare;
                    resultado.key = `${resultado.escenario}-${resultado.browser}`;
                    resultados.push(resultado);
                })));
            })));
            return resultados.sort((obj1, obj2) => {
                if (obj1.id > obj2.id) {
                    return 1;
                }
                if (obj1.id < obj2.id) {
                    return -1;
                }
                return 0;
            });
        });
    }
    //ejecuta comparaciiones 
    execTestVrt(path, datetime) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefix = "before";
            let directorios = [];
            const items = yield (0, promises_1.readdir)(path, { withFileTypes: true });
            items.forEach(item => {
                if (item.isDirectory()) {
                    let nombres = item.name.split('_');
                    if (nombres.length >= 1 && nombres[0] == prefix) {
                        var esecenario = item.name.substring((prefix + '_').length);
                        directorios.push([esecenario, path + "\\" + prefix + '_' + esecenario, path + "\\" + 'after_' + esecenario]);
                    }
                }
            });
            // compara  imagenes en carpeta  escenarios 
            let resultados = new Array();
            yield this.procFiles(directorios, datetime, resultados);
            return resultados;
        });
    }
}
exports.AnalizadorVrt = AnalizadorVrt;
//# sourceMappingURL=AnalizadorVrt.js.map