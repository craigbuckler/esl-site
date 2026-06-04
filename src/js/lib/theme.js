// theme switcher
const switcher = Array.from( document.getElementsByName('themeswitcher') );

if (switcher.length) {

  const
    form = switcher[0].form,
    theme = localStorage.getItem('theme') || '',
    active = switcher.find(s => s.value === theme);

  if (active) active.checked = true;

  // press space to change
  form.addEventListener('keydown', e => {

    if (e.keyCode === 13 || e.keyCode === 32) {

      e.preventDefault();
      const current = switcher.findIndex(s => s.checked);
      switcher[ (current + 1) % switcher.length ].checked = true;

    }

  });

  // change event
  form.addEventListener('change', e => {

    const theme = e.target.value;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);

  });

}
