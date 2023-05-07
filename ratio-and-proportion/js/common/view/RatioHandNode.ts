// Copyright 2020-2023, University of Colorado Boulder

/**
 * Hand that marks the location of half of the ratio. This supports alternative input and description for controlling this ratio
 * term, left and right hands semantically, changing between a filled-in and cut-out hand, as well as displaying the interaction cues.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import ArrowKeyNode from '../../../../scenery-phet/js/keyboard/ArrowKeyNode.js';
import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
import { Color, FocusHighlightFromNode, Node, NodeOptions, Path, PathOptions, TPaint } from '../../../../scenery/js/imports.js';
import AccessibleSlider, { AccessibleSliderOptions } from '../../../../sun/js/accessibility/AccessibleSlider.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import rapConstants from '../rapConstants.js';
import CueDisplay from './CueDisplay.js';
import getKeyboardInputSnappingMapper from './getKeyboardInputSnappingMapper.js';
import RAPColors from './RAPColors.js';
import TickMarkView from './TickMarkView.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';


type SelfOptions = {
  isRight?: boolean;
  asIcon?: boolean;
};

type RatioHandNodeOptions = SelfOptions & NodeOptions & AccessibleSliderOptions;

type CreateIconOptions = {
  handColor?: Color;
  handNodeOptions?: Partial<RatioHandNodeOptions>;
};

class RatioHandNode extends AccessibleSlider( Node, 0 ) {
  private resetRatioHandNode: () => void;

  public constructor( tickMarkViewProperty: EnumerationProperty<TickMarkView>,
                      keyboardStep: number,
                      colorProperty: TPaint,
                      cueDisplayProperty: TReadOnlyProperty<CueDisplay>,
                      getIdealValue: () => number,
                      inProportionProperty: TReadOnlyProperty<boolean>,
                      providedOptions?: RatioHandNodeOptions ) {

    const shiftKeyboardStep = rapConstants.toFixed( keyboardStep * rapConstants.SHIFT_KEY_MULTIPLIER ); // eslint-disable-line bad-sim-text

    // Conserve keypresses while allowing keyboard input to access any "in-proportion" state, even if more granular than
    // the keyboard step size allows.
    const mapKeyboardInput = getKeyboardInputSnappingMapper( getIdealValue, keyboardStep, shiftKeyboardStep );

    const options = optionize<RatioHandNodeOptions, SelfOptions, RatioHandNodeOptions>()( {
      cursor: 'pointer',
      isRight: true, // right hand or left hand
      asIcon: false, // when true, no input will be attached

      // AccessibleValueHandler
      ariaOrientation: Orientation.VERTICAL,
      keyboardStep: keyboardStep,
      pageKeyboardStep: 1 / 5,
      shiftKeyboardStep: shiftKeyboardStep,

      // Because this interaction uses the keyboard, snap to the keyboard step to handle the case where the hands were
      // previously moved via mouse/touch. See https://github.com/phetsims/ratio-and-proportion/issues/156
      a11yMapValue: ( newValue: number, oldValue: number ) => {
        return mapKeyboardInput( newValue, oldValue, this.shiftKeyDown, inProportionProperty.value );
      },
      a11yDependencies: [],

      // Voicing
      voicingHintResponse: RatioAndProportionStrings.a11y.individualHandsVoicingHelpTextStringProperty,
      voicingUtterance: new Utterance( {
        alertMaximumDelay: 500 // same as ISLCObjectNode
      } )
    }, providedOptions );

    super( options );

    if ( options.asIcon ) {

      // pdomVisible still keeps this in the PDOM, only hidden. We want to completely remove its PDOM content. See https://github.com/phetsims/ratio-and-proportion/issues/444
      this.tagName = null;
    }

    const filledInHandNode = new FilledInHandPath( {
      fill: colorProperty
    } );
    const cutOutHandNode = new CutOutHandPath( {
      visible: false,
      fill: colorProperty
    } );

    const handContainer = new Node( {
      children: [ filledInHandNode, cutOutHandNode ]
    } );
    this.addChild( handContainer );

    // empirical multipliers to center hand on palm. Don't change these without altering the layout for the cue arrows too.
    handContainer.right = handContainer.width * 0.365;
    handContainer.bottom = handContainer.height * 0.54;

    assert && assert( !options.focusHighlight, 'RatioHandNode sets its own focusHighlight' );
    this.focusHighlight = new FocusHighlightFromNode( handContainer );

    // Only display the "cut-out target circles" when the tick marks are being shown
    tickMarkViewProperty.link( tickMarkView => {
      const displayCutOut = TickMarkView.displayHorizontal( tickMarkView );
      cutOutHandNode.visible = displayCutOut;
      filledInHandNode.visible = !displayCutOut;
    } );

    const rightHandFlipScale = new Vector2( ( options.isRight ? 1 : -1 ), 1 );

    const cueArrowOptions = {
      fill: RAPColors.cueArrowsProperty,
      stroke: 'black',
      headWidth: 40,
      headHeight: 20,
      tailWidth: 20
    };
    const cueArrowUp = new ArrowNode( 0, 0, 0, -40, merge( {
      bottom: handContainer.top - 20
    }, cueArrowOptions ) );
    const topCueKeyOptions = {
      bottom: cueArrowUp.bottom,
      centerX: cueArrowUp.centerX,
      scale: rightHandFlipScale // we don't want letters to be flipped
    };
    const cueArrowKeyUp = new ArrowKeyNode( 'up', topCueKeyOptions );
    const cueWKeyUp = LetterKeyNode.w( topCueKeyOptions );
    const upCue = new Node( {
      excludeInvisibleChildrenFromBounds: true,
      children: [ cueArrowUp, cueArrowKeyUp, cueWKeyUp ]
    } );

    const cueArrowDown = new ArrowNode( 0, 0, 0, 40, merge( {
      top: handContainer.bottom + 20
    }, cueArrowOptions ) );
    const bottomCueKeyOptions = {
      top: cueArrowDown.top,
      centerX: cueArrowDown.centerX,
      scale: rightHandFlipScale
    };
    const cueArrowKeyDown = new ArrowKeyNode( 'down', bottomCueKeyOptions );
    const cueSKeyDown = LetterKeyNode.s( bottomCueKeyOptions );
    const downCue = new Node( {
      excludeInvisibleChildrenFromBounds: true,
      children: [ cueArrowDown, cueArrowKeyDown, cueSKeyDown ]
    } );

    this.addChild( upCue );
    this.addChild( downCue );

    cueDisplayProperty.link( cueDisplay => {
      cueArrowUp.visible = cueArrowDown.visible = cueDisplay === CueDisplay.ARROWS;
      cueArrowKeyUp.visible = cueArrowKeyDown.visible = cueDisplay === CueDisplay.UP_DOWN;
      cueWKeyUp.visible = cueSKeyDown.visible = cueDisplay === CueDisplay.W_S;
    } );

    // Flip the hand if it isn't a right hand. Do this after the circle/hand relative positioning
    this.scale( rightHandFlipScale );

    // This .1 is to offset the centering of the white circle, it is empirically determined.
    upCue.centerX = downCue.centerX = this.centerX + ( options.isRight ? 1 : -1 ) * this.width * 0.1;

    const areaBounds = handContainer.bounds.dilatedXY( handContainer.width * 0.2, handContainer.height * 0.2 );
    this.touchArea = areaBounds;
    this.mouseArea = areaBounds;

    // reset remainder when unfocused
    this.addInputListener( {
      blur: () => mapKeyboardInput.reset(),
      down: () => mapKeyboardInput.reset()
    } );

    this.resetRatioHandNode = () => mapKeyboardInput.reset();
  }

  /**
   * Call to reset input characteristics for alternative input. See
   * https://github.com/phetsims/ratio-and-proportion/issues/175#issuecomment-729292704
   */
  public override reset(): void {
    this.resetRatioHandNode();
  }

  public static createIcon( isRight: boolean, tickMarkViewProperty: EnumerationProperty<TickMarkView>, providedOptions?: CreateIconOptions ): Node {

    const options = optionize<CreateIconOptions, StrictOmit<CreateIconOptions, 'handNodeOptions'>, CreateIconOptions>()( {
      handColor: Color.BLACK,
      handNodeOptions: {
        valueProperty: new Property( 0 ),
        enabledRangeProperty: new Property( new Range( 0, 1 ) ),
        tandem: Tandem.OPT_OUT,
        isRight: isRight,
        asIcon: true,
        pickable: false
      }
    }, providedOptions );

    const ratioHandNode = new RatioHandNode(
      tickMarkViewProperty,
      1,
      new Property( options.handColor ),
      new Property( CueDisplay.NONE ),
      () => -1,
      new Property<boolean>( false ),
      options.handNodeOptions as RatioHandNodeOptions );

    return new Node( {
      children: [ ratioHandNode ]
    } );
  }
}

