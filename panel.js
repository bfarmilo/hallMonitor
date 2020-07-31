// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

const tableHeader = ['Number', 'Request Complete Time', 'Protocol', 'URL', 'Response Status'];

let tableData = [];

document.querySelector('#insertmessagebutton').onclick = function clearLog() {
    const timestamps = document.getElementById('timestamps');
    while (timestamps.firstChild) {
        console.log('clearing', timestamps.firstChild.innerHTML);
        timestamps.removeChild(timestamps.firstChild);
    }

};

document.getElementById('copyButton').onclick = () => {
    console.table([tableHeader].concat(tableData));
    const csv = [tableHeader].concat(tableData).map(row => row.join('\t')).join('\n');
    //navigator.clipboard.writeText(csv).then(result => console.log('successfully copied to clipboard')).catch(err => console.error(err));
    //TODO try sending this to the inspected page then to the clipboard
}

const entry = [
    { type: 'div', class: 'index', value: () => tableData.length + 1 },
    { type: 'div', class: 'time', value: data => data.timeStamp },
    { type: 'div', class: 'protocol', value: data => data.protocol },
    { type: 'div', class: 'target', value: data => data.uri ? data.uri.slice(0, 200).concat(data.uri.length > 200 ? '...' : '') : '' },
    { type: 'div', class: 'status', value: data => data.response.status }
]

function appendRecord(record) {
    // first create a div for the row
    let row = document.createElement('DIV');
    row.className = 'record';
    // now fill in the columns
    const rowData = entry.map(nodeName => {
        const col = document.createElement(nodeName.type);
        col.className = nodeName.class;
        col.innerHTML = nodeName.value(record);
        row.appendChild(col);
        return nodeName.value(record);
    });
    // append the row to the timestamps section
    document.querySelector('#timestamps').appendChild(row);
    // also add to the (exportable) table entry
    tableData.push(rowData);
    // scroll to the bottom, each time a new row is added
    window.scrollTo({ top: row.offsetTop - window.innerHeight - 50, behaviour: 'smooth' });
}