// Copyright 2018-2023, University of Colorado Boulder

/**
 * Node that creates the PDOM description for the ISLCObject. This Node has no visual output.
 *
 * NOTE: this node should have its labelContent filled in.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { Node } from '../../../scenery/js/imports.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';
import ISLCObjectEnum from '../model/ISLCObjectEnum.js';

class ISLCObjectDescriptionNode extends Node {

  /**
   * @param {ISLCModel} model
   * @param {ISLCObjectEnum} objectEnum
   * @param {Object} config
   */
  constructor( model, objectEnum, config ) {

    config = merge( {
      object1Label: null, // {string} @required
      object2Label: null, // {string} @required

      // pdom
      labelTagName: 'h3',
      tagName: 'ul',
      ariaRole: 'list'
    }, config );

    assert && assert( config.object2Label && config.object1Label, 'required params must be specified' );

    super( config );

    // @protected
    this.thisObjectLabel = ISLCObjectEnum.isObject1( objectEnum ) ? config.object1Label : config.object2Label;
    this.otherObjectLabel = ISLCObjectEnum.isObject1( objectEnum ) ? config.object2Label : config.object1Label;
    this.forceVectorMagnitudeItemNode = new Node( { tagName: 'li' } );
    this.forceBetweenAndVectorNode = new Node( { tagName: 'li' } );

    this.addChild( this.forceBetweenAndVectorNode );
    this.addChild( this.forceVectorMagnitudeItemNode );

    model.showForceValuesProperty.link( showValues => {
      this.forceVectorMagnitudeItemNode.visible = showValues;
    } );
  }
}

inverseSquareLawCommon.register( 'ISLCObjectDescriptionNode', ISLCObjectDescriptionNode );
export default ISLCObjectDescriptionNode;