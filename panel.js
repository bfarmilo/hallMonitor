// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

let reqNumber = 0;

const tableData = [];

const entry = [
    { type: 'div', class: 'index', label: 'Num.', value: data => data.index || reqNumber },
    { type: 'div', class: 'time', label: 'Req. Complete', value: data => data.timeStamp },
    { type: 'div', class: 'protocol', label: 'Protocol', value: data => data.protocol },
    { type: 'div', class: 'target', label: 'URL', value: (data, crop = 200) => data.uri ? data.uri.slice(0, crop).concat(data.uri.length > crop ? '...' : '') : '' },
    { type: 'div', class: 'status', label: 'Resp. Status', value: data => data.response.status }
];

document.querySelector('#insertmessagebutton').onclick = function clearLog() {
    const timestamps = document.getElementById('timestamps');
    while (timestamps.firstChild) {
        timestamps.removeChild(timestamps.firstChild);
    }
    reqNumber = 1;
    clearDatabase();
};

const sendToClipboard = (payload, mode = 'oldSchool') => {
    if (mode === 'oldSchool') {
        // old school
        const input = document.createElement('textarea');
        document.body.appendChild(input);
        input.innerHTML = payload;
        input.focus();
        input.select();
        const result = document.execCommand('copy');
        if (result === 'unsuccessful') {
            console.error('Failed to copy text.');
        }
        document.body.removeChild(input);
    } else if (mode === 'inject') {
        // throws a focus error
        const content = `setTimeout(() => {
            navigator.clipboard.writeText(\`${payload}\`)
            .then(result => console.log('success'))
            .catch(err=>console.error(err))
        }, 3000)`;
        sendObjectToInspectedPage({ action: 'code', content });
    } else if (mode === 'file') {
        //TODO try to save-as
        const content = `
            function handleDownload() {
                const blob = new Blob([\`${payload}\`], {type: 'text/plain'});
                const url = window.URL.createObjectURL(blob);
                document.getElementById("myDownload").href = url;
                setTimeout(() => {
                window.URL.revokeObjectURL(url);
                }, 10000);
            }

            (function() {
            'use strict';
            document.body.insertAdjacentHTML(
                "afterEnd",
                \`
                <a id="myDownload" href="#" download="networkLog.log">downloading</a>
                \`
            );
            document.getElementById("myDownload").addEventListener("click", handleDownload);
            document.getElementById("myDownload").click();
            document.getElementById("myDownload").remove();
            })();
        `;
        sendObjectToInspectedPage({ action: 'code', content });
    } else {
        console.log('clipboard mode not defined')
    }


}

document.getElementById('copyButton').onclick = async () => {
    const networkDump = await getAllData();
    console.table(networkDump);
    const keyList = Object.keys(networkDump[0]).filter(key => key !== 'uuid');
    const csv = [keyList.join('\t')].concat(networkDump.map(row => keyList.map(key => row[key]).join('\t'))).join('\n');
    sendToClipboard(csv, 'file');
}

document.getElementById('smalllog').onclick = async () => {
    const networkDump = await getAllData();
    const keyList = Object.keys(networkDump[0]).filter(key => key !== 'response' && key !== 'uuid');
    const csv = [keyList.join('\t')].concat(networkDump.map(row => keyList.map(key => row[key]).join('\t'))).join('\n');
    sendToClipboard(csv, 'file');
}

// set up the table heading
(function setHeading() {
    const heading = document.getElementById('tableheader');
    heading.className = 'record';
    const headerRow = entry.map(nodeName => {
        const col = document.createElement(nodeName.type);
        col.className = nodeName.class;
        col.innerHTML = nodeName.label;
        heading.appendChild(col);
        return nodeName.label;
    });
})();

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}


function appendRecord(record) {
    reqNumber += 1;
    // first create a div for the row
    let row = document.createElement('DIV');
    row.className = 'record';
    // now fill in the columns
    const rowData = entry.map(nodeName => {
        const col = document.createElement(nodeName.type);
        col.className = nodeName.class;
        col.innerHTML = nodeName.value(record, 100);
        row.appendChild(col);
        return nodeName.value(record, 1000);
    });
    // append the row to the timestamps section
    document.querySelector('#timestamps').appendChild(row);
    // also add to the (exportable) table entry
    if (!record.uuid) {
        //if there's no uuid, this is an new record, so add it to the indexedDB
        storeRows([[uuidv4(), ...rowData, record.content]]);
    }
    // scroll to the bottom, each time a new row is added
    window.scrollTo({ top: row.offsetTop - window.innerHeight + 50, behaviour: 'smooth' });
};

startDB(`Log ${(new Date()).toISOString().split('T')[0]}`);