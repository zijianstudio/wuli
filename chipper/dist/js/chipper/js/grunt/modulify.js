// Copyright 2020-2023, University of Colorado Boulder

/**
 * Generates JS modules from resources such as images/strings/audio/etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

const _ = require('lodash');
const createMipmap = require('./createMipmap');
const fs = require('fs');
const grunt = require('grunt');
const loadFileAsDataURI = require('../common/loadFileAsDataURI');
const pascalCase = require('../common/pascalCase');
const os = require('os');
const getCopyrightLine = require('./getCopyrightLine');
const assert = require('assert');
const writeFileAndGitAdd = require('../../../perennial-alias/js/common/writeFileAndGitAdd');

// disable lint in compiled files, because it increases the linting time
const HEADER = '/* eslint-disable */';

// supported image types, not case-sensitive
const IMAGE_SUFFIXES = ['.png', '.jpg', '.cur'];

// supported sound file types, not case-sensitive
const SOUND_SUFFIXES = ['.mp3', '.wav'];

// supported shader file types, not case-sensitive
const SHADER_SUFFIXES = ['.glsl', '.vert', '.shader'];

/**
 * String replacement
 * @param {string} string - the string which will be searched
 * @param {string} search - the text to be replaced
 * @param {string} replacement - the new text
 * @returns {string}
 */
const replace = (string, search, replacement) => string.split(search).join(replacement);

/**
 * Get the relative from the modulified repo to the filename through the provided subdirectory.
 *
 * @param {string} subdir
 * @param {string} filename
 * @returns {string}
 */
const getRelativePath = (subdir, filename) => {
  return `${subdir}/${filename}`;
};

/**
 * Gets the relative path to the root based on the depth of a resource
 *
 * @returns {string}
 */
const expandDots = abspath => {
  // Finds the depths of a directory relative to the root of where grunt.recurse was called from (a repo root)
  const depth = abspath.split('/').length - 2;
  let parentDirectory = '';
  for (let i = 0; i < depth; i++) {
    parentDirectory = `${parentDirectory}../`;
  }
  return parentDirectory;
};

/**
 * Output with an OS-specific EOL sequence, see https://github.com/phetsims/chipper/issues/908
 * @param string
 * @returns {string}
 */
const fixEOL = string => replace(string, '\n', os.EOL);

/**
 * Transform an image file to a JS file that loads the image.
 * @param {string} abspath - the absolute path of the image
 * @param {string} repo - repository name for the modulify command
 * @param {string} subdir - subdirectory location for modulified assets
 * @param {string} filename - name of file being modulified
 */
const modulifyImage = async (abspath, repo, subdir, filename) => {
  const dataURI = loadFileAsDataURI(abspath);
  const contents = `${HEADER}
import asyncLoader from '${expandDots(abspath)}phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = '${dataURI}';
export default image;`;
  const tsFilename = convertSuffix(filename, '.ts');
  await writeFileAndGitAdd(repo, getRelativePath(subdir, tsFilename), fixEOL(contents));
};

/**
 * Transform an image file to a JS file that loads the image as a mipmap.
 * @param {string} abspath - the absolute path of the image
 * @param {string} repo - repository name for the modulify command
 * @param {string} subdir - subdirectory location for modulified assets
 * @param {string} filename - name of file being modulified
 */
const modulifyMipmap = async (abspath, repo, subdir, filename) => {
  // Defaults. NOTE: using the default settings because we have not run into a need, see
  // https://github.com/phetsims/chipper/issues/820 and https://github.com/phetsims/chipper/issues/945
  const config = {
    level: 4,
    // maximum level
    quality: 98
  };
  const mipmaps = await createMipmap(abspath, config.level, config.quality);
  const entry = mipmaps.map(({
    width,
    height,
    url
  }) => ({
    width: width,
    height: height,
    url: url
  }));
  const mipmapContents = `${HEADER}
import asyncLoader from '${expandDots(abspath)}phet-core/js/asyncLoader.js';

const mipmaps = ${JSON.stringify(entry, null, 2)};
mipmaps.forEach( mipmap => {
  mipmap.img = new Image();
  const unlock = asyncLoader.createLock( mipmap.img );
  mipmap.img.onload = unlock;
  mipmap.img.src = mipmap.url; // trigger the loading of the image for its level
  mipmap.canvas = document.createElement( 'canvas' );
  mipmap.canvas.width = mipmap.width;
  mipmap.canvas.height = mipmap.height;
  const context = mipmap.canvas.getContext( '2d' );
  mipmap.updateCanvas = () => {
    if ( mipmap.img.complete && ( typeof mipmap.img.naturalWidth === 'undefined' || mipmap.img.naturalWidth > 0 ) ) {
      context.drawImage( mipmap.img, 0, 0 );
      delete mipmap.updateCanvas;
    }
  };
} );
export default mipmaps;`;
  const jsFilename = convertSuffix(filename, '.js');
  await writeFileAndGitAdd(repo, getRelativePath(subdir, jsFilename), fixEOL(mipmapContents));
};

/**
 * Transform a GLSL shader file to a JS file that is represented by a string.
 * @param {string} abspath - the absolute path of the image
 * @param {string} repo - repository name for the modulify command
 * @param {string} subdir - subdirectory location for modulified assets
 * @param {string} filename - name of file being modulified
 */
const modulifyShader = async (abspath, repo, subdir, filename) => {
  // load the shader file
  const shaderString = fs.readFileSync(abspath, 'utf-8').replace(/\r/g, '');

  // output the contents of the file that will define the shader in JS format
  const contents = `${HEADER}
export default ${JSON.stringify(shaderString)}`;
  const jsFilename = convertSuffix(filename, '.js');
  await writeFileAndGitAdd(repo, getRelativePath(subdir, jsFilename), fixEOL(contents));
};

/**
 * Decode a sound file into a Web Audio AudioBuffer.
 * @param {string} abspath - the absolute path of the image
 * @param {string} repo - repository name for the modulify command
 * @param {string} subdir - subdirectory location for modulified assets
 * @param {string} filename - name of file being modulified
 */
const modulifySound = async (abspath, repo, subdir, filename) => {
  // load the sound file
  const dataURI = loadFileAsDataURI(abspath);

  // output the contents of the file that will define the sound in JS format
  const contents = `${HEADER}
import asyncLoader from '${expandDots(abspath)}phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '${expandDots(abspath)}tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '${expandDots(abspath)}tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '${expandDots(abspath)}tambo/js/phetAudioContext.js';

const soundURI = '${dataURI}';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;`;
  const jsFilename = convertSuffix(filename, '.js');
  await writeFileAndGitAdd(repo, getRelativePath(subdir, jsFilename), fixEOL(contents));
};

/**
 * Convert .png => _png_mipmap.js, etc.
 *
 * @param {string} abspath - file name with a suffix or a path to it
 * @param {string} suffix - the new suffix, such as '.js'
 * @returns {string}
 */
