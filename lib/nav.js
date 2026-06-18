// navigation functions
import { tacs } from 'publican';
import { sortBy } from 'publican.lib';

// site tag list
export function tagList(classPrefix = 'taglist') {

  if (!tacs?.tagList?.length) return;

  let ret = tacs.tagList.sort(sortBy('ref')).map(i => {

    return `<li><a href="${ i.link }">${ i.tag } <sup>${ i.count }</sup></a></li>`;

  }).join('\n');

  if (ret) ret = `<nav class="${ classPrefix }"><ul>\n${ ret }\n</ul></nav>`;

  return ret;

}


// list of all properties
export function propertyList(level = 2) {

  let ret = '<nav class="properties"><ol>';

  tacs.all.forEach(d => {
    if (d?.prop) ret += articleLink(d, level);
  });

  ret += '</ol></nav>';

  return ret;

}


// card link
export function articleLink( data, level = 2 ) {

  // not a page?
  if (!data?.link || !data?.title) return '';

  // not a property
  if (!data?.prop) {
    return `<li><a href="${ data.link }">${ data.title }</a></li>`;
  }

  // property
  return `
<li id="${ data.prop.code }" data-beds="${ data.prop.bedrooms }" data-baths="${ data.prop.bathrooms }" data-rooms="${ data.prop.receptions }" data-mins="${ data.prop.unimins }" data-price="${ data.prop.priceweek }" data-let="${ data.prop.let ? '1' : '0' }"><a href="${ data.link }">

  ${ data.prop?.photo.length ? `<img src="${ data.prop.photo[0].src }" width="${ data.prop.photo[0].width || 600 }" height="${ data.prop.photo[0].height || 600 }" alt="${ tacs.lib.feed.escape( data.prop.title ) } photograph">` : '' }

  ${ data.prop.let ? '<p class="let">LET</p>' : '' }

  <h${ level }>${ data.prop.street }</h${ level }>

  <p class="datefrom">${ data.prop.let ? `NOT available for ${ data.prop.year }` : `${ tacs.lib.format.number( data.prop.weeks ) } weeks from ${ tacs.lib.format.dateHuman( data.prop.datefrom ) }` }</p>

  <ul>
    <li title="beds"><svg><use xlink:href="#svg-bed"></use></svg> ${ tacs.lib.format.number( data.prop.bedrooms ) }</li>
    <li title="bathrooms"><svg><use xlink:href="#svg-bath"></use></svg> ${ tacs.lib.format.number( data.prop.bathrooms ) }</li>
    <li title="reception rooms"><svg><use xlink:href="#svg-sofa"></use></svg> ${ tacs.lib.format.number( data.prop.receptions ) }</li>
    <li title="minutes walk to Exeter University"><svg><use xlink:href="#svg-walk"></use></svg> ${ tacs.lib.format.number( data.prop.unimins ) }</li>
  </ul>

  <p class="price">${ tacs.lib.format.currency( data.prop.priceweek, 'GBP' ).replace('.00', '') } each per week</p>

</a></li>
`;

}
