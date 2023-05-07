// Copyright 2020-2022, University of Colorado Boulder

/**
 * Subclass of Rectangle that represents the amplitude of a normal mode in Two Dimensions.
 * It can be clicked to change the amplitude according to the following (the original sim behaviour):
 *  - If the current amplitude is not 'near' the maximum amplitude value, set it to the maximum value;
 *  - If it is 'near', set it to 0.
 * In our case, 'near' is arbitrarily defined.
 * The maximum amplitude values are calculated in TwoDimensionConstants in the same way the original sim does.
 *
 * @author Franco Barpp Gomes (UTFPR)
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import merge from '../../../../phet-core/js/merge.js';
import { FireListener, Rectangle } from '../../../../scenery/js/imports.js';
import AmplitudeDirection from '../../common/model/AmplitudeDirection.js';
import NormalModesColors from '../../common/NormalModesColors.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import normalModes from '../../normalModes.js';

class AmplitudeSelectorRectangle extends Rectangle {

  /**
   * @param {TwoDimensionsModel} model
   * @param {number} row
   * @param {number} col
   * @param {DerivedProperty.<Property.<number>[][]>} axisAmplitudesProperty
   * @param {DerivedProperty.<number>} maxAmplitudeProperty
   * @param {DerivedProperty.<number>} gridToRealSizeRatioProperty
   * @param {Object} [options]
   */
  constructor( model, row, col, axisAmplitudesProperty, maxAmplitudeProperty, gridToRealSizeRatioProperty, options ) {

    options = merge( {
      boundsMethod: 'none',
      left: 0,
      top: 0,
      cursor: 'pointer',
      rectWidth: 1, /* just a default value */
      rectHeight: 1, /* just a default value */
      cornerRadius: 2,
      lineWidth: 1,
      stroke: NormalModesColors.BUTTON_COLORS.stroke,
      fill: NormalModesColors.SELECTOR_HORIZONTAL_FILL,
      fillX: NormalModesColors.SELECTOR_HORIZONTAL_FILL,
      fillY: NormalModesColors.SELECTOR_VERTICAL_FILL,
      backgroundRect: {
        preventFit: true,
        boundsMethod: 'none',
        left: 0,
        top: 0,
        fill: NormalModesColors.BACKGROUND_RECTANGLE_DEFAULT_FILL,
        rectWidth: 1, /* just a default value */
        rectHeight: 0,
        cornerRadius: 2
      },
      rectGridSize: 5,
      paddingGridSize: 1
    }, options );

    super( options );

    const backgroundRect = new Rectangle( options.backgroundRect );
    this.addChild( backgroundRect );

    const amplitudeChanged = ( amplitude, axis ) => {
      if ( model.amplitudeDirectionProperty.get() === axis ) {
        const maxAmplitude = maxAmplitudeProperty.get();
        const heightFactor = Math.min( 1, amplitude / maxAmplitude );
        backgroundRect.rectHeight = this.rectHeight * ( 1 - heightFactor );
      }
    };

    const numberOfMassesChanged = numberOfMasses => {
      if ( row < numberOfMasses && col < numberOfMasses ) {
        this.visible = true;
        this.rectWidth = this.rectHeight = options.rectGridSize * gridToRealSizeRatioProperty.get();

        backgroundRect.rectWidth = this.rectWidth;
        amplitudeChanged( axisAmplitudesProperty.get()[ row ][ col ].get(), model.amplitudeDirectionProperty.get() );

        const gridLeft = col * ( options.paddingGridSize + options.rectGridSize );
        const gridTop = row * ( options.paddingGridSize + options.rectGridSize );

        this.left = gridToRealSizeRatioProperty.get() * gridLeft;
        this.top = gridToRealSizeRatioProperty.get() * gridTop;
      }
      else {
        this.visible = false;
      }
    };

    const amplitudeDirectionChanged = amplitudeDirection => {
      this.fill = ( amplitudeDirection === AmplitudeDirection.VERTICAL ) ? options.fillY : options.fillX;
      amplitudeChanged( axisAmplitudesProperty.get()[ row ][ col ].get(), amplitudeDirection );
    };

    // unlink is unnecessary, exists for the lifetime of the sim
    model.modeXAmplitudeProperties[ row ][ col ].link( amplitude => {
      amplitudeChanged( amplitude, AmplitudeDirection.HORIZONTAL );
    } );
    // unlink is unnecessary, exists for the lifetime of the sim
    model.modeYAmplitudeProperties[ row ][ col ].link( amplitude => {
      amplitudeChanged( amplitude, AmplitudeDirection.VERTICAL );
    } );

    // unlink is unnecessary, exists for the lifetime of the sim
    model.numberOfMassesProperty.link( numberOfMassesChanged );

    // unlink is unnecessary, exists for the lifetime of the sim
    model.amplitudeDirectionProperty.link( amplitudeDirectionChanged );

    const isNear = ( n1, n2 ) => {
      const EPS = 10e-5;
      return n1 >= ( n2 - EPS ) && n1 <= ( n2 + EPS );
    };

    this.addInputListener( new FireListener( {
      fire: () => {
        const amplitude = axisAmplitudesProperty.get()[ row ][ col ];

        if ( isNear( amplitude.get(), maxAmplitudeProperty.get() ) ) {
          amplitude.set( NormalModesConstants.MIN_AMPLITUDE );
        }
        else {
          amplitude.set( maxAmplitudeProperty.get() );
        }

      }
    } ) );
  }
}

normalModes.register( 'AmplitudeSelectorRectangle', AmplitudeSelectorRectangle );
export default AmplitudeSelectorRectangle;