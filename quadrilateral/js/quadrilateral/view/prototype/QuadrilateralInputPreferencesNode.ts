// Copyright 2022-2023, University of Colorado Boulder

/**
 * Input Preferences specific to this simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../../quadrilateral.js';
import NumberControl, { NumberControlOptions } from '../../../../../scenery-phet/js/NumberControl.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import PreferencesPanelSection from '../../../../../joist/js/preferences/PreferencesPanelSection.js';
import { Text, VBox } from '../../../../../scenery/js/imports.js';
import PreferencesDialog from '../../../../../joist/js/preferences/PreferencesDialog.js';
import QuadrilateralTangibleOptionsModel from '../../model/prototype/QuadrilateralTangibleOptionsModel.js';

export default class QuadrilateralInputPreferencesNode extends PreferencesPanelSection {
  private readonly disposeQuadrilateralInputPreferencesNode: () => void;

  public constructor( tangibleOptionsModel: QuadrilateralTangibleOptionsModel ) {

    // Controls specifically for tangible connection
    const tangibleControlsTitle = new Text( 'Tangible Controls', PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const gridSpacingNumberControl = new TangiblePropertyNumberControl( 'Position interval', tangibleOptionsModel.deviceGridSpacingProperty, {
      numberDisplayOptions: {
        decimalPlaces: 4
      }
    } );
    const smoothingLengthNumberControl = new TangiblePropertyNumberControl( 'Smoothing length', tangibleOptionsModel.smoothingLengthProperty );
    const updateIntervalNumberControl = new TangiblePropertyNumberControl( 'Update interval', tangibleOptionsModel.bluetoothUpdateIntervalProperty, {
      numberDisplayOptions: {
        decimalPlaces: 1
      },
      delta: 0.1
    } );

    const content = new VBox( {
      children: [ gridSpacingNumberControl, smoothingLengthNumberControl, updateIntervalNumberControl ],
      spacing: PreferencesDialog.CONTENT_SPACING
    } );

    super( {
      titleNode: tangibleControlsTitle,
      contentNode: content,

      // margin doesn't make sense for this list of controls
      contentLeftMargin: 0
    } );

    this.disposeQuadrilateralInputPreferencesNode = () => {
      tangibleControlsTitle.dispose();
      gridSpacingNumberControl.dispose();
      smoothingLengthNumberControl.dispose();
      updateIntervalNumberControl.dispose();
    };
  }

  public override dispose(): void {
    this.disposeQuadrilateralInputPreferencesNode();
    super.dispose();
  }

}

/**
 * Inner class, reusable NumberControl with default options for the purposes of this Preferences dialog content.
 */
class TangiblePropertyNumberControl extends NumberControl {
  public constructor( label: string, property: NumberProperty, providedOptions?: NumberControlOptions ) {
    const propertyRange = property.range;

    const options = optionize<NumberControlOptions, EmptySelfOptions, NumberControlOptions>()( {
      delta: propertyRange.min,

      // opt out of tandems for these preferences because NumberControl requires phet.joist.sim and these
      // controls are created before the sim
      tandem: Tandem.OPT_OUT
    }, providedOptions );

    super( label, property, propertyRange, options );
  }
}

quadrilateral.register( 'QuadrilateralInputPreferencesNode', QuadrilateralInputPreferencesNode );