const convertSuffix = (abspath, suffix) => {
  const lastDotIndex = abspath.lastIndexOf('.');
  return `${abspath.substring(0, lastDotIndex)}_${abspath.substring(lastDotIndex + 1)}${suffix}`;
};

/**
 * Determines the suffix from a filename, everything after the final '.'
 *
 * @param {string} filename
 * @returns {string}
 */
const getSuffix = filename => {
  const index = filename.lastIndexOf('.');
  return filename.substring(index);
};

/**
 * Creates a *.js file corresponding to matching resources such as images or sounds.
 * @param {string} abspath
 * @param {string} rootdir
 * @param {string} subdir
 * @param {string} filename
 * @param {string} repo
 */
const modulifyFile = async (abspath, rootdir, subdir, filename, repo) => {
  if (subdir && (subdir.startsWith('images') ||
  // for brand
  subdir.startsWith('phet/images') || subdir.startsWith('phet-io/images') || subdir.startsWith('adapted-from-phet/images')) && IMAGE_SUFFIXES.indexOf(getSuffix(filename)) >= 0) {
    await modulifyImage(abspath, repo, subdir, filename);
  }
  if (subdir && (subdir.startsWith('mipmaps') ||
  // for brand
  subdir.startsWith('phet/mipmaps') || subdir.startsWith('phet-io/mipmaps') || subdir.startsWith('adapted-from-phet/mipmaps')) && IMAGE_SUFFIXES.indexOf(getSuffix(filename)) >= 0) {
    await modulifyMipmap(abspath, repo, subdir, filename);
  }
  if (subdir && subdir.startsWith('sounds') && SOUND_SUFFIXES.indexOf(getSuffix(filename)) >= 0) {
    await modulifySound(abspath, repo, subdir, filename);
  }
  if (subdir && subdir.startsWith('shaders') && SHADER_SUFFIXES.indexOf(getSuffix(filename)) >= 0) {
    await modulifyShader(abspath, repo, subdir, filename);
  }
};

/**
 * Creates the string module at js/${_.camelCase( repo )}Strings.js for repos that need it.
 * @public
 *
 * @param {string} repo
 */
const createStringModule = async repo => {
  const packageObject = grunt.file.readJSON(`../${repo}/package.json`);
  const stringModuleName = `${pascalCase(repo)}Strings`;
  const relativeStringModuleFile = `js/${stringModuleName}.ts`;
  const stringModuleFileJS = `../${repo}/js/${stringModuleName}.js`;
  const namespace = _.camelCase(repo);
  if (fs.existsSync(stringModuleFileJS)) {
    console.log('Found JS string file in TS repo.  It should be deleted manually.  ' + stringModuleFileJS);
  }
  const copyrightLine = await getCopyrightLine(repo, relativeStringModuleFile);
  await writeFileAndGitAdd(repo, relativeStringModuleFile, fixEOL(`${copyrightLine}

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import ${namespace} from './${namespace}.js';

type StringsType = ${getStringTypes(repo)};

const ${stringModuleName} = getStringModule( '${packageObject.phet.requirejsNamespace}' ) as StringsType;

${namespace}.register( '${stringModuleName}', ${stringModuleName} );

export default ${stringModuleName};
`));
};

/**
 * Creates a *.d.ts file that represents the types of the strings for the repo.
 * @public
 *
 * @param {string} repo
 */
const getStringTypes = repo => {
  const packageObject = grunt.file.readJSON(`../${repo}/package.json`);
  const json = grunt.file.readJSON(`../${repo}/${repo}-strings_en.json`);

  // Track paths to all the keys with values.
  const all = [];

  // Recursively collect all of the paths to keys with values.
  const visit = (level, path) => {
    Object.keys(level).forEach(key => {
      if (key !== '_comment') {
        if (level[key].value && typeof level[key].value === 'string') {
          all.push({
            path: [...path, key],
            value: level[key].value
          });
        } else {
          visit(level[key], [...path, key]);
        }
      }
    });
  };
  visit(json, []);

  // Transform to a new structure that matches the types we access at runtime.
  const structure = {};
  for (let i = 0; i < all.length; i++) {
    const allElement = all[i];
    const path = allElement.path;
    let level = structure;
    for (let k = 0; k < path.length; k++) {
      const pathElement = path[k];
      const tokens = pathElement.split('.');
      for (let m = 0; m < tokens.length; m++) {
        const token = tokens[m];
        assert(!token.includes(';'), `Token ${token} cannot include forbidden characters`);
        assert(!token.includes(','), `Token ${token} cannot include forbidden characters`);
        assert(!token.includes(' '), `Token ${token} cannot include forbidden characters`);
        if (k === path.length - 1 && m === tokens.length - 1) {
          if (!(packageObject.phet && packageObject.phet.simFeatures && packageObject.phet.simFeatures.supportsDynamicLocale)) {
            level[token] = '{{STRING}}'; // instead of value = allElement.value
          }

          level[`${token}StringProperty`] = '{{STRING_PROPERTY}}';
        } else {
          level[token] = level[token] || {};
          level = level[token];
        }
      }
    }
  }
  let text = JSON.stringify(structure, null, 2);

  // Use single quotes instead of the double quotes from JSON
  text = replace(text, '"', '\'');
  text = replace(text, '\'{{STRING}}\'', 'string');
  text = replace(text, '\'{{STRING_PROPERTY}}\'', 'LinkableProperty<string>');

  // Add ; to the last in the list
  text = replace(text, ': string\n', ': string;\n');
  text = replace(text, ': LinkableProperty<string>\n', ': LinkableProperty<string>;\n');

  // Use ; instead of ,
  text = replace(text, ',', ';');
  return text;
};

/**
 * Entry point for modulify, which transforms all of the resources in a repo to *.js files.
 * @param {string} repo - the name of a repo, such as 'joist'
 */
