// Copyright 2017-2021, University of Colorado Boulder

/**
 * Supertype screenview for generic screens.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import { Node } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import OrientationPair from '../../common/model/OrientationPair.js';
import AreaScreenView from '../../common/view/AreaScreenView.js';
import GenericAreaModel from '../model/GenericAreaModel.js';
import GenericAreaDisplayNode from './GenericAreaDisplayNode.js';
import GenericFactorsNode from './GenericFactorsNode.js';
import GenericLayoutSelectionNode from './GenericLayoutSelectionNode.js';

class GenericAreaScreenView extends AreaScreenView {
  /**
   * @extends {AreaScreenView}
   *
   * @param {GenericAreaModel} model
   * @param {number} decimalPlaces
   */
  constructor( model, decimalPlaces ) {
    assert && assert( model instanceof GenericAreaModel );
    assert && assert( typeof decimalPlaces === 'number' );

    const popupLayer = new Node();

    super( model, {
      isProportional: false,
      decimalPlaces: decimalPlaces,
      getRightAlignNodes: ( nodes, screenView ) => {
        return [
          new GenericLayoutSelectionNode(
            model.genericLayoutProperty,
            popupLayer,
            screenView.factorsBox.width
          ),
          ...nodes
        ];
      }
    } );

    this.addChild( popupLayer );
  }

  /**
   * Creates the main area display view for the screen.
   * @public
   * @override
   *
   * @param {GenericAreaModel} model
   * @returns {GenericAreaDisplayNode}
   */
  createAreaDisplayNode( model ) {
    return new GenericAreaDisplayNode( model.areaDisplay, model.allowExponents, model.partialProductsChoiceProperty, {
      translation: this.getDisplayTranslation()
    } );
  }

  /**
   * Creates the "factors" (dimensions) content for the accordion box.
   * @public
   * @override
   *
   * @param {GenericAreaModel} model
   * @param {number} decimalPlaces
   * @returns {Node}
   */
  createFactorsNode( model, decimalPlaces ) {
    const dynamicProperties = OrientationPair.create( orientation => new DynamicProperty( new DerivedProperty( [ model.currentAreaProperty ], area => area.displayProperties.get( orientation ) ) ) );
    return new GenericFactorsNode( dynamicProperties, new Property( model.allowExponents ) );
  }
}

areaModelCommon.register( 'GenericAreaScreenView', GenericAreaScreenView );

export default GenericAreaScreenView;