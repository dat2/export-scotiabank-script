// ==UserScript==
// @name         Export Scotiabank Csv
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  shows how to use babel compiler
// @author       You
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.3.3/papaparse.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js
// @match        https://www2.scotiaonline.scotiabank.com/*
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
/* jshint ignore:end */
    /* jshint esnext: false */
    /* jshint esversion: 6 */

    // Your code here...
    
    // scotia bank inserts stupid rows
    function isValidRow(row) {
        return !(row.classList.contains('stmt') || row.classList.contains('stmt-brk') || row.classList.contains('stmt-currprd'));
    }
    function makeCsvRowFromHtmlRow(row) {
        // date is the first element
        const date = moment(row.children[0].textContent, 'MMM. D, YYYY');
        const dateStr = date.format('M/D/YY');
        
        // amount is the second element
        const [debitNode, creditNode] = row.querySelectorAll('.balance');
        const debit = parseFloat(debitNode.textContent);
        const credit = parseFloat(creditNode.textContent);
        const amount = isNaN(debit) ? credit : -debit;

        // credit card has no "transactiont type"
        // "transaction description" is the 3rd row
        const description = row.children[2].textContent.replace(/\s+/g, ' ').trim();

        return [ dateStr, amount, '-', '', description ];
    }
    function makeCsvRows() {
        const table = document.querySelector('tbody.thtable');
        return Array.from(table.children)
            .filter(isValidRow)
            .map(makeCsvRowFromHtmlRow);
    }
    function makeCsvString(rows) {
           return Papa.unparse(rows, { quotes: [ false, false, false, true, true ] });
    }
    function saveFile() {
        const blob = new Blob([makeCsvString(makeCsvRows()) + '\n'], {type:'text/csv;charset=utf-8'});
        saveAs(blob, 'pcbanking.csv');
    }
    function addExportButton() {
        const makePaymentButton = document.getElementById('ft_form');
        
        const exportButton = document.createElement('button');
        exportButton.innerHTML = 'EXPORT TO HLEDGER';
        exportButton.setAttribute('type', 'button');
        exportButton.onclick = saveFile;
        
        makePaymentButton.insertAdjacentElement('afterend', exportButton);
    }
    addExportButton();

/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */
