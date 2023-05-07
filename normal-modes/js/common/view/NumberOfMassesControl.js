// Copyright 2021-2022, University of Colorado Boulder

/**
 * NumberOfMassesControl is the control for setting number of masses.
 *
 * @author Franco Barpp Gomes {UTFPR}
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import { HBox, VBox } from '../../../../scenery/js/imports.js';
import normalModes from '../../normalModes.js';
import NormalModesStrings from '../../NormalModesStrings.js';
import NormalModesConstants from '../NormalModesConstants.js';

class NumberOfMassesControl extends NumberControl {

  /**
   * @param {NumberProperty} numberOfMassesProperty
   * @param {Object} [options]
   */
  constructor( numberOfMassesProperty, options ) {

    const range = numberOfMassesProperty.range;

    options = merge( {
      layoutFunction: createLayoutFunction(),
      includeArrowButtons: false,
      sliderOptions: {
        trackSize: new Dimension2( 150, 3 ),
        thumbSize: new Dimension2( 11, 19 ),
        thumbTouchAreaXDilation: 12,
        thumbTouchAreaYDilation: 15,
        majorTickLength: 10,
        minorTickLength: 5,
        majorTicks: [
          { value: range.min, label: '' },
          { value: range.max, label: '' }
        ],
        minorTickSpacing: range.min
      },
      titleNodeOptions: {
        font: NormalModesConstants.GENERAL_FONT
      },
      numberDisplayOptions: {
        textOptions: {
          font: NormalModesConstants.GENERAL_FONT
        }
      }
    }, options );

    super( NormalModesStrings.numberOfMasses, numberOfMassesProperty, range, options );
  }
}

/**
 * Creates the option.layoutFunction for this NumberOfMassesControl.
 * @param {Object} [options]
 * @returns {function}
 */
function createLayoutFunction( options ) {

  options = merge( {
    align: 'center', // {string} horizontal alignment of rows, 'left'|'right'|'center'
    titleXSpacing: 5, // {number} horizontal spacing between title and number
    arrowButtonsXSpacing: 15, // {number} horizontal spacing between arrow buttons and slider
    ySpacing: 8 // {number} vertical spacing between rows
  }, options );

  return ( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton ) => {
    const includeArrowButtons = !!leftArrowButton; // if there aren't arrow buttons, then exclude them
    return new VBox( {
      align: options.align,
      spacing: options.ySpacing,
      excludeInvisibleChildrenFromBounds: false,
      children: [
        new HBox( {
          spacing: options.titleXSpacing,
          children: [ titleNode, numberDisplay ],
          excludeInvisibleChildrenFromBounds: false
        } ),
        new HBox( {
          spacing: options.arrowButtonsXSpacing,
          resize: false, // prevent slider from causing a resize when thumb is at min or max
          children: !includeArrowButtons ? [ slider ] : [
            leftArrowButton,
            slider,
            rightArrowButton
          ],
          excludeInvisibleChildrenFromBounds: false
        } )
      ]
    } );
  };
}

normalModes.register( 'NumberOfMassesControl', NumberOfMassesControl );
export default NumberOfMassesControl;