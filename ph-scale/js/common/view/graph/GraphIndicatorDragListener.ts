// Copyright 2014-2022, University of Colorado Boulder

/**
 * Drag handler for the interactive graph indicators.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../../dot/js/Utils.js';
import ScientificNotationNode from '../../../../../scenery-phet/js/ScientificNotationNode.js';
import { DragListener, Node } from '../../../../../scenery/js/imports.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import phScale from '../../../phScale.js';
import PHScaleConstants from '../../PHScaleConstants.js';
import GraphUnits from './GraphUnits.js';
import { ConcentrationValue, PHValue } from '../../model/PHModel.js';
import Property from '../../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';

export default class GraphIndicatorDragListener extends DragListener {

  /**
   * @param targetNode
   * @param pHProperty - pH of the solution
   * @param totalVolumeProperty - volume of the solution
   * @param graphUnitsProperty
   * @param yToValue - converts a y view coordinate to a model value
   * @param concentrationToPH - converts concentration to pH
   * @param molesToPH - converts moles + volume to pH
   * @param startCallback - called when drag starts
   * @param tandem
   */
  public constructor( targetNode: Node,
                      pHProperty: Property<number>,
                      totalVolumeProperty: TReadOnlyProperty<number>,
                      graphUnitsProperty: EnumerationProperty<GraphUnits>,
                      yToValue: ( y: number ) => number,
                      concentrationToPH: ( concentration: ConcentrationValue ) => PHValue,
                      molesToPH: ( moles: number, volume: number ) => PHValue,
                      startCallback: () => void,
                      tandem: Tandem ) {

    let clickYOffset: number; // y-offset between initial click and indicator's origin

    super( {

      allowTouchSnag: true,

      // Record the offset between the pointer and the indicator's origin.
      start: event => {
        startCallback();
        clickYOffset = targetNode.globalToParentPoint( event.pointer.point ).y - targetNode.y;
      },

      // When the indicator is dragged, create a custom solute that corresponds to the new pH.
      drag: event => {

        // Adjust the y-coordinate for the offset between the pointer and the indicator's origin
        const yView = targetNode.globalToParentPoint( event.pointer.point ).y - clickYOffset;

        GraphIndicatorDragListener.doDrag( yView, targetNode, pHProperty, totalVolumeProperty.value,
          graphUnitsProperty.value, yToValue, concentrationToPH, molesToPH );
      },

      // phet-io
      tandem: tandem
    } );
  }

  /**
   * When the indicator is dragged, create a custom solute that corresponds to the new pH.
   * This is used by both GraphIndicatorDragListener and GraphIndicatorKeyboardDragListener.
   */
  public static doDrag( yView: number,
                        targetNode: Node,
                        pHProperty: Property<number>,
                        totalVolume: number,
                        graphUnits: GraphUnits,
                        yToValue: ( y: number ) => number,
                        concentrationToPH: ( concentration: ConcentrationValue ) => PHValue,
                        molesToPH: ( moles: number, volume: number ) => PHValue ): void {

    // If the solution volume is zero (empty beaker), then we have no solution, and therefore no pH, so do nothing.
    if ( totalVolume !== 0 ) {

      // Convert the y-coordinate to a model value.
      const value = yToValue( yView );
      assert && assert( value > 0 );

      // Round the model value to the first 2 non-zero decimal places. This prevents continuous dragging from
      // creating values that have too much precision, which can result in pH = 7.00 with unequal amounts of
      // H3O+ and OH-. See https://github.com/phetsims/ph-scale/issues/225.
      const scientificNotation = ScientificNotationNode.toScientificNotation( value, {
        mantissaDecimalPlaces: PHScaleConstants.LOGARITHMIC_MANTISSA_DECIMAL_PLACES
      } );
      const exponent = +scientificNotation.exponent - PHScaleConstants.LOGARITHMIC_MANTISSA_DECIMAL_PLACES;
      const interval = Math.pow( 10, exponent );
      let adjustedValue = Utils.roundToInterval( value, interval );

      // Workaround for https://github.com/phetsims/ph-scale/issues/225.
      // For one value (9.9e-8), the precision of what we're displaying results in a situation where we have
      // different concentrations of H3O+ and OH-, but are displaying a neutral pH of 7.00.  So we decided
      // that it was preferable to avoid that value, and snap to the concentration (1.0e-7) that results in
      // a neutral solution.
      const isConcentration = ( graphUnits === GraphUnits.MOLES_PER_LITER );
      if ( isConcentration && adjustedValue === 9.9e-8 ) {
        adjustedValue = 1.0e-7;
      }

      // Map the model value to pH, depending on which units we're using.
      let pH = isConcentration ? concentrationToPH( adjustedValue ) : molesToPH( adjustedValue, totalVolume );

      // Constrain the pH to the valid range
      assert && assert( pH !== null, 'pH is not expected to be null here, because we checked that totalVolume !== 0 above' );
      pH = Utils.clamp( pH!, PHScaleConstants.PH_RANGE.min, PHScaleConstants.PH_RANGE.max );

      phet.log && phet.log( `value=${value} adjustedValue=${adjustedValue} pH=${pH}` );

      // Set the solution's pH
      pHProperty.value = pH;
    }
  }
}

phScale.register( 'GraphIndicatorDragListener', GraphIndicatorDragListener );