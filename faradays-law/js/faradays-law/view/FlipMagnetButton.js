// Copyright 2014-2022, University of Colorado Boulder

/**
 * Flip Magnet button for 'Faradays Law' simulation, contains magnet image node.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, PDOMPeer, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import MagnetNode from './MagnetNode.js';

const flipMagnetString = FaradaysLawStrings.a11y.flipMagnet;
const flipPolesString = FaradaysLawStrings.a11y.flipPoles;

class FlipMagnetButton extends RectangularPushButton {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( tandem, options ) {

    const contentNode = new VBox( {
      children: [
        createCurvedArrow( 0 ),
        new MagnetNode( false, {
          width: 74,
          height: 16,
          font: new PhetFont( 14 )
        } ),
        createCurvedArrow( Math.PI )
      ],
      spacing: 1
    } );

    super( merge( {
      content: contentNode,
      baseColor: 'rgb(205,254,195)',
      minWidth: 118,
      minHeight: 65,
      touchAreaXDilation: 10,
      touchAreaYDilation: 10,
      tandem: tandem,
      phetioDocumentation: 'When pressed, changes the orientation of the bar magnet.',
      innerContent: flipMagnetString,
      descriptionContent: flipPolesString,
      appendDescription: true,
      containerTagName: 'li'
    }, options ) );

    this.addAriaDescribedbyAssociation( {
      otherNode: this,
      otherElementName: PDOMPeer.DESCRIPTION_SIBLING,
      thisElementName: PDOMPeer.PRIMARY_SIBLING
    } );
  }
}

/**
 * Create curved arrow to display on the button
 * @param {number} rotation
 * @returns {Node}
 */
function createCurvedArrow( rotation ) {

  // variables for arrow and arc
  const radius = 20;
  const lineWidth = 2.3;
  const arcStartAngle = -Math.PI * 0.90;
  const arcEndAngle = -Math.PI * 0.18;

  const arcShape = new Shape()
    .moveTo( ( radius + lineWidth / 2 ) * Math.cos( arcStartAngle ), ( radius + lineWidth / 2 ) * Math.sin( arcStartAngle ) ) // Inner edge of end.
    .arc( 0, 0, radius, arcStartAngle, arcEndAngle, false ); // Outer curve.

  const matrix = Matrix3.translation( radius * Math.cos( arcEndAngle ), radius * Math.sin( arcEndAngle ) )
    .timesMatrix( Matrix3.rotation2( arcEndAngle ) );
  const arrowHeadShape = new Shape()
    .moveTo( 0, 8 )
    .lineTo( 4, 0 )
    .lineTo( -4, 0 )
    .close()
    .transformed( matrix );
  return new Node( {
    children: [ new Path( arcShape, {
      stroke: '#000',
      lineWidth: lineWidth
    } ), new Path( arrowHeadShape, {
      fill: '#000'
    } )
    ],
    rotation: rotation
  } );
}

faradaysLaw.register( 'FlipMagnetButton', FlipMagnetButton );
export default FlipMagnetButton;