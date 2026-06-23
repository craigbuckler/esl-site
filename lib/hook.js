// Publican hook functions
import { tacs } from 'publican';

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
