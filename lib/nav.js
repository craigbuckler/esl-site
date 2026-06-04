// navigation functions

// <article> link
export function articleLink( data ) {

  if (!data?.link || !data?.title) return '';

  return `<li><a href="${ data.link }">${ data.title }</a></li>`;

}
