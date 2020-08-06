// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area
chrome.devtools.panels.create("Network Timestamps", "toast.png", "panel.html", function (panel) { });

chrome.devtools.network.onRequestFinished.addListener(
    function (request) {
        if (!request.request.url.includes('chrome-extension')) {
            const timeStamp = `${request.startedDateTime.split(/T(.*)?Z$/)[1]}`
            const [_ignore, protocol, uri] = request.request.url.split(/^(.*?)\:\/?\/?/);
            chrome.devtools.inspectedWindow.eval(`console.log("${timeStamp} %c${(uri && uri.length > 254) ? uri.slice(0, 254) : uri} %c[${protocol}]", "color:rgb(99, 179, 248)", "color:#FFEFD5")`);
            request.getContent((body, encoding) => {
                let content;
                try {
                    content = (encoding === 'base64') ? body : btoa(body);
                } catch (err) {
                    content = btoa(encodeURIComponent(body));
                    const issue = {message: err.message, timeStamp, protocol, uri, request:request.request, response: request.response, content};
                    console.error(issue);
                }
                chrome.extension.sendMessage({ timeStamp, protocol, uri, request: request.request, response: request.response, content });
            });
            /* if (request.url.includes('mp4') {
                request.getContent(data => {
                    chrome.extension.sendMessage({data})
                })
            } */
            console.dir(request);
        }
    }
);

// want request.request.url
// also request.startedDateTime

