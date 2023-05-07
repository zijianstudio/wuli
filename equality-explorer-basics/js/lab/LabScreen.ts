// Copyright 2018-2022, University of Colorado Boulder

/**
 * The 'Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import square_png from '../../../equality-explorer/images/square_png.js';
import EqualityExplorerColors from '../../../equality-explorer/js/common/EqualityExplorerColors.js';
import EqualityExplorerScreen, { EqualityExplorerScreenOptions } from '../../../equality-explorer/js/common/EqualityExplorerScreen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { HBox, Image, Text } from '../../../scenery/js/imports.js';
import NumberPicker from '../../../sun/js/NumberPicker.js';
import equalityExplorerBasics from '../equalityExplorerBasics.js';
import EqualityExplorerBasicsStrings from '../EqualityExplorerBasicsStrings.js';
import LabModel from './model/LabModel.js';
import LabScreenView from './view/LabScreenView.js';

// constants
const BACKGROUND_COLOR = EqualityExplorerColors.BASICS_SCREEN_BACKGROUND;

type SelfOptions = EmptySelfOptions;

type LabScreenOptions = SelfOptions & PickRequired<EqualityExplorerScreenOptions, 'tandem'>;

export default class LabScreen extends EqualityExplorerScreen<LabModel, LabScreenView> {

  public constructor( providedOptions: LabScreenOptions ) {

    const options = optionize<LabScreenOptions, SelfOptions, EqualityExplorerScreenOptions>()( {

      // EqualityExplorerScreenOptions
      name: EqualityExplorerBasicsStrings.screen.labStringProperty,
      backgroundColorProperty: new Property( BACKGROUND_COLOR ),
      homeScreenIcon: createScreenIcon()
    }, providedOptions );

    super(
      () => new LabModel( options.tandem.createTandem( 'model' ) ),
      model => new LabScreenView( model, options.tandem.createTandem( 'view' ) ),
      options
    );
  }
}

/**
 * Creates the icon for this screen: square = picker
 */
function createScreenIcon(): ScreenIcon {

  const squareNode = new Image( square_png, {
    scale: 0.75
  } );

  const equalsText = new Text( MathSymbols.EQUAL_TO, {
    font: new PhetFont( { size: 30, weight: 'bold' } )
  } );

  const pickerNode = new NumberPicker( new Property( 7 ), new Property( new Range( 0, 10 ) ), {
    color: 'black'
  } );

  const iconNode = new HBox( {
    spacing: 5,
    children: [ squareNode, equalsText, pickerNode ]
  } );

  return new ScreenIcon( iconNode, {
    maxIconWidthProportion: 0.8,
    fill: BACKGROUND_COLOR
  } );
}

equalityExplorerBasics.register( 'LabScreen', LabScreen );