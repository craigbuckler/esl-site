// expand images
let dialog;
document.addEventListener('click', e => {

  const t = e.target;

  if (dialog?.open && t.closest('dialog') === dialog) {
    dialog.close();
    return;
  }

  const i = t.src;
  if (i && t.closest('.imagexpand')) {

    if (!dialog) {
      dialog = document.body.appendChild( document.createElement('dialog') );
      dialog.className = 'imgopen';
      dialog.setAttribute('closedBy', 'any');
    }

    dialog.innerHTML = `<img src="${ i }">`;
    dialog.showModal();

  }

});