class FilledInHandPath extends Path {

  public constructor( providedOptions?: PathOptions ) {

    const options = optionize<PathOptions, EmptySelfOptions>()( {
      stroke: 'black',
      lineWidth: 2
    }, providedOptions );

    const shape = `M27.654,1.738c-0.716-0.716-1.572-1.075-2.57-1.075c-1,0-1.856,0.359-2.572,1.075c-0.717,0.717-1.074,1.573-1.074,2.571
v21.354h-1.041V8.477c0-0.998-0.359-1.856-1.075-2.572c-0.717-0.715-1.573-1.073-2.571-1.073c-0.999,0-1.856,0.358-2.572,1.073
c-0.715,0.717-1.073,1.574-1.073,2.572v17.188v8.334l-5.013-6.674c-0.825-1.106-1.933-1.66-3.321-1.66
c-1.15,0-2.132,0.406-2.945,1.221c-0.814,0.813-1.222,1.796-1.222,2.945c0,0.934,0.282,1.769,0.847,2.507l12.5,16.667
c0.825,1.107,2.96,3.442,6.249,4.425c7.18,2.147,11.243,1.665,15.685,0.211c3.871-1.267,4.833-2.464,6.875-5.514
c1.932-2.887,2.112-9.526,2.475-13.186c0.069-0.698,0.162-1.334,0.162-1.92v-16.21c0-0.998-0.358-1.856-1.073-2.572
c-0.717-0.717-1.574-1.073-2.572-1.073c-0.998,0-1.855,0.357-2.571,1.073c-0.717,0.716-1.075,1.574-1.075,2.572v8.854h-1.042V8.477
c0-0.998-0.356-1.856-1.073-2.572c-0.717-0.715-1.574-1.073-2.572-1.073c-0.998,0-1.854,0.358-2.571,1.073
c-0.716,0.717-1.074,1.574-1.074,2.572v17.188h-1.041V4.31C28.729,3.311,28.371,2.455,27.654,1.738z`;

    super( shape, options );
  }
}

