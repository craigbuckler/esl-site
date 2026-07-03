// emailer configuration
const email = {
  loadtime: +new Date(),
  timelimit: 5000,
  key: `sf_${ atob('YjRjYjM2ZjYyY2JkMjllMzI0OTIwNDZm') }`,
  timeout: 10000,
  submit: 'submit',
  msgSend: '<p>Sending request...</p>',
  msgSuccess: '<p>Thank you. We will contact you shortly.</p>',
  msgFail: '<p>Sorry, your message could not be sent.</p><p>Please try again shortly or <a href="#">send us an email</a>.</p>',
  close: 3000
};

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
let imgDialog;

// click event handler
document.addEventListener('click', e => {

  const target = e.target;

  // form dialog handler
  const
    dialogId = target?.dataset?.dialog,
    dialog = dialogId && document.getElementById(dialogId);

  if (dialog) {
    e.preventDefault();
    formHandler(target, dialog);
  }

  // close open dialog?
  if (imgDialog?.open && target.closest('dialog') === imgDialog) {
    imgDialog.close();
    return;
  }

  // open image dialog
  if (target?.src && target.closest('.imagexpand')) {

    if (!imgDialog) {
      imgDialog = document.body.appendChild( document.createElement('dialog') );
      imgDialog.className = 'imgopen';
      imgDialog.setAttribute('closedBy', 'any');
      history.pushState(null, '');
    }

    imgDialog.innerHTML = `<img src="${ target.src }" width="${ target.naturalWidth }" height="${ target.naturalHeight}">`;
    imgDialog.showModal();

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


// handle back button when dialog is open
window.addEventListener('popstate', () => {

  if (imgDialog?.open) {
    imgDialog.close();
  }

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


// form dialog handler
function formHandler(invoker, dialog) {

  // get form
  const form = dialog.querySelector('form');

  // append details
  form.dialog = dialog;
  form.invoker = invoker;
  form.status = dialog.querySelector('.status');
  form.message = dialog.querySelector('.message');
  form.buttons = Array.from( dialog.querySelectorAll('button') );

  // handle honeypots
  if (!form.hp) {
    form.hp = Array.from( dialog.querySelectorAll('input[name*="honeypot"]') );
    form.hp.forEach(hp => hp.removeAttribute('required'));
  }

  // show dialog
  dialog.showModal();

}


// submit handler
window.addEventListener('submit', async e => {

  e.preventDefault();

  // get form
  const form = e.target;

  // prevent rapid submit
  if (+new Date() - email.loadtime < email.timelimit) {
    form.status.innerHTML = email.msgFail.replace('#', form.invoker.href);
    return;
  }

  // one or more honeypots completed?
  if (!form || form.hp.find(hp => hp.value)) return;

  // is submitting?
  if (form.submitting) return;
  form.submitting = true;

  // disable form
  form.status.innerHTML = email.msgSend;
  form.dialog.classList.add(email.submit);
  form.buttons.forEach(b => b.disabled = true);

  // get form data
  const data = new FormData(form);

  // remove honeypots
  form?.hp.forEach(hp => data.delete(hp.name));

  // append data
  data.set('apiKey', email.key);

  // post details
  let result = { success: false, message: 'Unknown failure' };

  try {

    const response = await fetch(
      form.action,
      {
        method: form.method,
        body: data,
        signal: AbortSignal.timeout(email.timeout)
      }
    );

    result = await response.json();

  } catch (error) {
    result.message = error.message;
  }

  // handle response
  form.dialog.classList.remove(email.submit);
  form.buttons.forEach(b => b.disabled = false);
  form.message.textContent = result.message;

  if (result.success) {

    // success
    form.status.innerHTML = email.msgSuccess;
    setTimeout(() => form.dialog.close(), email.close);

  }
  else {

    // failure
    form.status.innerHTML = email.msgFail.replace('#', form.invoker.href);
    email.loadtime = new Date();
    form.submitting = false;

  }

});
