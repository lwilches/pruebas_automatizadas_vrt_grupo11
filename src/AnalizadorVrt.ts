
import { readdir, writeFile, readFile , copyFile} from 'node:fs/promises';

const fs = require('fs');
//import {compareImages} from  "resemblejs/compareImages"
const compareImages = require("resemblejs/compareImages")


const config = require('../config.json')
const { viewportHeight, viewportWidth, browsers, options } = config;
import { Resultado} from './Resultado';
import { mkdir, readFileSync } from 'node:fs';
import { resourceLimits } from 'node:worker_threads';


export class AnalizadorVrt
{

    //procesa archivos
    private async  procFiles(directorios :[string, string, string][], datetime :string,  resultados: Array<Resultado>) :Promise<Array<Resultado>> {
        

        await  Promise.all(  directorios.map(async infoEscenario => {
            let    archivos_before = await readdir(infoEscenario[1], { withFileTypes:true });
            let    archivos_after  = await readdir(infoEscenario[2], { withFileTypes:true });

            
            await Promise.all( archivos_before.filter( c=> c.isFile ).map(async file =>{

                let arrayId = file.name.split('-');


                let arrayName = file.name.split('__');
                let browser = 'default';
                if (arrayName.length  > 1 )
                    browser  =  (arrayName[ arrayName.length - 1 ] ) || "default"

                let afterFileName =(archivos_after.filter(item=> item.name = file.name )[0])?.name || ""     
                let beforeFilename  = file.name
                

                let beforePathFile =  infoEscenario[1] + "\\" +  beforeFilename ;
                let afterPathFile  = infoEscenario[2] + "\\" +  afterFileName  ;
                let resultPath = `./resultVrt/${datetime}/${infoEscenario[0]}`    

                let beforeCopyPath = resultPath + "\\" +   'before_' +  beforeFilename;
                let afterCopyPath = resultPath + "\\" +    'after_' +  afterFileName;

                let id = +arrayId[0];    
                
                if (! fs.existsSync(resultPath)){
                    fs.mkdirSync(resultPath,  { recursive: true });
                }

                await copyFile( beforePathFile,beforeCopyPath )
                await copyFile( afterPathFile,afterCopyPath )

                let  streamFileBefore = await  readFile( beforePathFile );
                let  streamFileAfter = await readFile( afterPathFile  );
                const  data_result_comparation  = await  compareImages( streamFileBefore ,  streamFileAfter, options);

                let resultado = new Resultado();
                resultado.browser = browser ;    
                resultado.escenario = infoEscenario[0];
                resultado.dataResultCompare = {
                    isSameDimensions: data_result_comparation.isSameDimensions,
                    dimensionDifference: data_result_comparation.dimensionDifference,
                    rawMisMatchPercentage: data_result_comparation.rawMisMatchPercentage,
                    misMatchPercentage: data_result_comparation.misMatchPercentage,
                    diffBounds: data_result_comparation.diffBounds,
                    analysisTime: data_result_comparation.analysisTime
                }


                
                beforeCopyPath =   `../${datetime}/${infoEscenario[0]}/before_${ beforeFilename}`;
                afterCopyPath =  `../${datetime}/${infoEscenario[0]}/after_${ afterFileName}`; 

                resultado.pathImgBefore = beforeCopyPath;
                resultado.pathImgAfter = afterCopyPath;
                resultado.step = beforeFilename;
                resultado.id = id;

                var fileNameCompare = `${resultPath}/compare-${file.name}`
                await writeFile(fileNameCompare, data_result_comparation.getBuffer());

                fileNameCompare =  `../${datetime}/${infoEscenario[0]}/compare-${file.name}`; 
                resultado.imagenResult = fileNameCompare;
                resultado.key =  `${resultado.escenario}-${resultado.browser}`
                resultados.push(resultado);
                
                
            }));
        }));

        return resultados.sort((obj1, obj2) => {
            if (obj1.id > obj2.id) {
              return 1;
            }
          
            if (obj1.id < obj2.id) {
              return -1;
            }
          
            return 0;
          });
    }

    //ejecuta comparaciiones 
    async execTestVrt  ( path  : string , datetime :string  ) :  Promise<Array<Resultado>> {
        const prefix ="before";
        let  directorios :  [string, string, string][] = [] ;
        const items  = await readdir(path, { withFileTypes:true });
        items.forEach(item  => {
            if (item.isDirectory()){
                let  nombres = item.name.split('_');
                if (nombres.length >= 1 && nombres[0] == prefix)
                {
                    var  esecenario = item.name.substring(  (prefix + '_').length);
                    directorios.push( [esecenario, path + "\\" + prefix + '_' + esecenario ,  path + "\\" +  'after_' +  esecenario]);
                }
            } 
        });
        // compara  imagenes en carpeta  escenarios 
        let resultados = new Array<Resultado>();
        await this.procFiles(directorios, datetime,  resultados);
        return resultados;
    }
    
}



