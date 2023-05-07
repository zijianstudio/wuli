// Copyright 2018-2021, University of Colorado Boulder

/**
 * Model for the "Lab" screen of Build a Fraction
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import BuildingModel from '../../building/model/BuildingModel.js';
import BuildingRepresentation from '../../building/model/BuildingRepresentation.js';
import NumberGroup from '../../building/model/NumberGroup.js';
import NumberGroupStack from '../../building/model/NumberGroupStack.js';
import NumberPiece from '../../building/model/NumberPiece.js';
import NumberStack from '../../building/model/NumberStack.js';
import ShapeGroup from '../../building/model/ShapeGroup.js';
import ShapeGroupStack from '../../building/model/ShapeGroupStack.js';
import ShapePiece from '../../building/model/ShapePiece.js';
import ShapeStack from '../../building/model/ShapeStack.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';

// constants
const PIECE_LAYOUT_QUANTITY = 2;
const GROUP_LAYOUT_QUANTITY = 1;

class BuildingLabModel extends BuildingModel {
  /**
   * @param {boolean} allowMixedNumbers
   */
  constructor( allowMixedNumbers ) {
    super();

    // @public {boolean}
    this.allowMixedNumbers = allowMixedNumbers;

    // @public {Property.<BuildingRepresentation>}
    this.topRepresentationProperty = new Property( BuildingRepresentation.PIE );

    // Shape stacks
    [
      { representation: BuildingRepresentation.PIE, color: FractionsCommonColors.labPieFillProperty },
      { representation: BuildingRepresentation.BAR, color: FractionsCommonColors.labBarFillProperty }
    ].forEach( ( { representation, color } ) => {
      _.range( 1, 9 ).forEach( denominator => {
        const stack = new ShapeStack( new Fraction( 1, denominator ), PIECE_LAYOUT_QUANTITY, representation, color, false );
        stack.shapePieces.push( new ShapePiece( new Fraction( 1, denominator ), representation, color ) );
        stack.shapePieces.push( new ShapePiece( new Fraction( 1, denominator ), representation, color ) );
        this.shapeStacks.push( stack );
      } );
    } );

    // Number stacks
    _.range( 1, 9 ).forEach( number => {
      const stack = new NumberStack( number, PIECE_LAYOUT_QUANTITY, false );
      stack.numberPieces.push( new NumberPiece( number ) );
      stack.numberPieces.push( new NumberPiece( number ) );
      this.numberStacks.push( stack );
    } );

    // Non-mutable stacks
    this.shapeGroupStacks.push( new ShapeGroupStack( GROUP_LAYOUT_QUANTITY, BuildingRepresentation.PIE, true, false ) );
    this.shapeGroupStacks.push( new ShapeGroupStack( GROUP_LAYOUT_QUANTITY, BuildingRepresentation.BAR, true, false ) );
    this.numberGroupStacks.push( new NumberGroupStack( GROUP_LAYOUT_QUANTITY, false, false ) );
    this.numberGroupStacks.push( new NumberGroupStack( GROUP_LAYOUT_QUANTITY, true, false ) );

    // Add initial stacks
    this.shapeGroupStacks.forEach( shapeGroupStack => {
      shapeGroupStack.shapeGroups.push( new ShapeGroup( shapeGroupStack.representation ) );
    } );
    this.numberGroupStacks.forEach( numberGroupStack => {
      numberGroupStack.numberGroups.push( new NumberGroup( numberGroupStack.isMixedNumber ) );
    } );

    // Shared to set up some initial state
    this.reset();
  }

  /**
   * Returns the index to which pieces should animate to in the shape stack.
   * @protected
   * @override
   *
   * @param {ShapeStack} shapeStack
   * @returns {number}
   */
  getShapeStackIndex( shapeStack ) {
    return 1;
  }

  /**
   * Returns the index to which pieces should animate to in the number stack.
   * @protected
   * @override
   *
   * @param {NumberStack} numberStack
   * @returns {number}
   */
  getNumberStackIndex( numberStack ) {
    return 1;
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.topRepresentationProperty.reset();

    super.reset();

    // Initial state
    const shapeGroup = this.addShapeGroup( BuildingRepresentation.PIE );
    shapeGroup.positionProperty.value = new Vector2( 170, 0 );
    this.selectedGroupProperty.value = shapeGroup;

    const numberGroup = this.addNumberGroup( this.allowMixedNumbers );
    numberGroup.positionProperty.value = new Vector2( -170, 0 );
  }
}

fractionsCommon.register( 'BuildingLabModel', BuildingLabModel );
export default BuildingLabModel;