// Publican configuration
import { Publican, tacs } from 'publican';
import { libInit, env, apiFetch, sortBy, normalize } from 'publican.lib';
import { renderstartData } from 'publican.lib/hook';
import { renderstartTag } from './lib/hook.js';
import * as nav from './lib/nav.js';
import { imageInfo, allImageInfo } from './lib/image.js';

import { staticsearch } from 'staticsearch';
import esbuild from 'esbuild';

// load property data from API
const
  propUri = env('API_URL'),
  propData = await apiFetch({
    uri: propUri,
    authKey: env('API_TOKEN'),
    cacheDir: env('API_CACHE'),
    cacheMin: env('API_CACHE_MINS', 10),
  });

if (!propData.ok || !propData?.body?.length) {
  console.error(`No property data available from ${ propUri } - aborting build`);
  process.exit();
}

const
  publican = new Publican(),
  isDev = (env('NODE_ENV') === 'development'),
  property = propData.body;

console.log(`Building ${ isDev ? 'development' : 'production' } site`);

// Publican defaults
publican.config.dir.content = env('CONTENT_DIR');
publican.config.dir.template = env('TEMPLATE_DIR');
publican.config.dir.build = env('BUILD_DIR');
publican.config.root = env('BUILD_ROOT');

// default HTML templates
publican.config.defaultHTMLTemplate = env('TEMPLATE_DEFAULT');
publican.config.dirPages.template = env('TEMPLATE_LIST');
publican.config.tagPages.template = env('TEMPLATE_TAG');
publican.config.tagPages.root = env('TAG_ROOT', 'tag');

// configuration
publican.config.headingAnchor = false;
publican.config.markdownOptions.prism = null;
publican.config.dirPages.size = 48;
publican.config.tagPages.size = 48;

// pass-through files
publican.config.passThrough.add({ from: './src/media', to: './media/' });

// jsTACs rendering defaults
const port = env('SERVE_PORT', 8000);
tacs.config = tacs.config || {};
tacs.config.isDev = isDev;
tacs.config.language = env('SITE_LANGUAGE');
tacs.config.siteID = env('SITE_ID');
tacs.config.domain = isDev ? `http://localhost:${ port }` : env('SITE_DOMAIN');
tacs.config.title = env('SITE_TITLE');
tacs.config.description = env('SITE_DESCRIPTION');
tacs.config.author = env('SITE_AUTHOR');
tacs.config.authorUrl = env('SITE_AUTHORURL');
tacs.config.authorX = env('SITE_AUTHORX');
tacs.config.wordCountShow = parseInt(env('SITE_WORDCOUNTSHOW', 0));
tacs.config.themeColor = env('SITE_THEMECOLOR', '#000');
tacs.config.email = env('SITE_EMAIL');
tacs.config.phone = env('SITE_PHONE');
tacs.config.buildDate = new Date();

// initialize library
libInit(publican, tacs);
tacs.lib.format.setLocale( tacs.config.language );

// replace publican.lib hook
publican.config.processRenderStart.delete( renderstartData );
publican.config.processRenderStart.add( renderstartTag );

// handle hero images
const hero = await allImageInfo( 'media/hero', './src/', publican.config.root );
let heroItem = 0;

publican.config.processPreRender.add( data => {

  if (!data.hero) {
    data.hero = hero[ heroItem ];
    if (!data.template) heroItem = (++heroItem % hero.length);
  }

});

// define custom functions
tacs.fn = tacs.fn || {};
tacs.fn.nav = nav;
tacs.fn.sortBy = sortBy;
tacs.fn.dateFull = d => new Intl.DateTimeFormat(tacs.config.language, { dateStyle: 'full' }).format( new Date(d) );

