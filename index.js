var calculation = new Calculation();
$(document).ready(function(){
    $("#csv_format").css("border-width", "2px");
})

function AddColumn() {
    let current_ts = Date.now()
    $("#accordion").append(`
        <li class="relative border-b border-gray-200">
            <button type="button" class="w-full px-6 py-6 text-left" @click="selected !== `+current_ts+` ? selected = `+current_ts+` : selected = null">
            <div class="flex items-center justify-between"> 
                <span id="span`+current_ts+`">Column</span> 
                <svg :class="{'transform rotate-180' : selected == `+current_ts+`}" class="w-5 h-5 text-gray-500" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </button>
            <div class="relative overflow-hidden transition-all max-h-0 duration-700" x-ref="container`+current_ts+`" x-bind:style="selected == `+current_ts+` ? 'max-height: ' + $refs.container`+current_ts+`.scrollHeight + 'px' : ''">
                <div class="px-6 pb-6 flex flex-col">
                <label>Column Name:</label>
                <input class="name border-b-2" onkeyup="RenameColumn(`+current_ts+`,this.value)" placeholder="Column's Name"/>
                <label class="mt-5">Column Formula:</label>
                <input class="formula border-b-2" onkeyup="generatePreviewTable()" placeholder="random()"/>
                </div>
                <button
                class="inline-flex float-right items-center m-5 px-4 py-2 bg-red-600 transition ease-in-out delay-75 hover:bg-red-700 text-white text-sm font-medium rounded-md hover:-translate-y-1 hover:scale-110"
                onclick="DeleteComlumn(this)"
                >
                <svg
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    fill="none"
                    class="h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke-width="2"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    ></path>
                </svg>
                Delete
                </button>
            </div>
        </li>
    `);
    generatePreviewTable();
}

function RenameColumn(ts, name){
    $("#span"+ts.toString()).text(name)
    if(!name) $("#span"+ts.toString()).text(`Column No.`+($('ul#accordion li').length))
    generatePreviewTable();  
}

function DeleteComlumn(column) {
    $(column).parent().parent().remove();
    generatePreviewTable();
}

function generatePreviewTable(){
    let head = `<thead class="bg-gray-50 text-slate-800">
                    <tr class="divide-x divide-gray-200">`
    let body = `<tbody class="divide-y divide-gray-200 bg-white text-slate-800">`
    let index = 1;
    let tableData = []
    $('ul#accordion li').each(function(){
        // console.log($(col+" div input.formula").val())
        let name = $(this).find(".name").val()!==""?$(this).find(".name").val():"Col No."+index;
        head += `<th class="px-4 py-2">`+ name +`</th>`;
        let formula = $(this).find(".formula").val()!==""?$(this).find(".formula").val():"" ;
        tableData.push(formula)
        index++;
    })
    for(let i = 0; i < 5; i++) {
        body += `<tr class="divide-x divide-gray-200">`;
        index = 1;
        for(let formula of tableData) {
            try {
                body += `<td class="px-4 py-2">`+(formula!=""?AnalysisFormula(formula):("Formula No."+index)) +`</td>`;
            }
            catch {
                body += `<td class="px-4 py-2"><strong>ERROR<strong></td>`;
            }
            index++;
        }
        body += `</tr>`
    }
    head += `</tr></thead>`
    body += `</tbody>`
    $(".preview-table").html(head+body)
}

// function getAllIndexes(arr, val) {
//     var indexes = [], i = -1;
//     while ((i = arr.indexOf(val, i+1)) != -1){
//         indexes.push(i);
//     }
//     return indexes;
// }

function SplitAtIndexes(value, indexArray) {
    let result = [];
    if(parseInt(indexArray[0]) != 0 && indexArray.length!=0) { //in case formula not start with string
        result.push(value.substring(0, indexArray[0]));
    }
    for (let i = 1; i < indexArray.length; i++) {
        result.push(value.substring(indexArray[i-1], indexArray[i]));
    }
    if(parseInt(indexArray[indexArray.length - 1]) != value.length ) { //in case formula not start with string
        result.push(value.substring(indexArray[indexArray.length - 1], value.length));
    }
    return result.filter(n => n) //just remove empty element(s)
}

function replaceFromTo(str, fromIndex, toIndex, replaceValue) {
    return str.substring(0, fromIndex) + replaceValue + str.substring(toIndex);
}

function checkFormulaFormat(nameFunction, checkString) {
    let regex = new RegExp(nameFunction + "\((.*?)\)");
    let startIndex = checkString.indexOf(nameFunction);
    let endIndex = checkString.indexOf(')', startIndex)+1;
    return checkString.includes(nameFunction) && regex.test(checkString.substring(startIndex, endIndex))
}

