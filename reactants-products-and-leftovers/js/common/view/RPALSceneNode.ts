// Copyright 2014-2023, University of Colorado Boulder

/**
 * This is the primary UI component for the 'Sandwiches' and 'Molecules' screens.
 * It displays a reaction as 2 boxes, representing the 'Before' and 'After' states of the reaction.
 * The 'Before' box is on the left, and shows the initial reactants.
 * The 'After' box is on the right, and shows the products and leftovers when the reaction has completed.
 * Below the 'Before' box is a set of spinners for changing the reactant quantities.
 * Below the 'After' box is a set of noneditable quantities for products and leftovers.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { HBox, Node, NodeOptions, NodeTranslationOptions } from '../../../../scenery/js/imports.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import Reaction from '../model/Reaction.js';
import RPALColors from '../RPALColors.js';
import RPALConstants from '../RPALConstants.js';
import QuantitiesNode from './QuantitiesNode.js';
import RightArrowNode from './RightArrowNode.js';
import StacksAccordionBox, { StacksAccordionBoxOptions } from './StacksAccordionBox.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';

const DEFAULT_CONTENT_SIZE = new Dimension2( 100, 100 );
const DEFAULT_MIN_ICON_SIZE = new Dimension2( 0, 0 );

type SelfOptions = {
  quantityRange?: Range; // range of the quantity values
  showSymbols?: boolean; // whether to show symbols (eg, H2O) for the substances in the reactions
  beforeTitleProperty?: TReadOnlyProperty<string>;  // title on the 'Before' box
  afterTitleProperty?: TReadOnlyProperty<string>; // title on the 'After' box
  contentSize?: Dimension2; // size of the 'Before' and 'After' boxes
  minIconSize?: Dimension2; // minimum amount of layout space reserved for Substance icons
  boxYMargin?: number; // vertical margin between the inner edge of box and the tallest node
};

export type BeforeAfterNodeOptions = SelfOptions & NodeTranslationOptions &
  PickRequired<NodeOptions, 'tandem' | 'visibleProperty'>;

export default class RPALSceneNode extends Node {

  private readonly disposeBeforeAfterNode: () => void;

  /**
   * @param reaction - the reaction to be displayed
   * @param beforeExpandedProperty - whether the 'Before' box is expanded
   * @param afterExpandedProperty - whether the 'After' box is expanded
   * @param [providedOptions]
   */
  public constructor( reaction: Reaction,
                      beforeExpandedProperty: Property<boolean>,
                      afterExpandedProperty: Property<boolean>,
                      providedOptions?: BeforeAfterNodeOptions ) {

    const options = optionize<BeforeAfterNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      quantityRange: RPALConstants.QUANTITY_RANGE,
      showSymbols: true,
      beforeTitleProperty: ReactantsProductsAndLeftoversStrings.beforeReactionStringProperty,
      afterTitleProperty: ReactantsProductsAndLeftoversStrings.afterReactionStringProperty,
      contentSize: DEFAULT_CONTENT_SIZE,
      minIconSize: DEFAULT_MIN_ICON_SIZE,
      boxYMargin: 6
    }, providedOptions );

    // vars to improve readability
    const reactants = reaction.reactants;
    const products = reaction.products;
    const leftovers = reaction.leftovers;

    // x-offsets of the substances relative to their boxes
    const beforeXOffsets = QuantitiesNode.createXOffsets( reactants.length, options.contentSize.width );
    const afterXOffsets = QuantitiesNode.createXOffsets( products.length + leftovers.length, options.contentSize.width );

    const stacksAccordionBoxOptions = {
      contentSize: options.contentSize,
      minIconSize: options.minIconSize,
      maxQuantity: options.quantityRange.max,
      boxYMargin: options.boxYMargin
    };

    // 'Before Reaction' accordion box, with stacks of reactants
    const beforeAccordionBox = new StacksAccordionBox( reactants, beforeXOffsets, options.beforeTitleProperty,
      beforeExpandedProperty, combineOptions<StacksAccordionBoxOptions>( {
        tandem: options.tandem.createTandem( 'beforeAccordionBox' )
      }, stacksAccordionBoxOptions ) );

    // 'After Reaction' accordion box, with stacks of products and leftovers
    const afterAccordionBox = new StacksAccordionBox( [ ...products, ...leftovers ], afterXOffsets, options.afterTitleProperty,
      afterExpandedProperty, combineOptions<StacksAccordionBoxOptions>( {
        tandem: options.tandem.createTandem( 'afterAccordionBox' )
      }, stacksAccordionBoxOptions ) );

    // Arrow between boxes
    const rightArrowNode = new RightArrowNode( {
      fill: RPALColors.STATUS_BAR_FILL,
      stroke: null,
      scale: 0.75,
      tandem: options.tandem.createTandem( 'rightArrowNode' )
    } );

    // layout of boxes and arrow
    const hBox = new HBox( {
      children: [ beforeAccordionBox, rightArrowNode, afterAccordionBox ],
      spacing: 10,
      excludeInvisibleChildrenFromBounds: false
    } );

    // Everything below the boxes
    const quantitiesNode = new QuantitiesNode( reactants, products, leftovers, beforeXOffsets, afterXOffsets, {
      showSymbols: options.showSymbols,
      boxWidth: options.contentSize.width,
      afterBoxXOffset: afterAccordionBox.left - beforeAccordionBox.left,
      minIconSize: options.minIconSize,
      quantityRange: options.quantityRange,
      x: beforeAccordionBox.x,
      top: beforeAccordionBox.bottom + 6,
      tandem: options.tandem.createTandem( 'quantitiesNode' )
    } );

    options.children = [ hBox, quantitiesNode ];

    super( options );

    this.addLinkedElement( reaction, {
      tandem: options.tandem.createTandem( reaction.tandem.name )
    } );

    this.disposeBeforeAfterNode = () => {
      beforeAccordionBox.dispose();
      afterAccordionBox.dispose();
      rightArrowNode.dispose();
      quantitiesNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeBeforeAfterNode();
    super.dispose();
  }
}

reactantsProductsAndLeftovers.register( 'RPALSceneNode', RPALSceneNode );