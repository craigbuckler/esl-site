// share configuration
const cfgShare = {
  selector  : '.share',
  appHash   : '#shareapp',
  printHash : '#print',
  width     : 800,
  height    : 800,
  margin    : 20
};

// page information
let pageInfo;

// <details> elements
const details = document.getElementsByTagName('details');

// generated <dialog>
let dialog;


// click event handler
document.addEventListener('click', e => {

  const target = e.target;

  // close open dialog?
  if (dialog?.open && target.closest('dialog') === dialog) {
    dialog.close();
    return;
  }

  // open image dialog
  if (target?.src && target.closest('.imagexpand')) {

    if (!dialog) {
      dialog = document.body.appendChild( document.createElement('dialog') );
      dialog.className = 'imgopen';
      dialog.setAttribute('closedBy', 'any');
    }

    dialog.innerHTML = `<img src="${ target.src }" width="${ target.naturalWidth }" height="${ target.naturalHeight}">`;
    dialog.showModal();

    return;

  }


  // share handler
  const link = target.closest('a');
  if (link && link.closest(cfgShare.selector)) {
    shareHandler(e, link);
  }


  // close open <details>
  const detailThis = target.closest('details');
  setTimeout(() => {

    for (let d = 0; d < details.length; d++) {
      details[d].open = details[d] === detailThis && detailThis.open;
    }

  }, 50);


});


// activate hidden share
if (navigator.share) {
  Array.from( document.querySelectorAll(`[hidden]:has(a[href$="${ cfgShare.appHash }"])`) ).forEach(applink => applink.removeAttribute('hidden'));
}

// activate hidden print
Array.from( document.querySelectorAll(`[hidden]:has(a[href$="${ cfgShare.printHash }"])`) ).forEach(applink => applink.removeAttribute('hidden'));


// share clicked
async function shareHandler(event, link) {

  // print
  if (link.hash === cfgShare.printHash) {

    event.preventDefault();

    // load lazy images
    await Promise.allSettled(
      Array.from( document.querySelectorAll('img[loading="lazy"]') ).map(img => loadImage(img))
    );

    // print page
    window.print();

    return;
  }

  // share API?
  if (link.hash === cfgShare.appHash) {

    event.preventDefault();

    // get page information on first use
    if (!pageInfo) {

      const
        canonical = document.querySelector('link[rel=canonical]'),
        desc = document.getElementsByName('description');

      pageInfo = {
        url   : link.dataset.url || canonical?.href || location.href,
        title : link.dataset.title || document?.title || '',
        text  : link.dataset.description || desc[0]?.content || ''
      };

      console.log('pageInfo', pageInfo);

    }

    navigator.share( pageInfo );
    return;

  }

  // social link?
  if (!link.href || link.protocol !== 'https:' || link.hostname === location.hostname) return;

  // open popup
  event.preventDefault();

  const
    sw = screen.availWidth || 1024,
    sh = screen.availHeight || 700,
    pw = Math.min(cfgShare.width, (sw - (cfgShare.margin * 2))),
    ph = Math.min(cfgShare.height, (sh - (cfgShare.margin * 2))),
    px = Math.floor((sw - pw) / 2),
    py = Math.floor((sh - ph) / 2);

  window.open(
    link.href,
    'social',
    `popup,noopener,noreferrer,width=${ pw },height=${ ph },left=${ px },top=${ py }`
  );

}


// load lazy image
function loadImage(img) {

  return new Promise(resolve => {

    const i = new Image(img.width, img.height);
    i.onload = resolve;
    i.onerror = resolve;
    i.src = img.src;
    img.setAttribute('loading', 'eager');

  });

}
