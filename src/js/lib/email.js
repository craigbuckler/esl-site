// email obsfucation
Array.from( document.querySelectorAll('[data-email]') ).forEach(e => {

  const
    ds = e.dataset.email,
    em = (ds || e.lastChild.textContent),
    es = em.replace(/\sdot\s/ig, '.').replace(/\{at\}/ig, '@').replace(/\s/g, ''),
    prop = document.querySelector('[data-property]'),
    datefrom = prop?.dataset.datefrom;

  let
    subject = 'website enquiry',
    body = 'my name: \nphone: \n\nenquiry:\n';

  if (datefrom) {

    const beds = parseFloat( prop.dataset.beds || 1 );

    subject = 'view ' + prop.dataset.property;
    body = `${ beds === 1 ? 'I' : 'We' } want to ${ subject }\nfor ${ beds } student${ beds === 1 ? '' : 's' } requiring occupation from ${ datefrom }.\n\nmy name: \nphone: \n\n`;

  }

  if (em !== es) {
    e.closest('a').href = 'ma' + 'ilt' + 'o:' + es + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    if (!ds) e.lastChild.textContent = es;
  }

});
