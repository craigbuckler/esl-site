// record and restore <details> open state

// disable initial animation
document.documentElement.dataset.animation = 'none';

Array.from( document.querySelectorAll('details[data-menu]') ).forEach(d => {

  // close open menu
  if (d.open && localStorage.getItem(dName(d)) && !d.querySelector('strong')) d.open = false;

  // event handler
  d.addEventListener('toggle', e => {

    const d = e.target;

    if (d.open) localStorage.removeItem(dName(d));
    else localStorage.setItem(dName(d), 'x');

  });

});

// re-enable animations
setTimeout(() => document.documentElement.removeAttribute('data-animation'), 50);

// return localStorage key
function dName(d) {
  return `dmenu:${ d.dataset.menu }`;
}
