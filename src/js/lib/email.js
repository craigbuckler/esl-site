// email obsfucation
Array.from( document.getElementsByClassName('email') ).forEach(e => {

  const
    ds = e.dataset.email,
    em = (ds || e.textContent),
    es = em.replace(/\sdot\s/ig, '.').replace(/\{at\}/ig, '@').replace(/\s/g, '');

  if (em !== es) {
    e.closest('a').href = 'ma' + 'ilt' + 'o:' + es;
    if (!ds) e.textContent = es;
  }

});
