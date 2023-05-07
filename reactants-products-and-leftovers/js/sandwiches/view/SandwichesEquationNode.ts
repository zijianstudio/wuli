// Copyright 2014-2023, University of Colorado Boulder

/**
 * Equation for the 'Sandwiches' screen.
 * This differs from the 'Molecules' screen equation is a few key ways:
 *
 * 1. Terms are images instead of formulas.
 * 2. Reactant coefficients are mutable for the 'custom' sandwich
 * 3. The 'custom' sandwich reaction may not be well-defined.
 * 4. Appearance (fonts, sizes, spacing, ...) needs to be separately tweakable.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusNode, { PlusNodeOptions } from '../../../../scenery-phet/js/PlusNode.js';
import { Node, RichText, Text, TextOptions } from '../../../../scenery/js/imports.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import RPALConstants from '../../common/RPALConstants.js';
import RightArrowNode, { RightArrowNodeOptions } from '../../common/view/RightArrowNode.js';
import SubstanceIcon from '../../common/view/SubstanceIcon.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import SandwichRecipe from '../model/SandwichRecipe.js';

const COEFFICIENT_X_SPACING = 8; // space between coefficient and node to its right
const PLUS_X_SPACING = 15; // space on both sides of the plus signs
const ARROW_X_SPACING = 15; // space on both sides of arrow
const TEXT_OPTIONS: TextOptions = {
  font: new PhetFont( 28 ),
  fill: 'white'
};
const PLUS_NODE_OPTIONS: PlusNodeOptions = { fill: 'white' };
const RIGHT_ARROW_NODE_OPTIONS: RightArrowNodeOptions = {
  fill: 'white',
  stroke: null,
  scale: 0.65
};

export default class SandwichesEquationNode extends Node {

  /**
   * @param reaction the sandwich recipe (reaction) to display
   * @param maxSandwichSize dimensions of the largest sandwich
   * @param visibleProperty
   */
  public constructor( reaction: SandwichRecipe, maxSandwichSize: Dimension2, visibleProperty: TReadOnlyProperty<boolean> ) {

    // left-hand side is the sandwich ingredients
    const leftNode = new Node();

    let plusNode;
    const numberOfReactants = reaction.reactants.length;
    for ( let i = 0; i < numberOfReactants; i++ ) {

      const reactant = reaction.reactants[ i ];

      // coefficient
      let coefficientNode;
      if ( reaction.coefficientsMutable ) {
        coefficientNode = new NumberSpinner( reactant.coefficientProperty,
          new Property( RPALConstants.SANDWICH_COEFFICIENT_RANGE ), RPALConstants.NUMBER_SPINNER_OPTIONS );
      }
      else {
        coefficientNode = new Text( reactant.coefficientProperty.value, TEXT_OPTIONS );
      }
      coefficientNode.left = plusNode ? ( plusNode.right + PLUS_X_SPACING ) : 0;
      leftNode.addChild( coefficientNode );

      // icon
      const iconNode = new SubstanceIcon( reactant.iconProperty, {
        left: coefficientNode.right + COEFFICIENT_X_SPACING,
        centerY: coefficientNode.centerY
      } );
      leftNode.addChild( iconNode );

      // plus sign between reactants
      if ( i < numberOfReactants - 1 ) {
        plusNode = new PlusNode( PLUS_NODE_OPTIONS );
        plusNode.left = iconNode.right + PLUS_X_SPACING;
        plusNode.centerY = coefficientNode.centerY;
        leftNode.addChild( plusNode );
      }
    }

    // right arrow
    const arrowNode = new RightArrowNode( RIGHT_ARROW_NODE_OPTIONS );
    arrowNode.left = leftNode.right + ARROW_X_SPACING;
    arrowNode.centerY = leftNode.centerY;

    // right-hand side is a sandwich, whose image changes based on coefficients of the ingredients
    const sandwichNode = new SubstanceIcon( reaction.sandwich.iconProperty, {
      centerX: arrowNode.right + ARROW_X_SPACING + ( maxSandwichSize.width / 2 ),
      centerY: arrowNode.centerY
    } );

    // 'No Reaction', max width determined empirically.
    const noReactionNode = new RichText( ReactantsProductsAndLeftoversStrings.noReactionStringProperty, {
      replaceNewlines: true,
      align: 'center',
      font: new PhetFont( 16 ),
      fill: 'white',
      maxWidth: 85
    } );
    noReactionNode.boundsProperty.link( bounds => {
      noReactionNode.left = arrowNode.right + ARROW_X_SPACING;
      noReactionNode.centerY = arrowNode.centerY;
    } );

    super( {
      children: [ leftNode, arrowNode, sandwichNode, noReactionNode ],
      visibleProperty: visibleProperty
    } );

    // Display 'No Reaction' if we don't have a valid sandwich.
    const sandwichIconPropertyObserver = ( node: Node ) => {
      sandwichNode.visible = reaction.isReaction();
      noReactionNode.visible = !sandwichNode.visible;
    };
    reaction.sandwich.iconProperty.link( sandwichIconPropertyObserver );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

reactantsProductsAndLeftovers.register( 'SandwichesEquationNode', SandwichesEquationNode );