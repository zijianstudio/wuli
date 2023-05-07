// Copyright 2014-2022, University of Colorado Boulder

/**
 * View for RGBSlider objects
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { LinearGradient, Rectangle } from '../../../../scenery/js/imports.js';
import VSlider from '../../../../sun/js/VSlider.js';
import colorVision from '../../colorVision.js';
import ColorVisionConstants from '../../common/ColorVisionConstants.js';

class RGBSlider extends Rectangle {

  /**
   * @param {Property.<number>} intensityProperty the intensity property for this color from the model
   * @param {string} color
   * @param {Tandem} tandem
   */
  constructor( intensityProperty, color, tandem ) {

    const slider = new VSlider( intensityProperty, new Range( 0, 100 ), {
      trackSize: new Dimension2( 2, 100 ),
      thumbSize: new Dimension2( 28, 14 ),
      thumbTouchAreaXDilation: 7,
      thumbTouchAreaYDilation: 7,
      tandem: tandem
    } );

    const rectWidth = slider.width + 8;
    const rectHeight = slider.height + 22;

    super( 0, 0, rectWidth, rectHeight, 5, 5,
      {
        fill: new LinearGradient( 0, 0, 0, rectHeight ).addColorStop( 0, color ).addColorStop( 1, 'black' ),
        stroke: ColorVisionConstants.SLIDER_BORDER_STROKE
      } );

    slider.centerX = this.centerX;
    slider.centerY = this.centerY;

    this.addChild( slider );
  }
}

colorVision.register( 'RGBSlider', RGBSlider );

export default RGBSlider;