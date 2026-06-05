// navigation functions
import { sortBy } from 'publican.lib';

// site tag list
export function tagList(tacs, classPrefix = 'taglist') {

  if (!tacs?.tagList?.length) return;

  let ret = tacs.tagList.sort(sortBy('ref')).map(i => {

    return `<li><a href="${ i.link }">${ i.tag } <sup>${ i.count }</sup></a></li>`;

  }).join('\n');

  if (ret) ret = `<nav class="${ classPrefix }"><ul>\n${ ret }\n</ul></nav>`;

  return ret;

}

// <article> link
export function articleLink( data ) {

  if (!data?.link || !data?.title) return '';

  return `<li><a href="${ data.link }">${ data.title }</a></li>`;

}
