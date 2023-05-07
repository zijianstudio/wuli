// Copyright 2022-2023, University of Colorado Boulder

/**
 * Visibility controls for this simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import { VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import quadrilateral from '../../quadrilateral.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import QuadrilateralIconFactory from './QuadrilateralIconFactory.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import QuadrilateralVisibilityModel from '../model/QuadrilateralVisibilityModel.js';

type SelfOptions = EmptySelfOptions;
type QuadrilateralVisibilityControlsOptions = SelfOptions & StrictOmit<VBoxOptions, 'children'> & PickRequired<VBoxOptions, 'tandem'>;

export default class QuadrilateralVisibilityControls extends VBox {
  public constructor( visibilityModel: QuadrilateralVisibilityModel, providedOptions: QuadrilateralVisibilityControlsOptions ) {

    const options = optionize<QuadrilateralVisibilityControlsOptions, SelfOptions, VBoxOptions>()( {
      align: 'left',
      spacing: QuadrilateralConstants.CONTROLS_SPACING,

      // "stretches" the checkbox icons and their labels so that the icons align
      // as if they are in their own column
      stretch: true
    }, providedOptions );

    const cornerLabelsIcon = QuadrilateralIconFactory.createLabelledIcon(
      QuadrilateralIconFactory.createCornerLabelsIcon(),
      QuadrilateralStrings.labelsStringProperty
    );
    const cornerLabelsCheckbox = new Checkbox( visibilityModel.vertexLabelsVisibleProperty, cornerLabelsIcon, {
      spacing: QuadrilateralConstants.CONTROL_LABEL_SPACING,

      // voicing
      voicingNameResponse: QuadrilateralStrings.labelsStringProperty,
      voicingHintResponse: QuadrilateralStrings.a11y.cornerLabelsHintResponseStringProperty,

      // a11y
      checkedContextResponse: QuadrilateralStrings.a11y.cornerLabelsAddedResponseStringProperty,
      uncheckedContextResponse: QuadrilateralStrings.a11y.cornerLabelsRemovedResponseStringProperty,

      // phet-io
      tandem: options.tandem.createTandem( 'cornerLabelsCheckbox' )
    } );

    const markersIcon = QuadrilateralIconFactory.createLabelledIcon(
      QuadrilateralIconFactory.createMarkersIcon(),
      QuadrilateralStrings.markersStringProperty
    );
    const markersCheckbox = new Checkbox( visibilityModel.markersVisibleProperty, markersIcon, {
      spacing: QuadrilateralConstants.CONTROL_LABEL_SPACING,

      // voicing
      voicingNameResponse: QuadrilateralStrings.markersStringProperty,
      voicingHintResponse: QuadrilateralStrings.a11y.markersHintResponseStringProperty,

      // a11y
      checkedContextResponse: QuadrilateralStrings.a11y.markersAddedResponseStringProperty,
      uncheckedContextResponse: QuadrilateralStrings.a11y.markersRemovedResponseStringProperty,

      // phet-io
      tandem: options.tandem.createTandem( 'markersCheckbox' )
    } );

    const diagonalGuidesIcon = QuadrilateralIconFactory.createLabelledIcon(
      QuadrilateralIconFactory.createDiagonalGuidesIcon(),
      QuadrilateralStrings.diagonalsStringProperty
    );
    const diagonalGuidesCheckbox = new Checkbox( visibilityModel.diagonalGuidesVisibleProperty, diagonalGuidesIcon, {
      spacing: QuadrilateralConstants.CONTROL_LABEL_SPACING,

      // voicing
      voicingNameResponse: QuadrilateralStrings.diagonalsStringProperty,
      voicingHintResponse: QuadrilateralStrings.a11y.diagonalGuidesHintResponseStringProperty,

      // a11y
      checkedContextResponse: QuadrilateralStrings.a11y.diagonalGuidesAddedResponseStringProperty,
      uncheckedContextResponse: QuadrilateralStrings.a11y.diagonalGuidesRemovedResponseStringProperty,

      // phet-io
      tandem: options.tandem.createTandem( 'diagonalGuidesCheckbox' )
    } );

    const gridIcon = QuadrilateralIconFactory.createLabelledIcon(
      QuadrilateralIconFactory.createGridIcon(),
      QuadrilateralStrings.gridStringProperty
    );
    const gridCheckbox = new Checkbox( visibilityModel.gridVisibleProperty, gridIcon, {
      spacing: QuadrilateralConstants.CONTROL_LABEL_SPACING,

      // voicing
      voicingNameResponse: QuadrilateralStrings.gridStringProperty,
      voicingHintResponse: QuadrilateralStrings.a11y.gridLinesHintResponseStringProperty,

      // a11y
      checkedContextResponse: QuadrilateralStrings.a11y.gridLinesAddedResponseStringProperty,
      uncheckedContextResponse: QuadrilateralStrings.a11y.gridLinesRemovedResponseStringProperty,

      // phet-io
      tandem: options.tandem.createTandem( 'gridCheckbox' )
    } );

    // Order for checkboxes was requested in https://github.com/phetsims/quadrilateral/issues/213#issuecomment-1282681500
    options.children = [ markersCheckbox, gridCheckbox, diagonalGuidesCheckbox, cornerLabelsCheckbox ];

    super( options );
  }
}

quadrilateral.register( 'QuadrilateralVisibilityControls', QuadrilateralVisibilityControls );
