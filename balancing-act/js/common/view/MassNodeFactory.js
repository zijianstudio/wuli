// Copyright 2013-2022, University of Colorado Boulder

/**
 * Factory type for creating mass nodes for a given Mass objects.  This
 * basically does the type identification necessary to match the model
 * representation with the appropriate view representation (i.e. node).
 *
 * @author John Blanco
 */

import { Rectangle, Text } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
import ImageMass from '../model/ImageMass.js';
import BrickStack from '../model/masses/BrickStack.js';
import MysteryMass from '../model/masses/MysteryMass.js';
import BrickStackNode from './BrickStackNode.js';
import ImageMassNode from './ImageMassNode.js';
import MysteryMassNode from './MysteryMassNode.js';

const MassNodeFactory = {
  createMassNode( mass, modelViewTransform, isLabeled, labelVisibleProperty, columnStateProperty ) {
    let massNode;
    if ( mass instanceof MysteryMass ) {
      massNode = new MysteryMassNode( mass, modelViewTransform, isLabeled, labelVisibleProperty, true, columnStateProperty );
    }
    else if ( mass instanceof ImageMass ) {
      massNode = new ImageMassNode( mass, modelViewTransform, isLabeled, labelVisibleProperty, true, columnStateProperty );
    }
    else if ( mass instanceof BrickStack ) {
      massNode = new BrickStackNode( mass, modelViewTransform, isLabeled, labelVisibleProperty, true, columnStateProperty );
    }
    else {
      assert && assert( true, 'Error: Unrecognized mass type sent to MassNodeFactory.' );
      // In case the ever happens out in the wild, create a fake node.
      const textNode = new Text( 'Unimplemented Mass Node' );
      massNode = new Rectangle( 0, 0, textNode.width * 1.3, textNode.height * 1.3, 0, 0, {
        fill: 'pink',
        stroke: 'black'
      } );
      textNode.centerY = massNode.height / 2;
      massNode.addChild( textNode );
      massNode.center = modelViewTransform.modelToViewPosition( mass.positionProperty.get() );
    }
    return massNode;
  }
};

balancingAct.register( 'MassNodeFactory', MassNodeFactory );

export default MassNodeFactory;