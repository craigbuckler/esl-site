/*
<nav-heading> web component
applies .active class to heading links when title is in view
*/
class NavHeading extends HTMLElement {

  activeClass = 'active';

  // initialise
  connectedCallback() {

    // get in page links
    const link = new Map(
      Array.from( this.getElementsByTagName('a') )
        .map(
          a => a.pathname === location.pathname && a.hash ?
            [ document.querySelector(a.hash), a ] : []
        )
        .filter(a => a.length && a[0])
    );

    const observer = new IntersectionObserver(entries => {

      // get bound information
      for (const entry of entries) {

        const t = link.get(entry.target);
        if (!t) continue;

        if (entry.isIntersecting) {
          t.classList.add(this.activeClass);
        }
        else {
          t.classList.remove(this.activeClass);
        }

      }

    }, {
      threshold: 1
    });

    // observe links
    link.forEach((v, k) => observer.observe(k));

  }

}

window.customElements.define('nav-heading', NavHeading);
