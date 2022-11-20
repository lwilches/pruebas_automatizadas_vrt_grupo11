import { AnalizadorVrt } from './AnalizadorVrt'
const fs = require('fs');
import {ReportHtml } from  './Report'

var analizador  = new AnalizadorVrt();

let datetime = new Date().toISOString().replace(/:/g,".");
(async ()=> await analizador.execTestVrt('./resultFunctionalTest', datetime).then( resultados=>{
    let  reportHtml : ReportHtml = new ReportHtml();
    
    console.log(`Generando reporte Nro registros ${resultados.length    } `)  ;
    fs.writeFileSync (`./resultVrt/${datetime}/report.html`, reportHtml.createReport(datetime,'Ghost', resultados));
    fs.copyFileSync('./index.css', `./resultVrt/${datetime}/index.css`);
    console.log(`Reporte genrado correctamente ./resultVrt/${datetime} `)  ;

}))();
