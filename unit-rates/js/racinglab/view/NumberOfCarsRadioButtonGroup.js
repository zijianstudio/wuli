// Copyright 2016-2023, University of Colorado Boulder

/**
 * NumberOfCarsRadioButtonGroup switches between 1 and 2 cars in the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Image, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import blueCar_png from '../../../images/blueCar_png.js';
import redCar_png from '../../../images/redCar_png.js';
import unitRates from '../../unitRates.js';

export default class NumberOfCarsRadioButtonGroup extends RectangularRadioButtonGroup {

  /**
   * @param {Property.<boolean>} car2VisibleProperty - is car2 visible?
   * @param {Object} [options]
   */
  constructor( car2VisibleProperty, options ) {

    options = merge( {

      // NumberOfCarsRadioButtonGroup options
      buttonWidth: 68,

      // RectangularRadioButtonGroup options
      orientation: 'vertical',
      spacing: 11, // space between the buttons
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 12,
        yMargin: 10
      }
    }, options );

    const maxCarWidth = options.buttonWidth - ( 2 * options.radioButtonOptions.xMargin );

    super( car2VisibleProperty, [
      { value: false, createNode: () => createOneCarIcon( maxCarWidth ) },
      { value: true, createNode: () => createTwoCarsIcon( maxCarWidth ) }
    ], options );
  }
}

/**
 * Creates the icon for the 1-car scene, scaled to fit a specified width.
 * @param {number} maxCarWidth
 * @returns {Node}
 */
function createOneCarIcon( maxCarWidth ) {
  return createCarImage( redCar_png, maxCarWidth );
}

/**
 * Creates the icon for the 2-cars scene, scaled to fit a specified width.
 * @param {number} maxCarWidth
 * @returns {Node}
 */
function createTwoCarsIcon( maxCarWidth ) {
  return new VBox( {
    spacing: 7, // space between the 2 cars
    children: [
      createCarImage( redCar_png, maxCarWidth ),
      createCarImage( blueCar_png, maxCarWidth )
    ]
  } );
}

/**
 * Creates a car icon, scaled to fit a specified width.
 * @param {HTMLImageElement} imageFile
 * @param {number} maxCarWidth
 * @returns {Node}
 */
function createCarImage( imageFile, maxCarWidth ) {
  const carImage = new Image( imageFile );
  carImage.setScaleMagnitude( maxCarWidth / carImage.width );
  return carImage;
}

unitRates.register( 'NumberOfCarsRadioButtonGroup', NumberOfCarsRadioButtonGroup );