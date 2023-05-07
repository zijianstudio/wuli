// Copyright 2019-2023, University of Colorado Boulder

/**
 * Class for a 'Block Values' Node, which creates two stacks of blocks that represent the given left and right current
 * numbers.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { Node, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import numberCompare from '../../numberCompare.js';
import NumberCompareColors from '../../common/NumberCompareColors.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberSuiteCommonConstants from '../../../../number-suite-common/js/common/NumberSuiteCommonConstants.js';

// When originally developed, the height was 468 and the desired SIDE_LENGTH was 20.8 (for a max of 20 blocks), use
// this factor for maintainability.
const SIDE_LENGTH_FACTOR = 0.0487;
const PADDING = 2; // padding between blocks
const SIDE_LENGTH = NumberSuiteCommonConstants.TALL_LOWER_ACCORDION_BOX_HEIGHT * SIDE_LENGTH_FACTOR - PADDING;

class BlockValuesNode extends Node {

  public constructor( leftCurrentNumberProperty: TReadOnlyProperty<number>, rightCurrentNumberProperty: TReadOnlyProperty<number> ) {
    super();

    // Overwrites current children, no need for disposal
    Multilink.multilink( [ leftCurrentNumberProperty, rightCurrentNumberProperty ],
      ( leftCurrentNumber, rightCurrentNumber ) => {
        this.children = [ BlockValuesNode.getBlockValuesNode( leftCurrentNumber, rightCurrentNumber ) ];
      } );
  }

  /**
   * Draws a blockValuesNode, which is two 'towers' of blocks, where the height of each tower corresponds to the
   * values of the provided numbers.
   */
  public static getBlockValuesNode( leftCurrentNumber: number, rightCurrentNumber: number ): Node {

    // create the base, which sits below the block stacks
    const baseNode = new Rectangle( 0, 0, SIDE_LENGTH * 2 + PADDING, 1.25, {
      fill: 'black'
    } );

    const leftBlocks: Node[] = [];
    const rightBlocks: Node[] = [];

    // create and add the left blocks
    _.times( leftCurrentNumber, () => {
      leftBlocks.push( new Rectangle( 0, 0, SIDE_LENGTH, SIDE_LENGTH, {
        fill: NumberCompareColors.purpleHighlightColorProperty
      } ) );
    } );
    const leftStack = new VBox( {
      children: leftBlocks,
      spacing: PADDING,
      excludeInvisibleChildrenFromBounds: false,
      left: baseNode.left,
      bottom: baseNode.top - PADDING
    } );

    // create and add the right blocks
    _.times( rightCurrentNumber, () => {
      rightBlocks.push( new Rectangle( 0, 0, SIDE_LENGTH, SIDE_LENGTH, {
        fill: NumberCompareColors.orangeHighlightColorProperty
      } ) );
    } );
    const rightStack = new VBox( {
      children: rightBlocks,
      spacing: PADDING,
      excludeInvisibleChildrenFromBounds: false,
      right: baseNode.right,
      bottom: baseNode.top - PADDING
    } );

    return new Node( {
      children: [ leftStack, rightStack, baseNode ]
    } );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

numberCompare.register( 'BlockValuesNode', BlockValuesNode );
export default BlockValuesNode;