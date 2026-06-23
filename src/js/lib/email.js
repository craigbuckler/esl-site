// email obsfucation
Array.from( document.querySelectorAll('[data-email]') ).forEach(e => {

  const
    ds = e.dataset.email,
    em = (ds || e.lastChild.textContent),
    es = em.replace(/\sdot\s/ig, '.').replace(/\{at\}/ig, '@').replace(/\s/g, ''),
    prop = document.querySelector('[data-property]');

  let
    subject = 'enquiry',
    body = 'property: \nyour name: \nyour phone: \n';

  if (prop) {

    const
      beds = parseFloat( prop.dataset.beds || 0 ),
      datefrom = prop.dataset.datefrom || 'its next availability';

    subject = prop.dataset.property;
    body = (beds === 1 ? 'I' : 'We') + ' want to view ' + subject + '\nfor possible occupation from ' + datefrom + '.\n\nTelephone number: \n\n';
    for (let s = 1; s <= beds; s++) body += 'Student ' + s + ' name: \n';

  }

  if (em !== es) {
    e.closest('a').href = 'ma' + 'ilt' + 'o:' + es + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    if (!ds) e.lastChild.textContent = es;
  }

});
