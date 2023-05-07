// Copyright 2022, University of Colorado Boulder

/**
 * Button with two arrows side by side that both point up or down.
 * Press and release immediately and the button fires on 'up'.
 * Press and hold for M milliseconds and the button will fire repeatedly every N milliseconds until released.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import { Shape } from '../../../../kite/js/imports.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { HBox, TPaint, Path } from '../../../../scenery/js/imports.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../../../sun/js/buttons/RectangularPushButton.js';
import buildANucleus from '../../buildANucleus.js';

export type DoubleArrowButtonDirection = 'up' | 'down';

type SelfOptions = {

  // from tip to base
  arrowHeight: number;

  // width of base
  arrowWidth: number;

  leftArrowFill: TPaint;
  rightArrowFill: TPaint;
};

export type DoubleArrowButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'listener' | 'content'>;

export default class DoubleArrowButton extends RectangularPushButton {

  public constructor( direction: DoubleArrowButtonDirection, callback: () => void, providedOptions?: DoubleArrowButtonOptions ) {

    const options = optionize<DoubleArrowButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {

      // options for the button
      cursor: 'pointer',
      baseColor: 'white',
      stroke: 'black',
      lineWidth: 1,
      cornerRadius: 4,
      xMargin: 7,
      yMargin: 5,
      touchAreaXDilation: 7,
      touchAreaYDilation: 7,
      heightSizable: false,

      // options related to fire-on-hold feature
      fireOnHold: true,
      fireOnHoldDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
      fireOnHoldInterval: 100 // fire continuously at this interval (milliseconds)

    }, providedOptions );

    options.listener = callback;

    // arrow shape pointing up
    const arrowShape = new Shape();
    arrowShape.moveTo( 0, 0 ).lineTo( options.arrowWidth / 2, options.arrowHeight ).lineTo( -options.arrowWidth / 2, options.arrowHeight ).close();

    // function to create a double arrow path
    const createDoubleArrow = ( direction: DoubleArrowButtonDirection, leftArrowFill: TPaint, rightArrowFill: TPaint ) => {
      const leftArrowPath = new Path( arrowShape, { fill: leftArrowFill } );
      const rightArrowPath = new Path( arrowShape, { fill: rightArrowFill } );
      const doubleArrow = new HBox( {
        children: [ leftArrowPath, rightArrowPath ],
        spacing: 0
      } );

      if ( direction === 'down' ) {
        doubleArrow.setRotation( Math.PI );

        // switch the colors since the arrow was rotated 180 degrees
        leftArrowPath.fill = rightArrowFill;
        rightArrowPath.fill = leftArrowFill;
      }

      return doubleArrow;
    };

    options.content = createDoubleArrow( direction, options.leftArrowFill, options.rightArrowFill );

    super( options );
  }
}

buildANucleus.register( 'DoubleArrowButton', DoubleArrowButton );