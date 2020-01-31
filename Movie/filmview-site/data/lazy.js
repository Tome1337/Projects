window.onload = () =>
{   
    /*
    const vpcfg =
        {
            1024: [316, 632, 948],
            768: [230, 460, 690],
            425: [160, 320, 480]
        };

    //target.src = target.dataset.src + '-' + vpcfg[currPort][DPR] + 'x' + vpcfg[currPort][DPR] + '.jpg';
    //target.src = target.dataset.src + '-195x195.jpg';

    let activeWidths = Object.keys(vpcfg).filter( width => width <= window.innerWidth);
    let currPort = activeWidths[activeWidths.length - 1] || 425;
    let DPR = Math.round(window.devicePixelRatio) - 1; DPR > 2 ? DPR = 2 : '';
    */

    let SIMULTANEOUS_DOWNLOADS = 4;
    const queue = [], observer = new IntersectionObserver( entries => entries.forEach( entry => entry.target._lazyload.intersectionRatio = entry.intersectionRatio ), { root: null, rootMargin: "0px", thresholds: [ 0, 0.01, 0.25, 0.5, 0.75, 1 ]});
    
    const visibleAreaCmp = ( imgA, imgB ) => imgB._lazyload.intersectionRatio * imgB.offsetWidth * imgB.offsetHeight - imgA._lazyload.intersectionRatio * imgA.offsetWidth * imgA.offsetHeight;
    const next = () => queue.length && download( queue.sort( visibleAreaCmp ) && queue.shift() );

    function download( img )
    {
        img.onload = img.onerror = () => { img.classList.remove("lazy"); next() }
        img.setAttribute( 'src', img.dataset.src );

        observer.unobserve( img ); !queue.length && observer.disconnect();
    }


    for( let image of document.querySelectorAll('img.lazy[data-src]'))
    {
        if( SIMULTANEOUS_DOWNLOADS )
        {
            download( image ); --SIMULTANEOUS_DOWNLOADS;
        }
        else
        {
            image._lazyload = { intersectionRatio: 0 };
            observer.observe( image ); queue.push( image );
        }
    }
};
