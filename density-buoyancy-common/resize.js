// Copyright 2019, University of Colorado Boulder

/* eslint-env node */

const grunt = require( 'grunt' );
const jimp = require( 'jimp' );

const names = [
  'Bricks25_AO.jpg',
  'Bricks25_col.jpg',
  'Bricks25_nrm.jpg',
  'DiamondPlate01_col.jpg',
  'DiamondPlate01_met.jpg',
  'DiamondPlate01_nrm.jpg',
  'DiamondPlate01_rgh.jpg',
  'Ice01_alpha.jpg',
  'Ice01_col.jpg',
  'Ice01_nrm.jpg',
  'Metal08_col.jpg',
  'Metal08_met.jpg',
  'Metal08_nrm.jpg',
  'Metal08_rgh.jpg',
  'Metal10_col.jpg',
  'Metal10_met.jpg',
  'Metal10_nrm.jpg',
  'Metal10_rgh.jpg',
  'Wood26_col.jpg',
  'Wood26_nrm.jpg',
  'Wood26_rgh.jpg'
];

names.forEach( name => {
  

  console.log( new jimp( `assets/${name}`, function() {
    this.quality( 95 );
    this.resize( 256, 256 ).getBuffer( jimp.MIME_JPEG, ( error, buffer ) => {
      if ( error ) {
        throw error;
      }
      else {
        grunt.file.write( `images/${name}`, buffer );
      }
    } );
  } ) );
} );