function AnalysisFormula(formula){
    let curlybracketIndex = [];
    let tempCurlyBraceCount = 0;
    let openBraceIndex = null;
    for(let charIndex in formula.split('')) {
        if(formula[charIndex] === '{') {
            if(tempCurlyBraceCount === 0 ) {
                openBraceIndex = parseInt(charIndex); //add first open bracket

            }
            tempCurlyBraceCount++;
        }
        else if (formula[charIndex] === '}') {
            if(tempCurlyBraceCount === 1) {
                curlybracketIndex.push(openBraceIndex);
                curlybracketIndex.push(parseInt(charIndex)+1); //add close bracket based on the open one
                openBraceIndex = null;
            }
            tempCurlyBraceCount--;
        }
    }
    let formulaArray = SplitAtIndexes(formula, curlybracketIndex); //break formula into blocks
    for(let block in formulaArray) {
        if(formulaArray[block][0] === '{') {
            formulaArray[block] = formulaArray[block].substring(1,formulaArray[block].length-1); //remove braces from both sides
            continue;
        }
        formulaArray[block] = formulaArray[block].replaceAll(' ','')
        //Deal with defined function
        while(checkFormulaFormat('randi', formulaArray[block])) { //replace randi(...) to value
            let randiIndex = formulaArray[block].indexOf('randi');
            let randiPara = formulaArray[block].substring(formulaArray[block].indexOf('(', randiIndex)+1, formulaArray[block].indexOf(')', randiIndex)).replaceAll(' ','').split(",");
            formulaArray[block] = replaceFromTo(formulaArray[block], randiIndex, formulaArray[block].indexOf(')', randiIndex) + 1, randi(parseInt(randiPara[0]), parseInt(randiPara[1])));
        }
        while(checkFormulaFormat('randf', formulaArray[block])) { //replace randf(...) to value
            let randfIndex = formulaArray[block].indexOf('randf');
            let randfPara = formulaArray[block].substring(formulaArray[block].indexOf('(', randfIndex)+1, formulaArray[block].indexOf(')', randfIndex)).replaceAll(' ','').split(",");
            formulaArray[block] = replaceFromTo(formulaArray[block], randfIndex, formulaArray[block].indexOf(')', randfIndex) + 1, randf(parseFloat(randfPara[0]), parseFloat(randfPara[1]), parseInt(randfIndex[2])))
        }
        while(checkFormulaFormat('randl', formulaArray[block])) { //replace randl(...) to value
            let randlIndex = formulaArray[block].indexOf('randl');
            let randlPara = JSON.parse(formulaArray[block].substring(formulaArray[block].indexOf('(', randlIndex)+1, formulaArray[block].indexOf(')', randlIndex)).replace(/'/g, '"'));
            formulaArray[block] = replaceFromTo(formulaArray[block], randlIndex, formulaArray[block].indexOf(')', randlIndex) + 1, randl(randlPara));
        }
        //Calculate block
        if(formulaArray[block]){
            try {
                let calclateBlock = calculation.calculate(formulaArray[block]);
                if(calclateBlock) {
                    formulaArray[block] = calclateBlock
                }
            } catch {
                throw new Error("Wrong")
            }
        }
    }
    return formulaArray.join('')
}

function addColonToNumber(){
    let number = $("#generateLines").val();
    let splitChar = ',';
    number = number.replaceAll(splitChar,'');
    $("#generateLines").val(number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, splitChar))
}

$('.pickDownloadFormat').click(function(e){
    $(this).next().prop( "checked", true );
    $('.pickDownloadFormat').css("border-width", "0px");
    $(this).css("border-width", "2px");

});

function exportToCSV(objArray, col) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = ""
    try {
        for(data of array){
            json_data = data
            row = []
            for(c of col){
                row.push(json_data[c])
            }
            str += row.join(',') +"\r\n"
        }
    }
    finally {
        var element = document.createElement('a');
        element.href = 'data:text/csv;charset=utf-8,' + encodeURI(str);
        element.target = '_blank';
        element.download = "Letmedummyyourdata" + Date.now().toString() + ".csv";
        element.click();
        element.remove();
    }
}

function exportToJSON(exportObj){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var element = document.createElement('a');
    element.setAttribute("target",  '_blank');
    element.setAttribute("href",     dataStr);
    element.setAttribute("download", "Letmedummyyourdata" + Date.now().toString() + ".json");
    document.body.appendChild(element); // required for firefox
    element.click();
    element.remove();
  }

function generateToExport(){
    let downloadType = $('input[name=download_format]:checked', '.menu').val();
    let dataToGenerate = [];
    let columnsName = [];
    let columnsFormula = [];
    let index = 1;
    $('ul#accordion li').each(function(){
        let name = $(this).find(".name").val()!==""?$(this).find(".name").val():"Col No."+index;
        columnsName.push(name);
        let formula = $(this).find(".formula").val()!==""?$(this).find(".formula").val():"" ;
        columnsFormula.push(formula);
        index++;
    })
    try {
        let lines = $("#generateLines").val().replaceAll(',','');
        for(let line = 1; line <= lines; line++){
            let tempObj = {};
            for(let formulaIndex in columnsFormula) {
                tempObj[columnsName[formulaIndex]] = AnalysisFormula(columnsFormula[formulaIndex]);
            }
            dataToGenerate.push(tempObj);
        }
    }
    finally {
        if (downloadType === 'csv') exportToCSV(dataToGenerate, columnsName);
        else if(downloadType === 'json') exportToJSON(dataToGenerate);
    }
}