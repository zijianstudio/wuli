// Copyright 2022, University of Colorado Boulder

/**
 * Keyboard drag handler for the interactive graph indicators.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { KeyboardDragListener, Node } from '../../../../../scenery/js/imports.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import phScale from '../../../phScale.js';
import GraphUnits from './GraphUnits.js';
import { ConcentrationValue, PHValue } from '../../model/PHModel.js';
import Property from '../../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import GraphIndicatorDragListener from './GraphIndicatorDragListener.js';

export default class GraphIndicatorKeyboardDragListener extends KeyboardDragListener {

  /**
   * @param targetNode
   * @param pHProperty - pH of the solution
   * @param totalVolumeProperty - volume of the solution
   * @param graphUnitsProperty
   * @param yToValue - converts a y view coordinate to a model value
   * @param concentrationToPH - converts concentration to pH
   * @param molesToPH - converts moles + volume to pH
   * @param tandem
   */
  public constructor( targetNode: Node,
                      pHProperty: Property<number>,
                      totalVolumeProperty: TReadOnlyProperty<number>,
                      graphUnitsProperty: EnumerationProperty<GraphUnits>,
                      yToValue: ( y: number ) => number,
                      concentrationToPH: ( concentration: ConcentrationValue ) => PHValue,
                      molesToPH: ( moles: number, volume: number ) => PHValue,
                      tandem: Tandem ) {
    super( {
      keyboardDragDirection: 'upDown', // constrained to vertical dragging
      drag: viewDelta => GraphIndicatorDragListener.doDrag( targetNode.y + viewDelta.y, targetNode, pHProperty,
        totalVolumeProperty.value, graphUnitsProperty.value, yToValue, concentrationToPH, molesToPH ),

      // Velocity of the Node being dragged, in view coordinates per second.
      dragVelocity: 300,

      // Velocity with the Shift key pressed, typically slower than dragVelocity.
      // Careful! If this value is too small, the indicator will not move, due to the precision of the value.
      shiftDragVelocity: 40,
      tandem: tandem
    } );
  }
}

phScale.register( 'GraphIndicatorKeyboardDragListener', GraphIndicatorKeyboardDragListener );