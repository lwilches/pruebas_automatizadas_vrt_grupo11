
import { Resultado  } from "./Resultado"
import * as _ from 'lodash' 

export class ReportHtml{

    addIteminBrowser(    escenario: string , browser :string ,   esecenariosResult : Array<Resultado > ):string {
        let   html    : Array<string> = []
        html.push(  `<div class=" browser mb-3" id="test0">`) 
        html.push( `
        <div class="title">
            <h1>Escenario: ${escenario}</h2>
            <h2>Browser: ${browser}</h2>  
        </div>`)

        html.push(`<div class="container text-center mb-4"> `)
        esecenariosResult.forEach(item=> {

            html.push(`<div class="row mb-2 ">
                        <div  class= "col"  style='text-align: left;' " > `)
                    html.push(`<h2> Step:<u> ${ item.step}</u> </h2> `)
            html.push(` </div>
                     </div> `)

            html.push(`<div class="row">
                        <div  class= "col" > `)

            html.push("<hr>")
            html.push(`<table class ="table" style='width:75%' >` )            
                   

            html.push(`  <thead>
                            <tr>
                            <th scope="col">Parametro</th>
                            <th scope="col">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                               <th scope="row">isSameDimensions</th>
                                <td><strong> ${item.dataResultCompare.isSameDimensions } <strong> </td>
                            </tr> 
                            <tr>
                                <th scope="row" rowspan='2'>dimensionDifference</th>
                                <td><strong>width: ${item.dataResultCompare.dimensionDifference.width} </strong> </td>
                            </tr> 
                            <tr>
                                <td><strong>height:</strong>${item.dataResultCompare.dimensionDifference.height}</td>
                            </tr> 

                            <tr>
                                <th scope="row">rawMisMatchPercentage</th>
                                <td><strong>${item.dataResultCompare.rawMisMatchPercentage }</strong></td>
                            </tr> 
                            <tr>
                                <th scope="row">misMatchPercentage</th>
                                <td><strong>${item.dataResultCompare.misMatchPercentage }</strong></td>
                            </tr> 


                            <tr>
                                <th scope="row" rowspan ='4'>diffBounds</th>
                                <td><strong>width: ${item.dataResultCompare.diffBounds.top} </strong> </td>
                            </tr> 
                            <tr>
                                <td><strong>height:</strong>${item.dataResultCompare.diffBounds.left}</strong></td>
                            </tr> 
                            <tr>
                                <td><strong>height:</strong>${item.dataResultCompare.diffBounds.bottom}</strong></td>
                            </tr> 
                            <tr>
                                <td><strong>height:</strong>${item.dataResultCompare.diffBounds.right}</strong></td>
                            </tr> 

                        </tbody>    `)        

            html.push(`</table>` )              

            html.push(` </div>
                     </div> `)
            html.push( `
                <div class="row mb-5">
                    <div class="col" style='border:1px solid blue;'>
                        <span class="imgname"><strong>Reference</strong></span>
                        <img class="img2" src="${item.pathImgBefore}"   label="Reference">
                    </div>
                    <div class="col" style='border:1px solid blue;'>
                        <span class="imgname"><strong>Test</strong></span>
                        <img class="img2" src="${item.pathImgAfter}"   label="Test">
                    </div>
                    <div class="col" style='border:1px solid blue;'>
                        <span class="imgname"><strong>Diff</strong></span>
                        <img class="img2" src="${item.imagenResult}"  label="Diff">
                    </div>
                </div>
            `)
        } );
        html.push(` </div>`) 
        html.push(`</div>`)    
        return html.join('\n');
    }

    createBody( esecenariosResult :Array<Resultado >) {

        let grupo =  _.groupBy(esecenariosResult, item=> item.key  );
        let arrayGrupo =  Object.keys(grupo ).map( key => {
            let items = grupo[key];
            return{
                key: key ,
                escenario : items[0].escenario ,
                browser : items[0].browser ,
                grupo: items
            }
        });
        let htmlBody : Array<string> =[];
        arrayGrupo.forEach( item => {
            console.log(` ${item.escenario } - ${item.browser} - ${item.key} - ${item.grupo.length} ` );

            htmlBody.push( this.addIteminBrowser(  item.escenario , item.browser , item.grupo))
        })
        return htmlBody.join('\n');
    }


    createReport(datetime, url,   esecenariosResult :Array<Resultado > ){
        let httmlBody :string = this.createBody(esecenariosResult)    ;
        return `
        <html>
            <head>
                <title> VRT Report </title>
                <!-- CSS only -->
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossorigin="anonymous">
                <link href="index.css" type="text/css" rel="stylesheet">
            </head>
            <body>
                <h1>Report for 
                    <a href=${url}"> ${url}</a>
                </h1>
                <p>Executed: ${datetime}</p>
                <div id="visualizer">
                    ${httmlBody}
                </div>
                <!-- JavaScript Bundle with Popper -->
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-OERcA2EqjJCMA+/3y+gxIOqMEjwtxJY7qPCqsdltbNJuaOe923+mo//f6V8Qbsw3" crossorigin="anonymous"></script>
            </body>
        </html>`
    }

}