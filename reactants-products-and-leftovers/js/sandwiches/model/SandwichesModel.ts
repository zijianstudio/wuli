// Copyright 2014-2023, University of Colorado Boulder

/**
 * Model for the 'Sandwiches' screen.
 *
 * For the purposes of the 'sandwiches' analogy:
 * - sandwich recipe == reaction
 * - ingredients == reactants
 * - sandwich == product
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import RPALBaseModel from '../../common/model/RPALBaseModel.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import SandwichRecipe from './SandwichRecipe.js';

export default class SandwichesModel extends RPALBaseModel<SandwichRecipe> {

  public constructor( tandem: Tandem ) {

    const sandwichesTandem = tandem.createTandem( 'sandwiches' );

    const reactions = [

      // sandwich recipe choices, numeric args are: bread, meat, cheese
      new SandwichRecipe( 2, 0, 1, {
        nameProperty: ReactantsProductsAndLeftoversStrings.cheeseStringProperty,
        tandem: sandwichesTandem.createTandem( 'cheeseSandwich' )
      } ),
      new SandwichRecipe( 2, 1, 1, {
        nameProperty: ReactantsProductsAndLeftoversStrings.meatAndCheeseStringProperty,
        tandem: sandwichesTandem.createTandem( 'meatAndCheeseSandwich' )
      } ),

      // for Custom sandwich, the user can change coefficients of the ingredients
      new SandwichRecipe( 0, 0, 0, {
        coefficientsMutable: true,
        nameProperty: ReactantsProductsAndLeftoversStrings.customStringProperty,
        tandem: sandwichesTandem.createTandem( 'customSandwich' )
      } )
    ];

    super( reactions, tandem );
  }
}

reactantsProductsAndLeftovers.register( 'SandwichesModel', SandwichesModel );