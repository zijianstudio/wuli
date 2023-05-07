// Copyright 2020-2023, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import LockNode from '../../../../scenery-phet/js/LockNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RAPColors from '../../common/view/RAPColors.js';
import RAPScreenView from '../../common/view/RAPScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import CreateScreenSummaryNode from './CreateScreenSummaryNode.js';
import MyChallengeAccordionBox from './MyChallengeAccordionBox.js';
import TickMarkRangeComboBoxNode from './TickMarkRangeComboBoxNode.js';
import RAPModel from '../../common/model/RAPModel.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import TickMarkDescriber from '../../common/view/describers/TickMarkDescriber.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { SpeakableResolvedResponse } from '../../../../utterance-queue/js/ResponsePacket.js';
import RectangularToggleButton from '../../../../sun/js/buttons/RectangularToggleButton.js';


class CreateScreenView extends RAPScreenView {

  private tickMarkRangeComboBoxNode: TickMarkRangeComboBoxNode;
  private resetCreateScreenView: () => void;

  // set this after the supertype has initialized the view code needed to create the screen summary
  private createScreenSummaryNode: CreateScreenSummaryNode;

  public constructor( model: RAPModel, backgroundColorProperty: Property<Color>, tandem: Tandem ) {

    // For this screen, one Property controls the color of both hands.
    const handColorProperty = RAPColors.createScreenHandProperty;

    super( model, backgroundColorProperty, {
      leftHandColorProperty: handColorProperty,
      rightHandColorProperty: handColorProperty,
      bothHandsPDOMNodeOptions: {
        gestureDescriptionHelpText: RatioAndProportionStrings.a11y.create.bothHandsGestureDescriptionHelpTextStringProperty
      },
      tandem: tandem
    } );

    const myChallengeAccordionBox = new MyChallengeAccordionBox( model.targetRatioProperty, model.ratio.lockedProperty, handColorProperty,
      this.tickMarkViewProperty, this.ratioDescriber, { tandem: tandem.createTandem( 'myChallengeAccordionBox' ) } );

    const tickMarkRangeComboBoxParent = new Node();

    this.tickMarkRangeComboBoxNode = new TickMarkRangeComboBoxNode( this.tickMarkRangeProperty,
      tickMarkRangeComboBoxParent, this.tickMarkViewProperty, {
        layoutOptions: {
          topMargin: -10,
          bottomMargin: 10
        }
      } );

    const handPositionsDescriber = new HandPositionsDescriber( model.ratio.tupleProperty,
      new TickMarkDescriber( this.tickMarkRangeProperty, this.tickMarkViewProperty ),
      model.inProportionProperty, model.ratio.enabledRatioTermsRangeProperty, model.ratio.lockedProperty );

    this.createScreenSummaryNode = new CreateScreenSummaryNode(
      model.ratioFitnessProperty,
      model.ratio.tupleProperty,
      this.tickMarkViewProperty,
      this.ratioDescriber,
      model.inProportionProperty,
      handPositionsDescriber,
      this.tickMarkRangeProperty,
      myChallengeAccordionBox
    );
    this.setScreenSummaryContent( this.createScreenSummaryNode );

    const ratioLockToggleButton = new RectangularToggleButton( model.ratio.lockedProperty, false, true, {
      content: new LockNode( model.ratio.lockedProperty, { scale: 0.4 } ),
      baseColor: 'white',

      // pdom
      // WARNING: If this needs to be dynamic, use innerContent instead of accessibleName because of scenery bug
      // https://github.com/phetsims/scenery/issues/1026, see https://github.com/phetsims/ratio-and-proportion/issues/549#issuecomment-1382878667
      accessibleName: RatioAndProportionStrings.lockRatioStringProperty,

      // voicing
      voicingNameResponse: RatioAndProportionStrings.lockRatioStringProperty,

      // phet-io
      tandem: tandem.createTandem( 'ratioLockToggleButton' )
    } );

    const ratioLockText = new Text( RatioAndProportionStrings.lockRatioStringProperty, {
      font: new PhetFont( 20 ),
      leftCenter: ratioLockToggleButton.rightCenter.plusXY( 8, 0 )
    } );
    ratioLockToggleButton.addChild( ratioLockText );

    model.ratio.lockedProperty.link( locked => {
      ratioLockToggleButton.voicingContextResponse = locked ? RatioAndProportionStrings.a11y.ratioLockToggleContextResponseStringProperty :
                                                     RatioAndProportionStrings.a11y.ratioNoLongerLockedStringProperty;

      ratioLockToggleButton.voicingSpeakResponse( {
        nameResponse: ratioLockToggleButton.voicingNameResponse,
        contextResponse: ratioLockToggleButton.voicingContextResponse
      } );

      ratioLockToggleButton.alertDescriptionUtterance( ratioLockToggleButton.voicingContextResponse );
    } );

    ratioLockToggleButton.enabledProperty.link( ( enabled: boolean ) => {
      ratioLockToggleButton.helpText = enabled ? RatioAndProportionStrings.a11y.ratioLockEnabledHelpTextStringProperty :
                                       RatioAndProportionStrings.a11y.ratioLockDisabledHelpTextStringProperty;
      ratioLockToggleButton.voicingHintResponse = enabled ? RatioAndProportionStrings.a11y.ratioLockEnabledHelpTextStringProperty :
                                                  RatioAndProportionStrings.a11y.ratioLockDisabledHelpTextStringProperty;
    } );

    // The "lock ratio" toggle should not be enabled when the ratio is not in proportion.
    Multilink.multilink( [
      model.inProportionProperty,
      model.ratioFitnessProperty
    ], inProportion => {
      ratioLockToggleButton.enabledProperty.value = inProportion;

      // If the button gets disabled, then unlock the ratio.
      if ( !ratioLockToggleButton.enabledProperty.value ) {
        model.ratio.lockedProperty.value = false;
      }
    } );

    // children - remember to not blow away children set by parent
    this.topScalingUILayerNode.addChild( this.tickMarkRangeComboBoxNode );
    this.topScalingUILayerNode.addChild( myChallengeAccordionBox );

    // Right above the resetAllButton
    this.bottomScalingUILayerNode.insertChild( this.bottomScalingUILayerNode.children.length - 1, ratioLockToggleButton );

    // Should be on top. Don't scale it because that messes with the scaling that the list box goes through, and changes
    // the dimensions of the scalingUILayerNode to make it too big. Discovered in https://github.com/phetsims/ratio-and-proportion/issues/273
    this.addChild( tickMarkRangeComboBoxParent );

    // pdom
    const previousOrder = this.pdomPlayAreaNode.pdomOrder || [];
    this.pdomPlayAreaNode.pdomOrder = previousOrder.concat( [
      this.tickMarkRangeComboBoxNode,
      tickMarkRangeComboBoxParent,
      myChallengeAccordionBox,
      ratioLockToggleButton
    ] );

    this.resetCreateScreenView = () => {
      handPositionsDescriber.reset();

      myChallengeAccordionBox.reset();
    };
  }

  public override layout( bounds: Bounds2 ): void {
    this.tickMarkRangeComboBoxNode.hideListBox(); // hidden when layout changes, see https://github.com/phetsims/ratio-and-proportion/issues/324
    super.layout( bounds );
  }

  public override reset(): void {
    this.resetCreateScreenView();
    super.reset();
  }

  public override getVoicingOverviewContent(): SpeakableResolvedResponse {
    return RatioAndProportionStrings.a11y.create.overviewSentenceStringProperty;
  }

  public override getVoicingDetailsContent(): SpeakableResolvedResponse {
    return this.createScreenSummaryNode.getDetailsButtonState();
  }

  public override getVoicingHintContent(): SpeakableResolvedResponse {
    return RatioAndProportionStrings.a11y.create.screenSummary.interactionHintStringProperty;
  }
}

ratioAndProportion.register( 'CreateScreenView', CreateScreenView );
export default CreateScreenView;