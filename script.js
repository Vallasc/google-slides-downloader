var bar = document.getElementById('docs-toolbar-wrapper');
bar.innerHTML += '<div id="docs-access-level-indicator" class="goog-flat-menu-button goog-inline-block" role="button" aria-disabled="false" aria-expanded="false" ' +
                    'aria-haspopup="true" style="user-select: none;" data-tooltip="Download PDF" aria-label="Modalità"> ' +
                    '<div class="goog-flat-menu-button-caption goog-inline-block" style="user-select: none;">&nbsp;&nbsp;&nbsp;&nbsp;Download</div></div>';
bar.onclick = async function savePdf(){
    pdf2 = new jsPDF('l', 'mm', 'a4', true);
    loadImages();
    await Promise.all(promiseArray);
    const pageCount = pdf2.internal.getNumberOfPages();
    pdf2.deletePage(pageCount)
    pdf2.save("result.pdf");
}
                    






let jspdf = document.createElement("script");
jspdf.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js';
document.body.appendChild(jspdf);

let pdf2;

var pages = document.getElementById('pages');
var svgs = pages.getElementsByTagName('svg');

var serializer = new XMLSerializer();

const promiseArray = []; 
function loadImages() {
    console.log("pages length: " + svgs.length);
    for (let i=0; i<svgs.length; i++) {

        let width = parseInt(svgs[i].getAttribute("width").replace("px", ""));
        let height = parseInt(svgs[i].getAttribute("height").replace("px", ""));

        const ratio = 2;
        svgs[i].setAttribute('width', width*ratio+'px');
        svgs[i].setAttribute('height', height*ratio+'px');
        svgs[i].setAttribute('style', 'background-color: white;');
        let serialized = serializer.serializeToString(svgs[i]);

        promiseArray.push(new Promise(resolve => {
            let canvas = document.createElement( "canvas" );
            document.body.appendChild(canvas);

            var svgSize = svgs[i].getBoundingClientRect();
            canvas.width = svgSize.width;
            canvas.height = svgSize.height;

            console.log(svgs[i]);
            console.log(canvas.width);
            let ctx = canvas.getContext( "2d" );

            const img = new Image();
            img.setAttribute( "src", "data:image/svg+xml;base64," + btoa( unescape(encodeURIComponent(serialized )) ));

            img.onload = function() {
                ctx.drawImage( img, 0, 0 );
                let imgData = canvas.toDataURL("image/jpeg", 1);

                const imgProps= pdf2.getImageProperties(imgData);
                const pdfHeight = pdf2.internal.pageSize.getHeight();
                const pdfWidth = (imgProps.width * pdfHeight) / imgProps.height;

                const marginX = (pdf2.internal.pageSize.getWidth() - pdfWidth) / 2;

                pdf2.addImage(imgData, 'JPEG', marginX, 0, pdfWidth, pdfHeight);
                pdf2.addPage();
                resolve();
            };

        }));

    }
}

/*jspdf.onload = async function () {
    pdf2 = new jsPDF('l', 'mm', 'a4', true);
    loadImages();
    await Promise.all(promiseArray);
    const pageCount = pdf2.internal.getNumberOfPages();
    pdf2.deletePage(pageCount)
    pdf2.save("result.pdf");
};*/
