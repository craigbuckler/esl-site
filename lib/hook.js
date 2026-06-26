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
  data.script.set('schema', cspScript(
    '{' +
      '"@context":"http://schema.org/",' +
      '"@type":"Article",' +
      '"proficiencyLevel":"beginner",' +
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
