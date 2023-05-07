// Copyright 2017-2022, University of Colorado Boulder

/**
 * View of the wire, includes dots that depict the level of resistivity
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Anton Ulyanov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import platform from '../../../../phet-core/js/platform.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { LinearGradient, Node, Path } from '../../../../scenery/js/imports.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireStrings from '../../ResistanceInAWireStrings.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';
import DotsCanvasNode from './DotsCanvasNode.js';
import WireShapeConstants from './WireShapeConstants.js';

const wireDescriptionPatternString = ResistanceInAWireStrings.a11y.wire.wireDescriptionPattern;

class WireNode extends Node {
  /**
   * The position is set using center values since this can grow or shrink in width and height as the area and length of
   * the wire changes.
   *
   * @param {ResistanceInAWireModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {

    super( {
      tandem: tandem,

      // pdom
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: 'The Wire'
    } );

    // @private {ResistanceInAWireModel}
    this.model = model;

    // See https://github.com/phetsims/resistance-in-a-wire/issues/158
    const wireBodyRenderer = platform.android ? 'canvas' : null;

    // Body of the wire
    const wireBody = new Path( null, {
      stroke: 'black',
      tandem: tandem.createTandem( 'wireBody' ),
      renderer: wireBodyRenderer
    } );

    // Cap/end of the wire
    const wireEnd = new Path( null, {
      stroke: 'black',
      fill: '#E8B282',
      tandem: tandem.createTandem( 'wireEnd' ),
      renderer: wireBodyRenderer
    } );

    this.addChild( wireBody );
    this.addChild( wireEnd );

    // all dots representing resistivity
    const dotsNode = new DotsCanvasNode( model );
    this.addChild( dotsNode );

    // Update the resistor on change. No need to unlink, as it is present for the lifetime of the sim.
    Multilink.multilink( [ model.areaProperty, model.lengthProperty, model.resistivityProperty ],
      ( area, length, resistivity ) => {

        // Height of the wire in view coordinates
        const height = WireShapeConstants.areaToHeight( area );

        // Width of the wire (as measured from the top of the wire, that is excluding the rounding bits in the middle).
        const width = WireShapeConstants.lengthToWidth.evaluate( length );

        // Set the (face) body shape of the wire.
        // Recall that (zero,zero) is defined as the center of the wire.
        wireBody.shape = new Shape().moveTo( -width / 2, height / 2 )
          .horizontalLineToRelative( width )
          .ellipticalArc( width / 2, 0, WireShapeConstants.PERSPECTIVE_FACTOR * height / 2, height / 2, 0, Math.PI / 2, 3 * Math.PI / 2, true )
          .horizontalLineToRelative( -width );

        // Set the cap end of the wire
        wireEnd.shape = Shape.ellipse( -width / 2, 0, height * WireShapeConstants.PERSPECTIVE_FACTOR / 2, height / 2 );

        // Set the gradient on the wire to make it look more 3D.
        wireBody.fill = new LinearGradient( 0, height / 2, 0, -height / 2 )
          .addColorStop( 0, '#8C4828' )
          .addColorStop( 0.5, '#E8B282' )
          .addColorStop( 0.65, '#FCF5EE' )
          .addColorStop( 0.8, '#F8E8D9' )
          .addColorStop( 1, '#8C4828' );

        // redraw the dots representing resistivity
        dotsNode.invalidatePaint();

        this.descriptionContent = this.getWireDescription();
      }
    );

    this.mutate( options );
  }

  /**
   * @private
   * @returns {string}
   */
  getWireDescription() {
    const lengthValue = this.model.lengthProperty.get();
    const areaValue = this.model.areaProperty.get();
    const resistivityValue = this.model.resistivityProperty.get();

    const lengthDescription = ResistanceInAWireConstants.getValueDescriptionFromMap( lengthValue, ResistanceInAWireConstants.LENGTH_TO_DESCRIPTION_MAP );
    const areaDescription = ResistanceInAWireConstants.getValueDescriptionFromMap( areaValue, ResistanceInAWireConstants.AREA_TO_DESCRIPTION_MAP );
    const resistivityDescription = ResistanceInAWireConstants.getValueDescriptionFromMap( resistivityValue, ResistanceInAWireConstants.RESISTIVITY_TO_DESCRIPTION_MAP );

    return StringUtils.fillIn( wireDescriptionPatternString, {
      length: lengthDescription,
      thickness: areaDescription,
      impurities: resistivityDescription,
      resistance: Utils.toFixed( this.model.resistanceProperty.get(), ResistanceInAWireConstants.getResistanceDecimals( this.model.resistanceProperty.get() ) )
    } );
  }
}

resistanceInAWire.register( 'WireNode', WireNode );

export default WireNode;