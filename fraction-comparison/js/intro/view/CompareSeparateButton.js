// Copyright 2013-2022, University of Colorado Boulder

/**
 * Button that will bring the left/right shapes to the center, or move them back to their homes.
 * One class is used to render both buttons since it is like a toggle button, and so the size won't change when toggling.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Color, HBox, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import fractionComparison from '../../fractionComparison.js';

class CompareSeparateButton extends Node {

  /**
   * @param {Function} compareButtonPressed
   * @param {Function} separateButtonPressed
   * @param {Property.<boolean>} compareBothProperty
   * @param {Object} [options]
   */
  constructor( compareButtonPressed, separateButtonPressed, compareBothProperty, options ) {
    super();
    options = options || {};
    const xTip = 20;
    const yTip = 8;
    const xControl = 12;
    const yControl = -5;

    const rightCurve = new Path( new Shape().moveTo( 0, 0 ).quadraticCurveTo( -xControl, yControl, -xTip, yTip ), {
      stroke: 'black',
      lineWidth: 3
    } );
    const leftCurve = new Path( new Shape().moveTo( 0, 0 ).quadraticCurveTo( xControl, yControl, xTip, yTip ), {
      stroke: 'black',
      lineWidth: 3
    } );

    const compareIcon = new HBox( {
      spacing: 5, children: [
        new Node( { children: [ leftCurve, createArrowhead( Math.PI / 3, new Vector2( xTip, yTip ) ) ] } ),
        new Node( { children: [ rightCurve, createArrowhead( Math.PI - Math.PI / 3, new Vector2( -xTip, yTip ) ) ] } )
      ]
    } );

    const separateIcon = new HBox( {
      spacing: 5, children: [
        new Node( { children: [ leftCurve, createArrowhead( Math.PI / 3 + Math.PI * 0.5, new Vector2( 0, 0 ) ) ] } ),
        new Node( { children: [ rightCurve, createArrowhead( Math.PI - Math.PI / 3 - Math.PI / 2, new Vector2( 0, 0 ) ) ] } )
      ]
    } );

    const maxWidth = Math.max( compareIcon.width, separateIcon.width );
    const maxHeight = Math.max( compareIcon.height, separateIcon.height );

    const compareButton = new RectangularPushButton( {
      content: new Rectangle( 0, 0, maxWidth, maxHeight, {
        children: [ compareIcon.mutate( { centerX: maxWidth / 2, centerY: maxHeight / 2 } ) ]
      } ),
      baseColor: new Color( 255, 255, 0 ),
      listener: compareButtonPressed
    } );

    const separateButton = new RectangularPushButton( {
      content: new Rectangle( 0, 0, maxWidth, maxHeight, {
        children: [ separateIcon.mutate( { centerX: maxWidth / 2, centerY: maxHeight / 2 } ) ]
      } ),
      baseColor: new Color( 255, 255, 0 ),
      listener: separateButtonPressed
    } );

    compareBothProperty.linkAttribute( separateButton, 'visible' );
    compareBothProperty.link( compareBoth => {
      compareButton.visible = !compareBoth;
    } );

    this.addChild( compareButton );
    this.addChild( separateButton );

    this.mutate( options );
  }
}

/**
 * Arrowhead factory
 * @param {number} angle - in radians
 * @param {Vector2} tail
 * @returns {Path}
 */
const createArrowhead = ( angle, tail ) => {
  const headWidth = 10;
  const headHeight = 10;
  const directionUnitVector = Vector2.createPolar( 1, angle );
  const orthogonalUnitVector = directionUnitVector.perpendicular;
  const tip = directionUnitVector.times( headHeight ).plus( tail );
  return new Path( new Shape().moveToPoint( tail ).lineToPoint( tail.plus( orthogonalUnitVector.times( headWidth / 2 ) ) ).lineToPoint( tip ).lineToPoint( tail.plus( orthogonalUnitVector.times( -headWidth / 2 ) ) ).lineToPoint( tail ).close(),
    { fill: 'black' } );
};

fractionComparison.register( 'CompareSeparateButton', CompareSeparateButton );

export default CompareSeparateButton;