const modulify = async repo => {
  console.log(`modulifying ${repo}`);
  const relativeFiles = [];
  grunt.file.recurse(`../${repo}`, async (abspath, rootdir, subdir, filename) => {
    relativeFiles.push({
      abspath: abspath,
      rootdir: rootdir,
      subdir: subdir,
      filename: filename
    });
  });
  for (let i = 0; i < relativeFiles.length; i++) {
    const entry = relativeFiles[i];
    await modulifyFile(entry.abspath, entry.rootdir, entry.subdir, entry.filename, repo);
  }
  const packageObject = grunt.file.readJSON(`../${repo}/package.json`);
  if (fs.existsSync(`../${repo}/${repo}-strings_en.json`) && packageObject.phet && packageObject.phet.requirejsNamespace) {
    // Update the strings module file
    await createStringModule(repo);
  }
};
module.exports = modulify;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImNyZWF0ZU1pcG1hcCIsImZzIiwiZ3J1bnQiLCJsb2FkRmlsZUFzRGF0YVVSSSIsInBhc2NhbENhc2UiLCJvcyIsImdldENvcHlyaWdodExpbmUiLCJhc3NlcnQiLCJ3cml0ZUZpbGVBbmRHaXRBZGQiLCJIRUFERVIiLCJJTUFHRV9TVUZGSVhFUyIsIlNPVU5EX1NVRkZJWEVTIiwiU0hBREVSX1NVRkZJWEVTIiwicmVwbGFjZSIsInN0cmluZyIsInNlYXJjaCIsInJlcGxhY2VtZW50Iiwic3BsaXQiLCJqb2luIiwiZ2V0UmVsYXRpdmVQYXRoIiwic3ViZGlyIiwiZmlsZW5hbWUiLCJleHBhbmREb3RzIiwiYWJzcGF0aCIsImRlcHRoIiwibGVuZ3RoIiwicGFyZW50RGlyZWN0b3J5IiwiaSIsImZpeEVPTCIsIkVPTCIsIm1vZHVsaWZ5SW1hZ2UiLCJyZXBvIiwiZGF0YVVSSSIsImNvbnRlbnRzIiwidHNGaWxlbmFtZSIsImNvbnZlcnRTdWZmaXgiLCJtb2R1bGlmeU1pcG1hcCIsImNvbmZpZyIsImxldmVsIiwicXVhbGl0eSIsIm1pcG1hcHMiLCJlbnRyeSIsIm1hcCIsIndpZHRoIiwiaGVpZ2h0IiwidXJsIiwibWlwbWFwQ29udGVudHMiLCJKU09OIiwic3RyaW5naWZ5IiwianNGaWxlbmFtZSIsIm1vZHVsaWZ5U2hhZGVyIiwic2hhZGVyU3RyaW5nIiwicmVhZEZpbGVTeW5jIiwibW9kdWxpZnlTb3VuZCIsInN1ZmZpeCIsImxhc3REb3RJbmRleCIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiZ2V0U3VmZml4IiwiaW5kZXgiLCJtb2R1bGlmeUZpbGUiLCJyb290ZGlyIiwic3RhcnRzV2l0aCIsImluZGV4T2YiLCJjcmVhdGVTdHJpbmdNb2R1bGUiLCJwYWNrYWdlT2JqZWN0IiwiZmlsZSIsInJlYWRKU09OIiwic3RyaW5nTW9kdWxlTmFtZSIsInJlbGF0aXZlU3RyaW5nTW9kdWxlRmlsZSIsInN0cmluZ01vZHVsZUZpbGVKUyIsIm5hbWVzcGFjZSIsImNhbWVsQ2FzZSIsImV4aXN0c1N5bmMiLCJjb25zb2xlIiwibG9nIiwiY29weXJpZ2h0TGluZSIsImdldFN0cmluZ1R5cGVzIiwicGhldCIsInJlcXVpcmVqc05hbWVzcGFjZSIsImpzb24iLCJhbGwiLCJ2aXNpdCIsInBhdGgiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImtleSIsInZhbHVlIiwicHVzaCIsInN0cnVjdHVyZSIsImFsbEVsZW1lbnQiLCJrIiwicGF0aEVsZW1lbnQiLCJ0b2tlbnMiLCJtIiwidG9rZW4iLCJpbmNsdWRlcyIsInNpbUZlYXR1cmVzIiwic3VwcG9ydHNEeW5hbWljTG9jYWxlIiwidGV4dCIsIm1vZHVsaWZ5IiwicmVsYXRpdmVGaWxlcyIsInJlY3Vyc2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsibW9kdWxpZnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIEpTIG1vZHVsZXMgZnJvbSByZXNvdXJjZXMgc3VjaCBhcyBpbWFnZXMvc3RyaW5ncy9hdWRpby9ldGMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuXHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xyXG5jb25zdCBjcmVhdGVNaXBtYXAgPSByZXF1aXJlKCAnLi9jcmVhdGVNaXBtYXAnICk7XHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5jb25zdCBncnVudCA9IHJlcXVpcmUoICdncnVudCcgKTtcclxuY29uc3QgbG9hZEZpbGVBc0RhdGFVUkkgPSByZXF1aXJlKCAnLi4vY29tbW9uL2xvYWRGaWxlQXNEYXRhVVJJJyApO1xyXG5jb25zdCBwYXNjYWxDYXNlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9wYXNjYWxDYXNlJyApO1xyXG5jb25zdCBvcyA9IHJlcXVpcmUoICdvcycgKTtcclxuY29uc3QgZ2V0Q29weXJpZ2h0TGluZSA9IHJlcXVpcmUoICcuL2dldENvcHlyaWdodExpbmUnICk7XHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcbmNvbnN0IHdyaXRlRmlsZUFuZEdpdEFkZCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL3dyaXRlRmlsZUFuZEdpdEFkZCcgKTtcclxuXHJcbi8vIGRpc2FibGUgbGludCBpbiBjb21waWxlZCBmaWxlcywgYmVjYXVzZSBpdCBpbmNyZWFzZXMgdGhlIGxpbnRpbmcgdGltZVxyXG5jb25zdCBIRUFERVIgPSAnLyogZXNsaW50LWRpc2FibGUgKi8nO1xyXG5cclxuLy8gc3VwcG9ydGVkIGltYWdlIHR5cGVzLCBub3QgY2FzZS1zZW5zaXRpdmVcclxuY29uc3QgSU1BR0VfU1VGRklYRVMgPSBbICcucG5nJywgJy5qcGcnLCAnLmN1cicgXTtcclxuXHJcbi8vIHN1cHBvcnRlZCBzb3VuZCBmaWxlIHR5cGVzLCBub3QgY2FzZS1zZW5zaXRpdmVcclxuY29uc3QgU09VTkRfU1VGRklYRVMgPSBbICcubXAzJywgJy53YXYnIF07XHJcblxyXG4vLyBzdXBwb3J0ZWQgc2hhZGVyIGZpbGUgdHlwZXMsIG5vdCBjYXNlLXNlbnNpdGl2ZVxyXG5jb25zdCBTSEFERVJfU1VGRklYRVMgPSBbICcuZ2xzbCcsICcudmVydCcsICcuc2hhZGVyJyBdO1xyXG5cclxuLyoqXHJcbiAqIFN0cmluZyByZXBsYWNlbWVudFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gdGhlIHN0cmluZyB3aGljaCB3aWxsIGJlIHNlYXJjaGVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWFyY2ggLSB0aGUgdGV4dCB0byBiZSByZXBsYWNlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbGFjZW1lbnQgLSB0aGUgbmV3IHRleHRcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbmNvbnN0IHJlcGxhY2UgPSAoIHN0cmluZywgc2VhcmNoLCByZXBsYWNlbWVudCApID0+IHN0cmluZy5zcGxpdCggc2VhcmNoICkuam9pbiggcmVwbGFjZW1lbnQgKTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIHJlbGF0aXZlIGZyb20gdGhlIG1vZHVsaWZpZWQgcmVwbyB0byB0aGUgZmlsZW5hbWUgdGhyb3VnaCB0aGUgcHJvdmlkZWQgc3ViZGlyZWN0b3J5LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3ViZGlyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuY29uc3QgZ2V0UmVsYXRpdmVQYXRoID0gKCBzdWJkaXIsIGZpbGVuYW1lICkgPT4ge1xyXG4gIHJldHVybiBgJHtzdWJkaXJ9LyR7ZmlsZW5hbWV9YDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRoZSByZWxhdGl2ZSBwYXRoIHRvIHRoZSByb290IGJhc2VkIG9uIHRoZSBkZXB0aCBvZiBhIHJlc291cmNlXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5jb25zdCBleHBhbmREb3RzID0gYWJzcGF0aCA9PiB7XHJcblxyXG4gIC8vIEZpbmRzIHRoZSBkZXB0aHMgb2YgYSBkaXJlY3RvcnkgcmVsYXRpdmUgdG8gdGhlIHJvb3Qgb2Ygd2hlcmUgZ3J1bnQucmVjdXJzZSB3YXMgY2FsbGVkIGZyb20gKGEgcmVwbyByb290KVxyXG4gIGNvbnN0IGRlcHRoID0gYWJzcGF0aC5zcGxpdCggJy8nICkubGVuZ3RoIC0gMjtcclxuICBsZXQgcGFyZW50RGlyZWN0b3J5ID0gJyc7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGVwdGg7IGkrKyApIHtcclxuICAgIHBhcmVudERpcmVjdG9yeSA9IGAke3BhcmVudERpcmVjdG9yeX0uLi9gO1xyXG4gIH1cclxuICByZXR1cm4gcGFyZW50RGlyZWN0b3J5O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE91dHB1dCB3aXRoIGFuIE9TLXNwZWNpZmljIEVPTCBzZXF1ZW5jZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy85MDhcclxuICogQHBhcmFtIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuY29uc3QgZml4RU9MID0gc3RyaW5nID0+IHJlcGxhY2UoIHN0cmluZywgJ1xcbicsIG9zLkVPTCApO1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybSBhbiBpbWFnZSBmaWxlIHRvIGEgSlMgZmlsZSB0aGF0IGxvYWRzIHRoZSBpbWFnZS5cclxuICogQHBhcmFtIHtzdHJpbmd9IGFic3BhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGUgaW1hZ2VcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSByZXBvc2l0b3J5IG5hbWUgZm9yIHRoZSBtb2R1bGlmeSBjb21tYW5kXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdWJkaXIgLSBzdWJkaXJlY3RvcnkgbG9jYXRpb24gZm9yIG1vZHVsaWZpZWQgYXNzZXRzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIG5hbWUgb2YgZmlsZSBiZWluZyBtb2R1bGlmaWVkXHJcbiAqL1xyXG5jb25zdCBtb2R1bGlmeUltYWdlID0gYXN5bmMgKCBhYnNwYXRoLCByZXBvLCBzdWJkaXIsIGZpbGVuYW1lICkgPT4ge1xyXG5cclxuICBjb25zdCBkYXRhVVJJID0gbG9hZEZpbGVBc0RhdGFVUkkoIGFic3BhdGggKTtcclxuXHJcbiAgY29uc3QgY29udGVudHMgPSBgJHtIRUFERVJ9XHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcke2V4cGFuZERvdHMoIGFic3BhdGggKX1waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5cclxuY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggaW1hZ2UgKTtcclxuaW1hZ2Uub25sb2FkID0gdW5sb2NrO1xyXG5pbWFnZS5zcmMgPSAnJHtkYXRhVVJJfSc7XHJcbmV4cG9ydCBkZWZhdWx0IGltYWdlO2A7XHJcblxyXG4gIGNvbnN0IHRzRmlsZW5hbWUgPSBjb252ZXJ0U3VmZml4KCBmaWxlbmFtZSwgJy50cycgKTtcclxuICBhd2FpdCB3cml0ZUZpbGVBbmRHaXRBZGQoIHJlcG8sIGdldFJlbGF0aXZlUGF0aCggc3ViZGlyLCB0c0ZpbGVuYW1lICksIGZpeEVPTCggY29udGVudHMgKSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybSBhbiBpbWFnZSBmaWxlIHRvIGEgSlMgZmlsZSB0aGF0IGxvYWRzIHRoZSBpbWFnZSBhcyBhIG1pcG1hcC5cclxuICogQHBhcmFtIHtzdHJpbmd9IGFic3BhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGUgaW1hZ2VcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSByZXBvc2l0b3J5IG5hbWUgZm9yIHRoZSBtb2R1bGlmeSBjb21tYW5kXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdWJkaXIgLSBzdWJkaXJlY3RvcnkgbG9jYXRpb24gZm9yIG1vZHVsaWZpZWQgYXNzZXRzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIG5hbWUgb2YgZmlsZSBiZWluZyBtb2R1bGlmaWVkXHJcbiAqL1xyXG5jb25zdCBtb2R1bGlmeU1pcG1hcCA9IGFzeW5jICggYWJzcGF0aCwgcmVwbywgc3ViZGlyLCBmaWxlbmFtZSApID0+IHtcclxuXHJcbiAgLy8gRGVmYXVsdHMuIE5PVEU6IHVzaW5nIHRoZSBkZWZhdWx0IHNldHRpbmdzIGJlY2F1c2Ugd2UgaGF2ZSBub3QgcnVuIGludG8gYSBuZWVkLCBzZWVcclxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvODIwIGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvOTQ1XHJcbiAgY29uc3QgY29uZmlnID0ge1xyXG4gICAgbGV2ZWw6IDQsIC8vIG1heGltdW0gbGV2ZWxcclxuICAgIHF1YWxpdHk6IDk4XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbWlwbWFwcyA9IGF3YWl0IGNyZWF0ZU1pcG1hcCggYWJzcGF0aCwgY29uZmlnLmxldmVsLCBjb25maWcucXVhbGl0eSApO1xyXG4gIGNvbnN0IGVudHJ5ID0gbWlwbWFwcy5tYXAoICggeyB3aWR0aCwgaGVpZ2h0LCB1cmwgfSApID0+ICggeyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0LCB1cmw6IHVybCB9ICkgKTtcclxuXHJcbiAgY29uc3QgbWlwbWFwQ29udGVudHMgPSBgJHtIRUFERVJ9XHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcke2V4cGFuZERvdHMoIGFic3BhdGggKX1waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5cclxuY29uc3QgbWlwbWFwcyA9ICR7SlNPTi5zdHJpbmdpZnkoIGVudHJ5LCBudWxsLCAyICl9O1xyXG5taXBtYXBzLmZvckVhY2goIG1pcG1hcCA9PiB7XHJcbiAgbWlwbWFwLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gIGNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIG1pcG1hcC5pbWcgKTtcclxuICBtaXBtYXAuaW1nLm9ubG9hZCA9IHVubG9jaztcclxuICBtaXBtYXAuaW1nLnNyYyA9IG1pcG1hcC51cmw7IC8vIHRyaWdnZXIgdGhlIGxvYWRpbmcgb2YgdGhlIGltYWdlIGZvciBpdHMgbGV2ZWxcclxuICBtaXBtYXAuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICBtaXBtYXAuY2FudmFzLndpZHRoID0gbWlwbWFwLndpZHRoO1xyXG4gIG1pcG1hcC5jYW52YXMuaGVpZ2h0ID0gbWlwbWFwLmhlaWdodDtcclxuICBjb25zdCBjb250ZXh0ID0gbWlwbWFwLmNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgbWlwbWFwLnVwZGF0ZUNhbnZhcyA9ICgpID0+IHtcclxuICAgIGlmICggbWlwbWFwLmltZy5jb21wbGV0ZSAmJiAoIHR5cGVvZiBtaXBtYXAuaW1nLm5hdHVyYWxXaWR0aCA9PT0gJ3VuZGVmaW5lZCcgfHwgbWlwbWFwLmltZy5uYXR1cmFsV2lkdGggPiAwICkgKSB7XHJcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKCBtaXBtYXAuaW1nLCAwLCAwICk7XHJcbiAgICAgIGRlbGV0ZSBtaXBtYXAudXBkYXRlQ2FudmFzO1xyXG4gICAgfVxyXG4gIH07XHJcbn0gKTtcclxuZXhwb3J0IGRlZmF1bHQgbWlwbWFwcztgO1xyXG4gIGNvbnN0IGpzRmlsZW5hbWUgPSBjb252ZXJ0U3VmZml4KCBmaWxlbmFtZSwgJy5qcycgKTtcclxuICBhd2FpdCB3cml0ZUZpbGVBbmRHaXRBZGQoIHJlcG8sIGdldFJlbGF0aXZlUGF0aCggc3ViZGlyLCBqc0ZpbGVuYW1lICksIGZpeEVPTCggbWlwbWFwQ29udGVudHMgKSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybSBhIEdMU0wgc2hhZGVyIGZpbGUgdG8gYSBKUyBmaWxlIHRoYXQgaXMgcmVwcmVzZW50ZWQgYnkgYSBzdHJpbmcuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhYnNwYXRoIC0gdGhlIGFic29sdXRlIHBhdGggb2YgdGhlIGltYWdlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gcmVwb3NpdG9yeSBuYW1lIGZvciB0aGUgbW9kdWxpZnkgY29tbWFuZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3ViZGlyIC0gc3ViZGlyZWN0b3J5IGxvY2F0aW9uIGZvciBtb2R1bGlmaWVkIGFzc2V0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWUgLSBuYW1lIG9mIGZpbGUgYmVpbmcgbW9kdWxpZmllZFxyXG4gKi9cclxuY29uc3QgbW9kdWxpZnlTaGFkZXIgPSBhc3luYyAoIGFic3BhdGgsIHJlcG8sIHN1YmRpciwgZmlsZW5hbWUgKSA9PiB7XHJcblxyXG4gIC8vIGxvYWQgdGhlIHNoYWRlciBmaWxlXHJcbiAgY29uc3Qgc2hhZGVyU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKCBhYnNwYXRoLCAndXRmLTgnICkucmVwbGFjZSggL1xcci9nLCAnJyApO1xyXG5cclxuICAvLyBvdXRwdXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBmaWxlIHRoYXQgd2lsbCBkZWZpbmUgdGhlIHNoYWRlciBpbiBKUyBmb3JtYXRcclxuICBjb25zdCBjb250ZW50cyA9IGAke0hFQURFUn1cclxuZXhwb3J0IGRlZmF1bHQgJHtKU09OLnN0cmluZ2lmeSggc2hhZGVyU3RyaW5nICl9YDtcclxuXHJcbiAgY29uc3QganNGaWxlbmFtZSA9IGNvbnZlcnRTdWZmaXgoIGZpbGVuYW1lLCAnLmpzJyApO1xyXG4gIGF3YWl0IHdyaXRlRmlsZUFuZEdpdEFkZCggcmVwbywgZ2V0UmVsYXRpdmVQYXRoKCBzdWJkaXIsIGpzRmlsZW5hbWUgKSwgZml4RU9MKCBjb250ZW50cyApICk7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVjb2RlIGEgc291bmQgZmlsZSBpbnRvIGEgV2ViIEF1ZGlvIEF1ZGlvQnVmZmVyLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYWJzcGF0aCAtIHRoZSBhYnNvbHV0ZSBwYXRoIG9mIHRoZSBpbWFnZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIHJlcG9zaXRvcnkgbmFtZSBmb3IgdGhlIG1vZHVsaWZ5IGNvbW1hbmRcclxuICogQHBhcmFtIHtzdHJpbmd9IHN1YmRpciAtIHN1YmRpcmVjdG9yeSBsb2NhdGlvbiBmb3IgbW9kdWxpZmllZCBhc3NldHNcclxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIC0gbmFtZSBvZiBmaWxlIGJlaW5nIG1vZHVsaWZpZWRcclxuICovXHJcbmNvbnN0IG1vZHVsaWZ5U291bmQgPSBhc3luYyAoIGFic3BhdGgsIHJlcG8sIHN1YmRpciwgZmlsZW5hbWUgKSA9PiB7XHJcblxyXG4gIC8vIGxvYWQgdGhlIHNvdW5kIGZpbGVcclxuICBjb25zdCBkYXRhVVJJID0gbG9hZEZpbGVBc0RhdGFVUkkoIGFic3BhdGggKTtcclxuXHJcbiAgLy8gb3V0cHV0IHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZSB0aGF0IHdpbGwgZGVmaW5lIHRoZSBzb3VuZCBpbiBKUyBmb3JtYXRcclxuICBjb25zdCBjb250ZW50cyA9IGAke0hFQURFUn1cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJyR7ZXhwYW5kRG90cyggYWJzcGF0aCApfXBoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcbmltcG9ydCBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5IGZyb20gJyR7ZXhwYW5kRG90cyggYWJzcGF0aCApfXRhbWJvL2pzL2Jhc2U2NFNvdW5kVG9CeXRlQXJyYXkuanMnO1xyXG5pbXBvcnQgV3JhcHBlZEF1ZGlvQnVmZmVyIGZyb20gJyR7ZXhwYW5kRG90cyggYWJzcGF0aCApfXRhbWJvL2pzL1dyYXBwZWRBdWRpb0J1ZmZlci5qcyc7XHJcbmltcG9ydCBwaGV0QXVkaW9Db250ZXh0IGZyb20gJyR7ZXhwYW5kRG90cyggYWJzcGF0aCApfXRhbWJvL2pzL3BoZXRBdWRpb0NvbnRleHQuanMnO1xyXG5cclxuY29uc3Qgc291bmRVUkkgPSAnJHtkYXRhVVJJfSc7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7YDtcclxuXHJcbiAgY29uc3QganNGaWxlbmFtZSA9IGNvbnZlcnRTdWZmaXgoIGZpbGVuYW1lLCAnLmpzJyApO1xyXG4gIGF3YWl0IHdyaXRlRmlsZUFuZEdpdEFkZCggcmVwbywgZ2V0UmVsYXRpdmVQYXRoKCBzdWJkaXIsIGpzRmlsZW5hbWUgKSwgZml4RU9MKCBjb250ZW50cyApICk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29udmVydCAucG5nID0+IF9wbmdfbWlwbWFwLmpzLCBldGMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhYnNwYXRoIC0gZmlsZSBuYW1lIHdpdGggYSBzdWZmaXggb3IgYSBwYXRoIHRvIGl0XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdWZmaXggLSB0aGUgbmV3IHN1ZmZpeCwgc3VjaCBhcyAnLmpzJ1xyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuY29uc3QgY29udmVydFN1ZmZpeCA9ICggYWJzcGF0aCwgc3VmZml4ICkgPT4ge1xyXG4gIGNvbnN0IGxhc3REb3RJbmRleCA9IGFic3BhdGgubGFzdEluZGV4T2YoICcuJyApO1xyXG4gIHJldHVybiBgJHthYnNwYXRoLnN1YnN0cmluZyggMCwgbGFzdERvdEluZGV4ICl9XyR7YWJzcGF0aC5zdWJzdHJpbmcoIGxhc3REb3RJbmRleCArIDEgKX0ke3N1ZmZpeH1gO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERldGVybWluZXMgdGhlIHN1ZmZpeCBmcm9tIGEgZmlsZW5hbWUsIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpbmFsICcuJ1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWVcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbmNvbnN0IGdldFN1ZmZpeCA9IGZpbGVuYW1lID0+IHtcclxuICBjb25zdCBpbmRleCA9IGZpbGVuYW1lLmxhc3RJbmRleE9mKCAnLicgKTtcclxuICByZXR1cm4gZmlsZW5hbWUuc3Vic3RyaW5nKCBpbmRleCApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSAqLmpzIGZpbGUgY29ycmVzcG9uZGluZyB0byBtYXRjaGluZyByZXNvdXJjZXMgc3VjaCBhcyBpbWFnZXMgb3Igc291bmRzLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYWJzcGF0aFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcm9vdGRpclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3ViZGlyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xyXG4gKi9cclxuY29uc3QgbW9kdWxpZnlGaWxlID0gYXN5bmMgKCBhYnNwYXRoLCByb290ZGlyLCBzdWJkaXIsIGZpbGVuYW1lLCByZXBvICkgPT4ge1xyXG5cclxuICBpZiAoIHN1YmRpciAmJiAoIHN1YmRpci5zdGFydHNXaXRoKCAnaW1hZ2VzJyApIHx8XHJcblxyXG4gICAgICAgICAgICAgICAgICAgLy8gZm9yIGJyYW5kXHJcbiAgICAgICAgICAgICAgICAgICBzdWJkaXIuc3RhcnRzV2l0aCggJ3BoZXQvaW1hZ2VzJyApIHx8XHJcbiAgICAgICAgICAgICAgICAgICBzdWJkaXIuc3RhcnRzV2l0aCggJ3BoZXQtaW8vaW1hZ2VzJyApIHx8XHJcbiAgICAgICAgICAgICAgICAgICBzdWJkaXIuc3RhcnRzV2l0aCggJ2FkYXB0ZWQtZnJvbS1waGV0L2ltYWdlcycgKSApXHJcbiAgICAgICAmJiBJTUFHRV9TVUZGSVhFUy5pbmRleE9mKCBnZXRTdWZmaXgoIGZpbGVuYW1lICkgKSA+PSAwICkge1xyXG4gICAgYXdhaXQgbW9kdWxpZnlJbWFnZSggYWJzcGF0aCwgcmVwbywgc3ViZGlyLCBmaWxlbmFtZSApO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBzdWJkaXIgJiYgKCBzdWJkaXIuc3RhcnRzV2l0aCggJ21pcG1hcHMnICkgfHxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAvLyBmb3IgYnJhbmRcclxuICAgICAgICAgICAgICAgICAgIHN1YmRpci5zdGFydHNXaXRoKCAncGhldC9taXBtYXBzJyApIHx8XHJcbiAgICAgICAgICAgICAgICAgICBzdWJkaXIuc3RhcnRzV2l0aCggJ3BoZXQtaW8vbWlwbWFwcycgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgc3ViZGlyLnN0YXJ0c1dpdGgoICdhZGFwdGVkLWZyb20tcGhldC9taXBtYXBzJyApIClcclxuICAgICAgICYmIElNQUdFX1NVRkZJWEVTLmluZGV4T2YoIGdldFN1ZmZpeCggZmlsZW5hbWUgKSApID49IDAgKSB7XHJcbiAgICBhd2FpdCBtb2R1bGlmeU1pcG1hcCggYWJzcGF0aCwgcmVwbywgc3ViZGlyLCBmaWxlbmFtZSApO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBzdWJkaXIgJiYgc3ViZGlyLnN0YXJ0c1dpdGgoICdzb3VuZHMnICkgJiYgU09VTkRfU1VGRklYRVMuaW5kZXhPZiggZ2V0U3VmZml4KCBmaWxlbmFtZSApICkgPj0gMCApIHtcclxuICAgIGF3YWl0IG1vZHVsaWZ5U291bmQoIGFic3BhdGgsIHJlcG8sIHN1YmRpciwgZmlsZW5hbWUgKTtcclxuICB9XHJcblxyXG4gIGlmICggc3ViZGlyICYmIHN1YmRpci5zdGFydHNXaXRoKCAnc2hhZGVycycgKSAmJiBTSEFERVJfU1VGRklYRVMuaW5kZXhPZiggZ2V0U3VmZml4KCBmaWxlbmFtZSApICkgPj0gMCApIHtcclxuICAgIGF3YWl0IG1vZHVsaWZ5U2hhZGVyKCBhYnNwYXRoLCByZXBvLCBzdWJkaXIsIGZpbGVuYW1lICk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIHN0cmluZyBtb2R1bGUgYXQganMvJHtfLmNhbWVsQ2FzZSggcmVwbyApfVN0cmluZ3MuanMgZm9yIHJlcG9zIHRoYXQgbmVlZCBpdC5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xyXG4gKi9cclxuY29uc3QgY3JlYXRlU3RyaW5nTW9kdWxlID0gYXN5bmMgcmVwbyA9PiB7XHJcblxyXG4gIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBncnVudC5maWxlLnJlYWRKU09OKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XHJcbiAgY29uc3Qgc3RyaW5nTW9kdWxlTmFtZSA9IGAke3Bhc2NhbENhc2UoIHJlcG8gKX1TdHJpbmdzYDtcclxuICBjb25zdCByZWxhdGl2ZVN0cmluZ01vZHVsZUZpbGUgPSBganMvJHtzdHJpbmdNb2R1bGVOYW1lfS50c2A7XHJcbiAgY29uc3Qgc3RyaW5nTW9kdWxlRmlsZUpTID0gYC4uLyR7cmVwb30vanMvJHtzdHJpbmdNb2R1bGVOYW1lfS5qc2A7XHJcbiAgY29uc3QgbmFtZXNwYWNlID0gXy5jYW1lbENhc2UoIHJlcG8gKTtcclxuXHJcbiAgaWYgKCBmcy5leGlzdHNTeW5jKCBzdHJpbmdNb2R1bGVGaWxlSlMgKSApIHtcclxuICAgIGNvbnNvbGUubG9nKCAnRm91bmQgSlMgc3RyaW5nIGZpbGUgaW4gVFMgcmVwby4gIEl0IHNob3VsZCBiZSBkZWxldGVkIG1hbnVhbGx5LiAgJyArIHN0cmluZ01vZHVsZUZpbGVKUyApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY29weXJpZ2h0TGluZSA9IGF3YWl0IGdldENvcHlyaWdodExpbmUoIHJlcG8sIHJlbGF0aXZlU3RyaW5nTW9kdWxlRmlsZSApO1xyXG4gIGF3YWl0IHdyaXRlRmlsZUFuZEdpdEFkZCggcmVwbywgcmVsYXRpdmVTdHJpbmdNb2R1bGVGaWxlLCBmaXhFT0woXHJcbiAgICBgJHtjb3B5cmlnaHRMaW5lfVxyXG5cclxuLyoqXHJcbiAqIEF1dG8tZ2VuZXJhdGVkIGZyb20gbW9kdWxpZnksIERPIE5PVCBtYW51YWxseSBtb2RpZnkuXHJcbiAqL1xyXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgZ2V0U3RyaW5nTW9kdWxlIGZyb20gJy4uLy4uL2NoaXBwZXIvanMvZ2V0U3RyaW5nTW9kdWxlLmpzJztcclxuaW1wb3J0IExpbmthYmxlUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9MaW5rYWJsZVByb3BlcnR5LmpzJztcclxuaW1wb3J0ICR7bmFtZXNwYWNlfSBmcm9tICcuLyR7bmFtZXNwYWNlfS5qcyc7XHJcblxyXG50eXBlIFN0cmluZ3NUeXBlID0gJHtnZXRTdHJpbmdUeXBlcyggcmVwbyApfTtcclxuXHJcbmNvbnN0ICR7c3RyaW5nTW9kdWxlTmFtZX0gPSBnZXRTdHJpbmdNb2R1bGUoICcke3BhY2thZ2VPYmplY3QucGhldC5yZXF1aXJlanNOYW1lc3BhY2V9JyApIGFzIFN0cmluZ3NUeXBlO1xyXG5cclxuJHtuYW1lc3BhY2V9LnJlZ2lzdGVyKCAnJHtzdHJpbmdNb2R1bGVOYW1lfScsICR7c3RyaW5nTW9kdWxlTmFtZX0gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICR7c3RyaW5nTW9kdWxlTmFtZX07XHJcbmAgKSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSAqLmQudHMgZmlsZSB0aGF0IHJlcHJlc2VudHMgdGhlIHR5cGVzIG9mIHRoZSBzdHJpbmdzIGZvciB0aGUgcmVwby5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xyXG4gKi9cclxuY29uc3QgZ2V0U3RyaW5nVHlwZXMgPSByZXBvID0+IHtcclxuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gZ3J1bnQuZmlsZS5yZWFkSlNPTiggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCApO1xyXG4gIGNvbnN0IGpzb24gPSBncnVudC5maWxlLnJlYWRKU09OKCBgLi4vJHtyZXBvfS8ke3JlcG99LXN0cmluZ3NfZW4uanNvbmAgKTtcclxuXHJcbiAgLy8gVHJhY2sgcGF0aHMgdG8gYWxsIHRoZSBrZXlzIHdpdGggdmFsdWVzLlxyXG4gIGNvbnN0IGFsbCA9IFtdO1xyXG5cclxuICAvLyBSZWN1cnNpdmVseSBjb2xsZWN0IGFsbCBvZiB0aGUgcGF0aHMgdG8ga2V5cyB3aXRoIHZhbHVlcy5cclxuICBjb25zdCB2aXNpdCA9ICggbGV2ZWwsIHBhdGggKSA9PiB7XHJcbiAgICBPYmplY3Qua2V5cyggbGV2ZWwgKS5mb3JFYWNoKCBrZXkgPT4ge1xyXG4gICAgICBpZiAoIGtleSAhPT0gJ19jb21tZW50JyApIHtcclxuICAgICAgICBpZiAoIGxldmVsWyBrZXkgXS52YWx1ZSAmJiB0eXBlb2YgbGV2ZWxbIGtleSBdLnZhbHVlID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgICAgIGFsbC5wdXNoKCB7IHBhdGg6IFsgLi4ucGF0aCwga2V5IF0sIHZhbHVlOiBsZXZlbFsga2V5IF0udmFsdWUgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHZpc2l0KCBsZXZlbFsga2V5IF0sIFsgLi4ucGF0aCwga2V5IF0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9O1xyXG4gIHZpc2l0KCBqc29uLCBbXSApO1xyXG5cclxuICAvLyBUcmFuc2Zvcm0gdG8gYSBuZXcgc3RydWN0dXJlIHRoYXQgbWF0Y2hlcyB0aGUgdHlwZXMgd2UgYWNjZXNzIGF0IHJ1bnRpbWUuXHJcbiAgY29uc3Qgc3RydWN0dXJlID0ge307XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYWxsLmxlbmd0aDsgaSsrICkge1xyXG4gICAgY29uc3QgYWxsRWxlbWVudCA9IGFsbFsgaSBdO1xyXG4gICAgY29uc3QgcGF0aCA9IGFsbEVsZW1lbnQucGF0aDtcclxuICAgIGxldCBsZXZlbCA9IHN0cnVjdHVyZTtcclxuICAgIGZvciAoIGxldCBrID0gMDsgayA8IHBhdGgubGVuZ3RoOyBrKysgKSB7XHJcbiAgICAgIGNvbnN0IHBhdGhFbGVtZW50ID0gcGF0aFsgayBdO1xyXG4gICAgICBjb25zdCB0b2tlbnMgPSBwYXRoRWxlbWVudC5zcGxpdCggJy4nICk7XHJcbiAgICAgIGZvciAoIGxldCBtID0gMDsgbSA8IHRva2Vucy5sZW5ndGg7IG0rKyApIHtcclxuICAgICAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1sgbSBdO1xyXG5cclxuICAgICAgICBhc3NlcnQoICF0b2tlbi5pbmNsdWRlcyggJzsnICksIGBUb2tlbiAke3Rva2VufSBjYW5ub3QgaW5jbHVkZSBmb3JiaWRkZW4gY2hhcmFjdGVyc2AgKTtcclxuICAgICAgICBhc3NlcnQoICF0b2tlbi5pbmNsdWRlcyggJywnICksIGBUb2tlbiAke3Rva2VufSBjYW5ub3QgaW5jbHVkZSBmb3JiaWRkZW4gY2hhcmFjdGVyc2AgKTtcclxuICAgICAgICBhc3NlcnQoICF0b2tlbi5pbmNsdWRlcyggJyAnICksIGBUb2tlbiAke3Rva2VufSBjYW5ub3QgaW5jbHVkZSBmb3JiaWRkZW4gY2hhcmFjdGVyc2AgKTtcclxuXHJcbiAgICAgICAgaWYgKCBrID09PSBwYXRoLmxlbmd0aCAtIDEgJiYgbSA9PT0gdG9rZW5zLmxlbmd0aCAtIDEgKSB7XHJcbiAgICAgICAgICBpZiAoICEoIHBhY2thZ2VPYmplY3QucGhldCAmJiBwYWNrYWdlT2JqZWN0LnBoZXQuc2ltRmVhdHVyZXMgJiYgcGFja2FnZU9iamVjdC5waGV0LnNpbUZlYXR1cmVzLnN1cHBvcnRzRHluYW1pY0xvY2FsZSApICkge1xyXG4gICAgICAgICAgICBsZXZlbFsgdG9rZW4gXSA9ICd7e1NUUklOR319JzsgLy8gaW5zdGVhZCBvZiB2YWx1ZSA9IGFsbEVsZW1lbnQudmFsdWVcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGxldmVsWyBgJHt0b2tlbn1TdHJpbmdQcm9wZXJ0eWAgXSA9ICd7e1NUUklOR19QUk9QRVJUWX19JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBsZXZlbFsgdG9rZW4gXSA9IGxldmVsWyB0b2tlbiBdIHx8IHt9O1xyXG4gICAgICAgICAgbGV2ZWwgPSBsZXZlbFsgdG9rZW4gXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxldCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoIHN0cnVjdHVyZSwgbnVsbCwgMiApO1xyXG5cclxuICAvLyBVc2Ugc2luZ2xlIHF1b3RlcyBpbnN0ZWFkIG9mIHRoZSBkb3VibGUgcXVvdGVzIGZyb20gSlNPTlxyXG4gIHRleHQgPSByZXBsYWNlKCB0ZXh0LCAnXCInLCAnXFwnJyApO1xyXG5cclxuICB0ZXh0ID0gcmVwbGFjZSggdGV4dCwgJ1xcJ3t7U1RSSU5HfX1cXCcnLCAnc3RyaW5nJyApO1xyXG4gIHRleHQgPSByZXBsYWNlKCB0ZXh0LCAnXFwne3tTVFJJTkdfUFJPUEVSVFl9fVxcJycsICdMaW5rYWJsZVByb3BlcnR5PHN0cmluZz4nICk7XHJcblxyXG4gIC8vIEFkZCA7IHRvIHRoZSBsYXN0IGluIHRoZSBsaXN0XHJcbiAgdGV4dCA9IHJlcGxhY2UoIHRleHQsICc6IHN0cmluZ1xcbicsICc6IHN0cmluZztcXG4nICk7XHJcbiAgdGV4dCA9IHJlcGxhY2UoIHRleHQsICc6IExpbmthYmxlUHJvcGVydHk8c3RyaW5nPlxcbicsICc6IExpbmthYmxlUHJvcGVydHk8c3RyaW5nPjtcXG4nICk7XHJcblxyXG4gIC8vIFVzZSA7IGluc3RlYWQgb2YgLFxyXG4gIHRleHQgPSByZXBsYWNlKCB0ZXh0LCAnLCcsICc7JyApO1xyXG5cclxuICByZXR1cm4gdGV4dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFbnRyeSBwb2ludCBmb3IgbW9kdWxpZnksIHdoaWNoIHRyYW5zZm9ybXMgYWxsIG9mIHRoZSByZXNvdXJjZXMgaW4gYSByZXBvIHRvICouanMgZmlsZXMuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gdGhlIG5hbWUgb2YgYSByZXBvLCBzdWNoIGFzICdqb2lzdCdcclxuICovXHJcbmNvbnN0IG1vZHVsaWZ5ID0gYXN5bmMgcmVwbyA9PiB7XHJcbiAgY29uc29sZS5sb2coIGBtb2R1bGlmeWluZyAke3JlcG99YCApO1xyXG4gIGNvbnN0IHJlbGF0aXZlRmlsZXMgPSBbXTtcclxuICBncnVudC5maWxlLnJlY3Vyc2UoIGAuLi8ke3JlcG99YCwgYXN5bmMgKCBhYnNwYXRoLCByb290ZGlyLCBzdWJkaXIsIGZpbGVuYW1lICkgPT4ge1xyXG4gICAgcmVsYXRpdmVGaWxlcy5wdXNoKCB7IGFic3BhdGg6IGFic3BhdGgsIHJvb3RkaXI6IHJvb3RkaXIsIHN1YmRpcjogc3ViZGlyLCBmaWxlbmFtZTogZmlsZW5hbWUgfSApO1xyXG4gIH0gKTtcclxuXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgcmVsYXRpdmVGaWxlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgIGNvbnN0IGVudHJ5ID0gcmVsYXRpdmVGaWxlc1sgaSBdO1xyXG4gICAgYXdhaXQgbW9kdWxpZnlGaWxlKCBlbnRyeS5hYnNwYXRoLCBlbnRyeS5yb290ZGlyLCBlbnRyeS5zdWJkaXIsIGVudHJ5LmZpbGVuYW1lLCByZXBvICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IGdydW50LmZpbGUucmVhZEpTT04oIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAgKTtcclxuICBpZiAoIGZzLmV4aXN0c1N5bmMoIGAuLi8ke3JlcG99LyR7cmVwb30tc3RyaW5nc19lbi5qc29uYCApICYmIHBhY2thZ2VPYmplY3QucGhldCAmJiBwYWNrYWdlT2JqZWN0LnBoZXQucmVxdWlyZWpzTmFtZXNwYWNlICkge1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgc3RyaW5ncyBtb2R1bGUgZmlsZVxyXG4gICAgYXdhaXQgY3JlYXRlU3RyaW5nTW9kdWxlKCByZXBvICk7XHJcbiAgfVxy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