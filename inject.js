var pdf2;

var pages = document.getElementById('pages');
var svgs = pages.getElementsByTagName('svg');

var serializer = new XMLSerializer();

var promiseArray = []; 

var svgWidth;
var svgHeight;

function loadImages() {
    console.log("Pages length: " + svgs.length);
    for (let i=0; i<svgs.length; i++) {

        svgWidth = parseInt(svgs[i].getAttribute("width").replace("px", ""));
        svgHeight = parseInt(svgs[i].getAttribute("height").replace("px", ""));

        const ratio = 2;
        svgs[i].setAttribute('width', svgWidth*ratio+'px');
        svgs[i].setAttribute('height', svgHeight*ratio+'px');
        svgs[i].setAttribute('style', 'background-color: white;');
        let serialized = serializer.serializeToString(svgs[i]);

        promiseArray.push(new Promise(resolve => {
            let canvas = document.createElement( "canvas" );
            document.body.appendChild(canvas);

            var svgSize = svgs[i].getBoundingClientRect();
            canvas.width = svgSize.width;
            canvas.height = svgSize.height;

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

async function run () {
    await new Promise(r => setTimeout(r, 2000));
    pdf2 = new jsPDF('l', 'mm', 'a4', true);
    loadImages();
    await Promise.all(promiseArray);
    const pageCount = pdf2.internal.getNumberOfPages();
    pdf2.deletePage(pageCount)
    pdf2.save("result.pdf");
    elem.style.cssText = 'display: none;';

    // Restore slides
    for (let i=0; i<svgs.length; i++) {
        svgs[i].setAttribute('width', svgWidth+'px');
        svgs[i].setAttribute('height', svgHeight+'px');
        svgs[i].setAttribute('style', 'position: absolute; top: 0; left: 0;');
    }
    console.log("Done");
};

var elem = document.createElement('div');
elem.innerHTML = '<div style="position: absolute; top: 50%; left: 50%; font-size: 50px; color: white; transform: translate(-50%,-50%);">Loading...</div>';
elem.style.cssText = 'position: fixed; display: block;width: 100%; height: 100%; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); z-index: 4000; cursor: pointer;';
document.body.appendChild(elem);
run();