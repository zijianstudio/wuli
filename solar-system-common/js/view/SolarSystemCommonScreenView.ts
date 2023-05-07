// Copyright 2023, University of Colorado Boulder

/**
 * Screen view for the My Solar System Screen
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Multilink from '../../../axon/js/Multilink.js';
import ScreenView, { ScreenViewOptions } from '../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import { HBox, Node, TextOptions, VBox } from '../../../scenery/js/imports.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonTimeControlNode from './SolarSystemCommonTimeControlNode.js';
import TextPushButton from '../../../sun/js/buttons/TextPushButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import SolarSystemCommonModel from '../model/SolarSystemCommonModel.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import Property from '../../../axon/js/Property.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import Body from '../model/Body.js';
import DraggableVectorNode, { DraggableVectorNodeOptions } from './DraggableVectorNode.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import NumberDisplay from '../../../scenery-phet/js/NumberDisplay.js';
import Panel from '../../../sun/js/Panel.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../dot/js/Range.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import solarSystemCommon from '../solarSystemCommon.js';
import BodySoundManager from './BodySoundManager.js';
import GridNode from '../../../scenery-phet/js/GridNode.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Grab_Sound_mp3 from '../../sounds/Grab_Sound_mp3.js';
import Release_Sound_mp3 from '../../sounds/Release_Sound_mp3.js';


type SelfOptions = {
  playingAllowedProperty?: TReadOnlyProperty<boolean>;
  centerOrbitOffset?: Vector2;
};

export type SolarSystemCommonScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class SolarSystemCommonScreenView extends ScreenView {
  protected readonly bodiesLayer = new Node();
  protected readonly componentsLayer = new Node();
  protected readonly interfaceLayer = new Node();
  protected readonly topLayer = new Node();
  protected readonly bottomLayer = new Node();

  protected readonly timeBox: Panel;

  protected readonly bodySoundManager: BodySoundManager;

  protected readonly createDraggableVectorNode: ( body: Body, options?: DraggableVectorNodeOptions ) => DraggableVectorNode;

  protected readonly modelViewTransformProperty: ReadOnlyProperty<ModelViewTransform2>;

  // Derived from visibleBoundsProperty to keep the UI elements centered on narrow screens
  // Tracks only the vertical bounds and constrains them to layoutBounds
  protected readonly availableBoundsProperty: TReadOnlyProperty<Bounds2>;

  protected readonly resetAllButton: ResetAllButton;

  public constructor( public readonly model: SolarSystemCommonModel, providedOptions: SolarSystemCommonScreenViewOptions ) {

    const options = optionize<SolarSystemCommonScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      playingAllowedProperty: new Property( true ),

      centerOrbitOffset: Vector2.ZERO
    }, providedOptions );

    super( options );

    this.availableBoundsProperty = new DerivedProperty(
      [ this.visibleBoundsProperty ],
      visibleBounds => {
        return visibleBounds.withMinY( this.layoutBounds.minY ).withMaxY( this.layoutBounds.maxY );
      }
    );

    this.addChild( this.bottomLayer );
    this.addChild( this.bodiesLayer );
    this.addChild( this.componentsLayer );
    this.addChild( this.interfaceLayer );
    this.addChild( this.topLayer );

    this.pdomPlayAreaNode.pdomOrder = [
      this.bodiesLayer,
      this.componentsLayer,
      this.topLayer
    ];

    this.pdomControlAreaNode.pdomOrder = [
      this.bottomLayer,
      this.interfaceLayer
    ];

    this.bodySoundManager = new BodySoundManager( model );
    model.availableBodies.forEach( body => {
      body.collidedEmitter.addListener( () => {
        this.bodySoundManager.playBodyRemovedSound( 3 ); // Plays the collision sound instead of body index
      } );
    } );

    this.modelViewTransformProperty = new DerivedProperty(
      [ model.zoomProperty ],
      zoom => {
        return ModelViewTransform2.createSinglePointScaleInvertedYMapping(
          Vector2.ZERO,
          new Vector2(
            this.layoutBounds.center.x - options.centerOrbitOffset.x,
            this.layoutBounds.center.y - options.centerOrbitOffset.y ),
          zoom );
      } );

    // Add the node for the overlay grid, setting its visibility based on the model.showGridProperty
    this.interfaceLayer.addChild( new GridNode(
      this.modelViewTransformProperty,
      SolarSystemCommonConstants.GRID_SPACING,
      Vector2.ZERO,
      100,
      {
        stroke: SolarSystemCommonColors.gridIconStrokeColorProperty,
        visibleProperty: model.gridVisibleProperty
      } ) );

    this.createDraggableVectorNode = ( body: Body, options?: DraggableVectorNodeOptions ) => {
      return new DraggableVectorNode(
        body,
        this.modelViewTransformProperty,
        model.velocityVisibleProperty,
        body.velocityProperty,
        body.positionProperty,
        1,
        SolarSystemCommonStrings.VStringProperty,
        combineOptions<DraggableVectorNodeOptions>( {
          fill: PhetColorScheme.VELOCITY,
          soundViewNode: this,
          mapPosition: this.constrainBoundaryViewPoint.bind( this )
        }, options )
      );
    };

    // UI Elements ===================================================================================================

    const measuringTapeUnitsProperty = new Property( { name: 'AU', multiplier: 0.01 } );

    const dragClipOptions = {
      initialOutputLevel: 2 * SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    };
    const grabClip = new SoundClip( Grab_Sound_mp3, dragClipOptions );
    const releaseClip = new SoundClip( Release_Sound_mp3, dragClipOptions );
    soundManager.addSoundGenerator( grabClip );
    soundManager.addSoundGenerator( releaseClip );

    // Add the MeasuringTapeNode
    const measuringTapeNode = new MeasuringTapeNode( measuringTapeUnitsProperty, {
      visibleProperty: model.measuringTapeVisibleProperty,
      textColor: 'black',
      textBackgroundColor: 'rgba( 255, 255, 255, 0.5 )', // translucent red
      textBackgroundXMargin: 10,
      textBackgroundYMargin: 3,
      textBackgroundCornerRadius: 5,
      basePositionProperty: new Vector2Property( new Vector2( 0, 100 ) ),
      tipPositionProperty: new Vector2Property( new Vector2( 100, 100 ) ),
      tandem: providedOptions.tandem.createTandem( 'measuringTapeNode' ),
      significantFigures: 2,
      baseDragStarted: () => grabClip.play(),
      baseDragEnded: () => releaseClip.play()
    } );
    this.topLayer.addChild( measuringTapeNode );


    const timeControlNode = new SolarSystemCommonTimeControlNode( model,
      {
        enabledProperty: options.playingAllowedProperty || null,
        restartListener: () => model.restart(),
        stepForwardListener: () => model.stepOnce( 1 / 8 ),
        tandem: options.tandem.createTandem( 'timeControlNode' )
      } );

    const timeStringPatternProperty = new PatternStringProperty( SolarSystemCommonStrings.pattern.labelUnitsStringProperty, {
      units: SolarSystemCommonStrings.units.yearsStringProperty
    } );

    const clockNode = new HBox( {
      children: [
        new NumberDisplay( model.timeProperty, new Range( 0, 1000 ), {
          backgroundFill: null,
          backgroundStroke: null,
          textOptions: combineOptions<TextOptions>( {
            maxWidth: 80
          }, SolarSystemCommonConstants.TEXT_OPTIONS ),
          xMargin: 0,
          yMargin: 0,
          valuePattern: timeStringPatternProperty,
          decimalPlaces: 1
        } ),
        new TextPushButton( SolarSystemCommonStrings.clearStringProperty, {
          font: new PhetFont( 16 ),
          enabledProperty: new DerivedProperty( [ model.timeProperty ], time => time > 0 ),
          listener: () => model.timeProperty.reset(),
          maxTextWidth: 65,
          tandem: providedOptions.tandem.createTandem( 'clearButton' ),
          touchAreaXDilation: 10,
          touchAreaYDilation: 5
        } )
      ],
      spacing: 8
    } );

    this.timeBox = new Panel( new VBox( {
      children: [ timeControlNode, clockNode ],
      spacing: 10
    } ), SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS );

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        measuringTapeNode.reset();
      },
      touchAreaDilation: 10,
      tandem: providedOptions.tandem.createTandem( 'resetAllButton' )
    } );

    Multilink.multilink(
      [ this.visibleBoundsProperty, this.modelViewTransformProperty ],
      ( visibleBounds, modelViewTransform ) => {
        measuringTapeNode.setDragBounds( modelViewTransform.viewToModelBounds( visibleBounds.eroded( 50 ) ) );
        measuringTapeNode.modelViewTransformProperty.value = modelViewTransform;
      }
    );
  }

  public constrainBoundaryViewPoint( point: Vector2, radius: number ): Vector2 {
    return point;
  }
}

solarSystemCommon.register( 'SolarSystemCommonScreenView', SolarSystemCommonScreenView );