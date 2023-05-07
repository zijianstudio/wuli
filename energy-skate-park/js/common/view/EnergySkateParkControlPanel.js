// Copyright 2013-2022, University of Colorado Boulder

/**
 * Scenery node for the control panel, with view settings and controls. The control panel may or may not include various controls
 * depending on options, but the order of included controls is always the same.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { HSeparator, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import EnergySkateParkGravityControls from './EnergySkateParkGravityControls.js';
import EnergySkateParkMassControls from './EnergySkateParkMassControls.js';
import EnergySkateParkVisibilityControls from './EnergySkateParkVisibilityControls.js';
import FrictionSlider from './FrictionSlider.js';
import SceneSelectionRadioButtonGroup from './SceneSelectionRadioButtonGroup.js';
import SkaterImages from './SkaterImages.js';
import SkaterRadioButtonGroup from './SkaterRadioButtonGroup.js';

class EnergySkateParkControlPanel extends Panel {

  /**
   * @param {EnergySkateParkModel} model
   * @param {EnergySkateParkScreenView} screenView
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, screenView, tandem, options ) {

    options = merge( {

      // {boolean} whether or not controls will include radio buttons to change active track
      showTrackButtons: true,

      // {boolean} whether or not controls to include a friction slider will be included in this sim
      showFrictionControls: true,

      // {boolean} whether or not gravity controls will be included in this control panel
      showGravityControls: true,

      // {boolean} whether or not mass controls will be included in this control panel
      showMassControls: true,

      // {boolean} whether or not to include radio buttons that control the skater in energy skate park.
      showSkaterControls: true,

      // {Object|null} options passed along to the EnergySkateParkVisibilityControls
      visibilityControlsOptions: null,

      // {Object|null} options passed on to EnergySkateParkGravityControls - only relevant if showGravityControls
      // is true
      gravityControlsOptions: null,

      // {Object|null} options passed to EnergySkateParkMassControls - only relevant if showMassControls is true
      massControlsOptions: null

    }, options );

    const userControlledPropertySet = model.userControlledPropertySet;

    // all contents of the control panel will be added to this array
    const children = [];

    let trackRadioButtons = null;
    if ( options.showTrackButtons ) {
      trackRadioButtons = new SceneSelectionRadioButtonGroup( model, screenView, tandem.createTandem( 'sceneSelectionRadioButtonGroup' ) );
      children.push( trackRadioButtons );
    }

    let frictionControls = null;
    if ( options.showFrictionControls ) {

      // TODO: https://github.com/phetsims/energy-skate-park/issues/344 rename the class, perhaps up the hierarchy
      frictionControls = new FrictionSlider( model.frictionProperty, userControlledPropertySet.frictionControlledProperty, tandem.createTandem( 'frictionControl' ) );
      children.push( frictionControls );
    }

    let gravityControls = null;
    if ( options.showGravityControls ) {
      gravityControls = new EnergySkateParkGravityControls( model.skater.gravityMagnitudeProperty, userControlledPropertySet.gravityControlledProperty, model.preferencesModel.accelerationUnitsProperty, model.resetEmitter, screenView, tandem.createTandem( 'energySkateParkGravityControls' ), options.gravityControlsOptions );
      children.push( gravityControls );
    }

    let massControls = null;
    if ( options.showMassControls ) {
      massControls = new EnergySkateParkMassControls( model.skater.massProperty, userControlledPropertySet.massControlledProperty, model.skater.massRange, screenView.skaterNode.skaterImageSetProperty, model.resetEmitter, screenView, tandem.createTandem( 'energySkateParkMassControls' ), options.massControlsOptions );
      children.push( massControls );
    }

    if ( options.showSkaterControls ) {

      // The set of characters for this control can change. Instead of instantiating a new control we create all
      // eagerly and swap visibility.
      const characterSet1SkaterControls = new SkaterRadioButtonGroup( screenView.skaterNode.skaterImageSetProperty, SkaterImages.SKATER_CHARACTER_SETS[ 0 ], tandem.createTandem( 'skaterSetOneControls' ) );
      const characterSet2SkaterControls = new SkaterRadioButtonGroup( screenView.skaterNode.skaterImageSetProperty, SkaterImages.SKATER_CHARACTER_SETS[ 1 ], tandem.createTandem( 'skaterSetTwoControls' ) );
      const characterSet3SkaterControls = new SkaterRadioButtonGroup( screenView.skaterNode.skaterImageSetProperty, SkaterImages.SKATER_CHARACTER_SETS[ 2 ], tandem.createTandem( 'skaterSetThreeControls' ) );
      children.push( characterSet1SkaterControls );
      children.push( characterSet2SkaterControls );
      children.push( characterSet3SkaterControls );

      model.preferencesModel.skaterCharacterSetProperty.link( characterSet => {
        characterSet1SkaterControls.visible = characterSet === SkaterImages.CHARACTER_SET_1;
        characterSet2SkaterControls.visible = characterSet === SkaterImages.CHARACTER_SET_2;
        characterSet3SkaterControls.visible = characterSet === SkaterImages.CHARACTER_SET_3;

        // change selected image to first in the character set
        screenView.skaterNode.skaterImageSetProperty.value = characterSet.imageSet1;
      } );
    }

    // horizontal separators added after construction of all controls so that it can match width of widest control
    const separatorWidth = _.maxBy( children, child => child.width ).width;

    // controls that change visibility of items in the screen
    options.visibilityControlsOptions = merge( {}, options.visibilityControlsOptions, {
      checkboxWidth: separatorWidth
    } );
    options.visibilityControlsOptions.checkboxWidth = separatorWidth;
    const visibilityControls = new EnergySkateParkVisibilityControls( model, tandem.createTandem( 'visibilityControls' ), options.visibilityControlsOptions );
    children.unshift( visibilityControls );

    // one separator after visibility controls
    children.splice( children.indexOf( visibilityControls ) + 1, 0, new HSeparator() );

    // one separator after scene selection buttons
    trackRadioButtons && children.splice( children.indexOf( trackRadioButtons ) + 1, 0, new HSeparator() );

    // one separator after a section for friction and/or gravity controls
    if ( frictionControls || gravityControls ) {
      if ( gravityControls ) {
        children.splice( children.indexOf( gravityControls ) + 1, 0, new HSeparator() );
      }
      else {
        children.splice( children.indexOf( frictionControls ) + 1, 0, new HSeparator() );
      }
    }

    if ( massControls ) {

      // the layout for the mass controls needs to match the layout of the above controls so that the title matches
      // position with the other NumberControls
      massControls.matchLayout( separatorWidth );
    }

    const content = new VBox( { spacing: 8, children: children } );

    super( content, merge( {
      xMargin: 5,
      yMargin: 5,
      resize: false,
      tandem: tandem
    }, EnergySkateParkConstants.PANEL_OPTIONS ) );
  }
}

energySkatePark.register( 'EnergySkateParkControlPanel', EnergySkateParkControlPanel );
export default EnergySkateParkControlPanel;