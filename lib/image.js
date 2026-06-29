// get image information
import { join, sep } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { fileInfo, sortBy } from 'publican.lib';
import { imageMeta } from 'image-meta';


// return details of a single image
export async function imageInfo( path, srcRoot, destRoot ) {

  const
    imgSrc = join( './src/', path ),
    imgInfo = await fileInfo( imgSrc );

  if (!imgInfo.exists) return null;

  let res;

  try {
    res = imageMeta( await readFile(imgSrc) );
  }
  catch (err) {
    console.log(`Error reading ${ imgSrc } ${ err }`);
    res = {};
  }

  res.src = (destRoot + path).replaceAll(sep, '/');
  return res;

}


// return details of all images in a directory
export async function allImageInfo( path, srcRoot, destRoot ) {

  const

    dir = await readdir( join(srcRoot, path) ),

    ret = (await Promise.allSettled(
      dir.map( d => imageInfo( join(path, d), srcRoot, destRoot ) )
    ))
      .filter(f => f.status === 'fulfilled' && f.value && f.value.type)
      .map(f => f.value)
      .sort(sortBy('src'));

  return ret;

}