class CutOutHandPath extends Path {

  public constructor( providedOptions?: PathOptions ) {

    const options = optionize<PathOptions, EmptySelfOptions>()( {
      stroke: 'black',
      lineWidth: 2
    }, providedOptions );

    const shape = `M44.323,14.238c-0.717-0.717-1.574-1.073-2.572-1.073s-1.855,0.357-2.571,1.073c-0.717,0.716-1.075,1.574-1.075,2.572v3.138
c-0.31-0.476-0.661-0.921-1.042-1.34V8.477c0-0.998-0.356-1.856-1.073-2.573c-0.717-0.715-1.574-1.073-2.572-1.073
s-1.854,0.358-2.571,1.073c-0.716,0.717-1.074,1.574-1.074,2.573v6.71c-0.155-0.007-0.307-0.023-0.464-0.023
c-0.195,0-0.385,0.019-0.577,0.029V4.31c0-0.998-0.358-1.854-1.075-2.571c-0.716-0.716-1.572-1.075-2.57-1.075
c-1,0-1.856,0.359-2.572,1.075c-0.717,0.717-1.074,1.573-1.074,2.571v14.425c-0.385,0.437-0.732,0.904-1.041,1.4V8.477
c0-0.998-0.359-1.856-1.075-2.573c-0.717-0.715-1.573-1.073-2.571-1.073c-0.999,0-1.855,0.358-2.572,1.073
c-0.715,0.717-1.073,1.574-1.073,2.573v17.188v8.334l-5.013-6.674c-0.825-1.106-1.934-1.66-3.321-1.66
c-1.15,0-2.132,0.406-2.945,1.221c-0.814,0.813-1.222,1.796-1.222,2.945c0,0.934,0.282,1.769,0.847,2.507l12.5,16.667
c0.825,1.107,2.96,3.442,6.249,4.425c7.18,2.147,11.243,1.665,15.686,0.211c3.871-1.267,4.833-2.463,6.875-5.514
c1.932-2.887,2.112-9.526,2.475-13.186c0.069-0.698,0.162-1.334,0.162-1.92v-16.21C45.396,15.812,45.038,14.954,44.323,14.238z
 M38.807,25.663c0,5.238-4.262,9.5-9.5,9.5s-9.5-4.262-9.5-9.5s4.262-9.5,9.5-9.5S38.807,20.425,38.807,25.663z`;

    super( shape, options );
  }
}

ratioAndProportion.register( 'RatioHandNode', RatioHandNode );
export default RatioHandNode;