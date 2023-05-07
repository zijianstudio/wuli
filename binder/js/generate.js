// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main launch point for the documentation generation
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */


const createHTMLString = require( './createHTMLString' );
const fs = require( 'fs' );
const fsExtra = require( 'fs-extra' ); // eslint-disable-line require-statement-match
const getFromSimInMaster = require( './getFromSimInMaster' );

// resolve image and doc paths as constants

// constants
const OUTPUT_FILE = `${__dirname}/../docs/index.html`;

const myArgs = process.argv.slice( 2 );

const commandLineSims = myArgs[ 0 ]; // Allow comma-separated list of sims

console.log( `streaming to ${OUTPUT_FILE}` );

// Copy image files
try {

  // TODO: this assumes we only need image from two repos, see https://github.com/phetsims/binder/issues/28
  fsExtra.copySync( `${__dirname}/../../sun/doc/images`, `${__dirname}/../docs/images/sun` );
  fsExtra.copySync( `${__dirname}/../../scenery-phet/images`, `${__dirname}/../docs/images/scenery-phet` );
}
catch( err ) {
  console.error( err );
  console.error( '\x1b[37m' ); // reset back to white text.
}

( async () => {

  // Run all sims, get a list of pictures for a sim for a component.
  const componentDataBySim = await getFromSimInMaster( commandLineSims );

  const HTML = createHTMLString( componentDataBySim );

  // fs.writeFileSync( 'binderjson.json', JSON.stringify( componentDataBySim, null, 2 ) );
  fs.writeFileSync( OUTPUT_FILE, HTML );
  console.log( `wrote final report to:  ${OUTPUT_FILE}` );
} )();