// create virtual content
for (let idx = 0; idx < property?.length || 0; idx++) {

  const
    p = property[idx],
    period = p.period.sort(sortBy('datefrom')).at(0);

  // append data
  p.year = period.code;
  p.title = `${ p.street }, ${ p.town } ${ p.postcode }`;
  p.unimins = Math.round(p.unimetres / 90);
  p.videoID = p.video.replace('https://youtu.be/', '').replace('https://www.youtube.com/watch?v=', '');
  p.datefrom = period.datefrom;
  p.dateto = period.dateto;
  p.depositholding = +period.depositholding;
  p.depositremainder = +period.depositremainder;
  p.deposit = +period.depositholding + period.depositremainder;
  p.priceweek = period.priceweek;
  p.weeks = Math.round( ( new Date(period.dateto) - new Date(period.datefrom) ) / (1000 * 60 * 60 * 24 * 7) );
  p.let = period.let;
  p.plan = await imageInfo( `media/plan/${ p.code }-plan.webp`, './src/', publican.config.root );
  p.photo = await allImageInfo( `media/photo/${ p.code }`, './src/', publican.config.root );

  // add property page
  publican.addContent(
    `${ p.type }/${ normalize(`${ p.occupants }-bed-${ p.street }-exeter-${ p.postcode }`) }.md`,
    p.description.replaceAll('\n', '\n\n'),
    {
      title: p.title,
      menu: p.street,
      description: `${ p.bedrooms }-bed student ${ p.type } in Exeter, ${ p.let ? `currently let for ${ p.code }` : `available from ${ tacs.lib.format.dateHuman(p.datefrom) } for ${ tacs.lib.format.currency(p.priceweek, 'GBP') } per student per week` }.`,
      prop: p,
      hero: p.photo.filter(i => i.width > i.height).at(0) || p.photo?.[0],
      index: 'weekly',
      template: 'property.html',
      tags: [ p.type, `${ p.bedrooms }-bed` ],
      priority: 1 - ((idx + 1) / 100),
    }
  );

}

// utils
publican.config.minify.enabled = !isDev;  // minify in production mode
publican.config.watch = isDev;            // watch in development mode
publican.config.logLevel = 2;             // output verbosity

// clear build directory
await publican.clean();

// build site
await publican.build();

// run search indexer
staticsearch.buildDir = publican.config.dir.build;
staticsearch.searchDir = publican.config.dir.build + 'search/';
staticsearch.domain = tacs.config.domain;
staticsearch.language = 'en';
staticsearch.wordCrop = 5;
// staticsearch.stopWords = 'a,all,an,and,any,are,as,at,be,but,by,can,do,for,from,go,has,have,he,her,hes,him,how,if,in,is,it,me,no,not,now,of,off,on,or,out,she,shes,that,the,this,was,with,yes,you,your';
staticsearch.stopWordsDefault = false;
staticsearch.pageDOMSelectors = 'main';
staticsearch.pageDOMExclude = 'nav,nav-heading,menu';
await staticsearch.index();


// ___________________________________________________________
// esbuild configuration for CSS, JavaScript, and local server
const
  target = env('BROWSER_TARGET', '').split(','),
  logLevel = isDev ? 'info' : 'error',
  minify = !isDev,
  sourcemap = isDev && 'linked',
  banner = {};

// bundle CSS
const buildCSS = await esbuild.context({

  entryPoints: [ env('CSS_DIR') ],
  bundle: true,
  target,
  external: ['/media/*'],
  loader: {
    '.woff2': 'file',
    '.png': 'file',
    '.jpg': 'file',
    '.svg': 'dataurl'
  },
  banner,
  logLevel,
  minify,
  sourcemap,
  outdir: `${ publican.config.dir.build }css/`

});

// bundle JS
const buildJS = await esbuild.context({

  entryPoints: [ env('JS_DIR') ],
  format: 'esm',
  bundle: true,
  target,
  external: [],
  define: {
    __ISDEV__: JSON.stringify(isDev)
  },
  drop: isDev ? [] : ['debugger', 'console'],
  logLevel,
  minify,
  sourcemap,
  outdir: `${ publican.config.dir.build }js/`

});

if (publican.config.watch) {

  // watch for file changes
  await buildCSS.watch();
  await buildJS.watch();

  // development server
  const { livelocalhost } = await import('livelocalhost');

  livelocalhost.servedir = publican.config.dir.build;
  livelocalhost.serveport = port;
  livelocalhost.accessLog = false;
  livelocalhost.start();

}
else {

  // single build
  await buildCSS.rebuild();
  buildCSS.dispose();

  await buildJS.rebuild();
  buildJS.dispose();

}
