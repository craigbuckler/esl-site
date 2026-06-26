// Publican hook functions
import { cspScript } from 'publican.lib/util';
import { json } from 'publican.lib/feed';
import { dateISO } from 'publican.lib/format';

// processRenderStart hook: modify tag titles and descriptions
export function renderstartTag( tacs ) {

  tacs.all.forEach(p => {

    if (p.isTagIndex) {

      const posts = `propert${ p.childPageTotal === 1 ? 'y' : 'ies' }`;
      p.title = `${ p.isTagIndex } ${ posts }`;
      p.description = `List of ${ tacs.lib.format.number( p.childPageTotal ) } ${ p.isTagIndex } ${ posts }.`;

    }

  });

}


// processPreRender hook: generate page inline scripts and CSP hashes for single page
export function prerenderSchema( data, tacs ) {

  data.script = new Map();

  if (data.prop) {

    const
      id = tacs.config.domain + data.link,
      price = data.prop.priceweek * data.prop.occupants;

    // property schema
    data.script.set('schema', cspScript(
      '{' +
        '"@context":"http://schema.org/",' +
        '"@type":"RealEstateListing",' +
        `"@id":"${ id }",` +
        `"url":"${ id }",` +
        `"name":"${ json(data.title) }",` +
        `"datePosted":"${ dateISO( data.date ) }",` +
        '"offers": {' +
          '"@type":"Offer",' +
          `"price":"${ price }",` +
          '"priceCurrency":"GBP",' +
          '"businessFunction":"https://purl.org/goodrelations/v1#LeaseOut",' +
          '"priceSpecification":{' +
            '"@type":"UnitPriceSpecification",' +
            `"price":"${ price }",` +
            '"priceCurrency":"GBP",' +
            '"unitText":"week"' +
          '},' +
          `"availability":"https://schema.org/${ data.prop.let ? 'OutOfStock' : 'InStock' }"` +
        '},' +
        '"mainEntity":{' +
          `"@type":"${ data.prop.type === 'flat' ? 'Apartment' : 'House' }",` +
          `"name":"${ json(data.title) }",` +
          `"numberOfBedrooms":${ data.prop.bedrooms },` +
          `"numberOfBathroomsTotal":${ data.prop.bathrooms },` +
          '"address":{' +
            '"@type":"PostalAddress",' +
            `"streetAddress":"${ data.prop.street }",` +
            '"addressLocality":"Exeter",' +
            '"addressRegion":"Devon",' +
            `"postalCode":"${ data.prop.postcode }",` +
            '"addressCountry":"GB"' +
          '}' +
        '}' +
      '}',
      'application/ld+json'
    ));

  }
  else {

    // article schema
    data.script.set('schema', cspScript(
      '{' +
        '"@context":"http://schema.org/",' +
        '"@type":"Article",' +
        `"headline":"${ json(data.title) }",` +
        `"description":"${ json(data.description) }",` +
        `"datePublished":"${ dateISO( data.date ) }T00:00:00+00:00",` +
        `"dateModified":"${ dateISO( data.modified || data.date ) }T00:00:00+00:00",` +
        `"mainEntityOfPage":{"@type":"WebPage","@id":"${ tacs.config.domain }${ data.link }"},` +
        `"image":"${ tacs.config.domain }${ data?.hero?.src || `${ tacs.root }media/favicons/favicon.svg` }",` +
        `"author":{"@type":"Person","name":"${ tacs.config.title }"},` +
        `"inLanguage":"${ tacs.config.language }",` +
        '"contentLocation":"online",' +
        '"accessMode":["textual"],' +
        '"accessModeSufficient":"textual",' +
        '"isFamilyFriendly":true,' +
        `"wordCount":${ data.wordCount || 0 }` +
      '}',
      'application/ld+json'
    ));

  }

}
