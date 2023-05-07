// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main scenery view for the Motion, Friction and Acceleration screens.
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PlayPauseButton from '../../../../scenery-phet/js/buttons/PlayPauseButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import StepForwardButton from '../../../../scenery-phet/js/buttons/StepForwardButton.js';
import FineCoarseSpinner from '../../../../scenery-phet/js/FineCoarseSpinner.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Image, LinearGradient, Node, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import skateboard_png from '../../../images/skateboard_png.js';
import ForcesAndMotionBasicsQueryParameters from '../../common/ForcesAndMotionBasicsQueryParameters.js';
import ForcesAndMotionBasicsLayoutBounds from '../../common/view/ForcesAndMotionBasicsLayoutBounds.js';
import ReadoutArrow from '../../common/view/ReadoutArrow.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
import ForcesAndMotionBasicsStrings from '../../ForcesAndMotionBasicsStrings.js';
import AccelerometerNode from './AccelerometerNode.js';
import AppliedForceSlider from './AppliedForceSlider.js';
import ItemNode from './ItemNode.js';
import MotionControlPanel from './MotionControlPanel.js';
import MovingBackgroundNode from './MovingBackgroundNode.js';
import PusherNode from './PusherNode.js';
import SpeedometerNode from './SpeedometerNode.js';
import WaterBucketNode from './WaterBucketNode.js';
const sumOfForcesString = ForcesAndMotionBasicsStrings.sumOfForces;

// constants
const PLAY_PAUSE_BUFFER = 10; // separation between step and reset all button, usedful for i18n

// strings
const accelerationString = ForcesAndMotionBasicsStrings.acceleration;
const appliedForceString = ForcesAndMotionBasicsStrings.appliedForce;
const frictionForceString = ForcesAndMotionBasicsStrings.frictionForce;
const pattern0Name1ValueUnitsAccelerationString = ForcesAndMotionBasicsStrings.pattern['0name']['1valueUnitsAcceleration'];
const pattern0ValueUnitsNewtonsString = ForcesAndMotionBasicsStrings.pattern['0valueUnitsNewtons'];
const sumOfForcesEqualsZeroString = ForcesAndMotionBasicsStrings.sumOfForcesEqualsZero;
class MotionScreenView extends ScreenView {
  /**
   * @param {MotionModel} model model for the entire screen
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      layoutBounds: ForcesAndMotionBasicsLayoutBounds,
      tandem: tandem
    });

    //TODO visibility?
    this.model = model;

    //Variables for this constructor, for convenience
    const width = this.layoutBounds.width;
    const height = this.layoutBounds.height;

    //Constants
    const skyHeight = 362;
    const groundHeight = height - skyHeight;

    //Create the static background
    const skyGradient = new LinearGradient(0, 0, 0, skyHeight).addColorStop(0, '#02ace4').addColorStop(1, '#cfecfc');
    this.sky = new Rectangle(-width, -skyHeight, width * 3, skyHeight * 2, {
      fill: skyGradient,
      pickable: false
    });
    this.groundNode = new Rectangle(-width, skyHeight, width * 3, groundHeight * 3, {
      fill: '#c59a5b',
      pickable: false
    });
    this.addChild(this.sky);
    this.addChild(this.groundNode);

    //Create the dynamic (moving) background
    this.addChild(new MovingBackgroundNode(model, this.layoutBounds.width / 2, tandem.createTandem('movingBackgroundNode')).mutate({
      layerSplit: true
    }));

    // The pusher should be behind the skateboard
    this.addChild(new PusherNode(model, this.layoutBounds.width, tandem.createTandem('pusherNode')));

    // Add the skateboard if on the 'motion' screen
    if (model.skateboard) {
      this.addChild(new Image(skateboard_png, {
        centerX: width / 2,
        y: 315 + 12,
        pickable: false,
        tandem: tandem.createTandem('skateboardImageNode')
      }));
    }

    //Add toolbox backgrounds for the objects
    const boxHeight = 180;
    const showItemToolboxes = ForcesAndMotionBasicsQueryParameters.showItemToolboxes;
    const fill = showItemToolboxes ? '#e7e8e9' : null;
    const stroke = showItemToolboxes ? '#000000' : null;
    const leftItemToolboxNode = new Rectangle(10, height - boxHeight - 10, 300, boxHeight, 10, 10, {
      fill: fill,
      stroke: stroke,
      lineWidth: 1,
      tandem: tandem.createTandem('leftItemToolboxNode')
    });
    const rightItemToolboxNode = new Rectangle(width - 10 - 300, height - boxHeight - 10, 300, boxHeight, 10, 10, {
      fill: fill,
      stroke: stroke,
      lineWidth: 1,
      tandem: tandem.createTandem('rightItemToolboxNode')
    });

    //Create the slider
    const disableText = node => length => {
      node.fill = length === 0 ? 'gray' : 'black';
    };
    const maxTextWidth = rightItemToolboxNode.left - leftItemToolboxNode.right - 10;
    const appliedForceSliderText = new Text(appliedForceString, {
      font: new PhetFont(22),
      centerX: width / 2,
      y: 430,
      maxWidth: maxTextWidth,
      tandem: tandem.createTandem('appliedForceSliderText')
    });
    const appliedForceSlider = new AppliedForceSlider(model, new Range(-500, 500), tandem.createTandem('appliedForceSlider'), {
      centerX: width / 2 + 1,
      y: 555
    });
    this.addChild(appliedForceSliderText);
    this.addChild(appliedForceSlider);

    // The range for the spinner will change depending on whether the stack has exceeded maximum speed. This will
    // most often be in cases where there is no friction, because the speed will remain at maximum values and we
    // do not want to allow additional applied force at that time
    const spinnerRange = new Range(-500, 500);

    // Do not allow the user to apply a force that would take the object beyond its maximum velocity
    Multilink.lazyMultilink([model.appliedForceProperty, model.speedClassificationProperty, model.stackSizeProperty], (appliedForce, speedClassification, stackSize) => {
      const enableRightButtons = stackSize > 0 && speedClassification !== 'RIGHT_SPEED_EXCEEDED';
      spinnerRange.max = enableRightButtons ? 500 : 0;
      const enableLeftButtons = stackSize > 0 && speedClassification !== 'LEFT_SPEED_EXCEEDED';
      spinnerRange.min = enableLeftButtons ? -500 : 0;
    });
    const appliedForceSpinner = new FineCoarseSpinner(model.appliedForceProperty, {
      numberDisplayOptions: {
        valuePattern: pattern0ValueUnitsNewtonsString,
        align: 'center',
        xMargin: 20,
        yMargin: 4,
        textOptions: {
          font: new PhetFont(22),
          maxWidth: maxTextWidth / 3
        }
      },
      range: spinnerRange,
      deltaFine: 1,
      deltaCoarse: 50,
      spacing: 6,
      centerBottom: new Vector2(width / 2, appliedForceSlider.top - 12),
      tandem: tandem.createTandem('appliedForceSpinner')
    });
    this.addChild(appliedForceSpinner);

    // force cannot be applied when there is nothing on the stack
    model.stackSizeProperty.link(size => {
      appliedForceSpinner.enabled = size > 0;
    });
    model.stack.lengthProperty.link(disableText(appliedForceSliderText));
    model.stack.lengthProperty.link(length => {
      appliedForceSlider.enabled = length > 0;
    });

    //Create the speedometer.  Specify the position after construction so we can set the 'top'
    const speedometerNode = new SpeedometerNode(model.speedProperty, model.showSpeedProperty, model.showValuesProperty, tandem.createTandem('speedometerNode'), {
      x: 300,
      top: 8
    });
    this.addChild(speedometerNode);

    //Create and add the control panel
    const controlPanel = new MotionControlPanel(model, tandem.createTandem('controlPanel'));
    this.addChild(controlPanel);

    // create the play, pause, and step buttons
    const playPauseButton = new PlayPauseButton(model.playProperty, {
      radius: 18,
      scaleFactorWhenNotPlaying: 1.28,
      tandem: tandem.createTandem('playPauseButton')
    });
    const stepForwardButton = new StepForwardButton({
      enabledProperty: DerivedProperty.not(model.playProperty),
      listener: () => {
        model.manualStep();
      },
      radius: 18,
      tandem: tandem.createTandem('stepForwardButton')
    });

    // play, step, and reset buttons in an HBox aligned left bottom under the control panel
    const playPauseVerticalOffset = 35;
    const playPauseStepHBox = new HBox({
      children: [playPauseButton, stepForwardButton],
      spacing: PLAY_PAUSE_BUFFER,
      resize: false,
      leftCenter: controlPanel.leftBottom.plusXY(0, playPauseVerticalOffset)
    });
    this.addChild(playPauseStepHBox);

    //Reset all button goes beneath the control panel.  Not a closure variable since API access is required.
    //TODO: Is that OK? or should we invest dynamic search/lookups to keep as closure var?
    this.resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
      },
      radius: 23,
      rightCenter: controlPanel.rightBottom.plusXY(0, playPauseVerticalOffset),
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(this.resetAllButton);

    // i18n - if the play control buttons are too close to reset all, they should be separated
    if (playPauseStepHBox.right > this.resetAllButton.left - PLAY_PAUSE_BUFFER) {
      playPauseStepHBox.leftCenter = controlPanel.leftBottom.plusXY(-2 * PLAY_PAUSE_BUFFER, playPauseVerticalOffset);
    }

    //Add the accelerometer, if on the final screen
    if (model.accelerometer) {
      const accelerometerNode = new AccelerometerNode(model.accelerationProperty, tandem.createTandem('accelerometerNode'));

      // build up the string label for the acceleration
      const labelString = StringUtils.format(pattern0Name1ValueUnitsAccelerationString, accelerationString, model.accelerationProperty.value);
      const labelText = new RichText(labelString, {
        font: new PhetFont(18),
        supScale: 0.60,
        supYOffset: 2,
        maxWidth: accelerometerNode.width * 3 / 2
      });

      // create the tick labels
      const tickLabel = (label, tick, tandemID) => new Text(label, {
        pickable: false,
        font: new PhetFont(16),
        centerX: tick.centerX,
        top: tick.bottom + 27,
        tandem: tandem.createTandem(`tickLabel${tandemID}Text`)
      });
      const tickLabels = new Node({
        tandem: tandem.createTandem('tickLabels'),
        children: [tickLabel('-20', accelerometerNode.ticks[0], 'Negative20'), tickLabel('0', accelerometerNode.ticks[2], 'Zero'), tickLabel('20', accelerometerNode.ticks[4], 'Positive20')]
      });

      // put it all together in a VBox
      const accelerometerWithTickLabels = new Node({
        tandem: tandem.createTandem('accelerometerWithTickLabels'),
        children: [labelText, accelerometerNode, tickLabels],
        pickable: false,
        centerX: 300,
        y: 170
      });
      labelText.bottom = accelerometerNode.top;
      tickLabels.top = accelerometerNode.bottom;
      model.showAccelerationProperty.linkAttribute(accelerometerWithTickLabels, 'visible');
      this.addChild(accelerometerWithTickLabels);

      // whenever showValues and accleration changes, update the label text
      const initialLabelWidth = labelText.width;
      Multilink.multilink([model.showValuesProperty, model.accelerationProperty], (showValues, acceleration) => {
        if (showValues) {
          const accelerationValue = Utils.toFixed(acceleration, 2);
          labelText.setString(StringUtils.format(pattern0Name1ValueUnitsAccelerationString, accelerationString, accelerationValue));

          // Make sure that the acceleration readout does not shift as the value changes by compensating for the change
          // in width.
          labelText.centerX = accelerometerNode.centerX + (labelText.width - initialLabelWidth) / 2 - 10;
        } else {
          labelText.setString(accelerationString);
          labelText.centerX = accelerometerNode.centerX;
        }
      });
    }

    // Map the items to their correct toolbox, one of left or right, corresponding to the side of the screen that
    // toolbox is sitting on.
    const getItemSide = item => {
      // the fridge and the crates both go in hte left toolbox
      if (item.name === 'fridge' || item.name === 'crate1' || item.name === 'crate2') {
        return 'left';
      } else {
        return 'right';
      }
    };

    //Iterate over the items in the model and create and add nodes for each one
    const leftItemLayer = new Node({
      tandem: tandem.createTandem('leftItemLayer')
    });
    const rightItemLayer = new Node({
      tandem: tandem.createTandem('rightItemLayer')
    });
    this.itemNodes = [];
    for (let i = 0; i < model.items.length; i++) {
      const item = model.items[i];
      const itemSide = getItemSide(item);
      const toolboxNode = itemSide === 'left' ? leftItemToolboxNode : rightItemToolboxNode;
      const itemLayer = itemSide === 'left' ? leftItemLayer : rightItemLayer;
      const Constructor = item.bucket ? WaterBucketNode : ItemNode;
      const itemNode = new Constructor(model, this, item, item.image, item.sittingImage || item.image, item.holdingImage || item.image, model.showMassesProperty, toolboxNode, tandem.createTandem(item.name));
      this.itemNodes.push(itemNode);

      //Provide a reference from the item model to its view so that view dimensions can be looked up easily
      item.view = itemNode;
      itemLayer.addChild(itemNode);
    }
    leftItemToolboxNode.addChild(leftItemLayer);
    rightItemToolboxNode.addChild(rightItemLayer);

    //Add the force arrows & associated readouts in front of the items
    const arrowScale = 0.3;

    //Round the forces so that the sum is correct in the display, see https://github.com/phetsims/forces-and-motion-basics/issues/72 and  https://github.com/phetsims/forces-and-motion-basics/issues/74
    const roundedAppliedForceProperty = new DerivedProperty([model.appliedForceProperty], appliedForce => Utils.roundSymmetric(appliedForce));
    const roundedFrictionForceProperty = new DerivedProperty([model.frictionForceProperty], frictionForce => Utils.roundSymmetric(frictionForce));

    //Only update the sum force arrow after both friction and applied force changed, so we don't get partial updates, see https://github.com/phetsims/forces-and-motion-basics/issues/83
    const roundedSumProperty = new NumberProperty(roundedAppliedForceProperty.get() + roundedFrictionForceProperty.get(), {
      tandem: tandem.createTandem('roundedSumProperty'),
      units: 'N'
    });
    model.stepEmitter.addListener(() => {
      roundedSumProperty.set(roundedAppliedForceProperty.get() + roundedFrictionForceProperty.get());
    });
    this.sumArrow = new ReadoutArrow(sumOfForcesString, '#96c83c', this.layoutBounds.width / 2, 225, roundedSumProperty, model.showValuesProperty, tandem.createTandem('sumArrow'), {
      labelPosition: 'top',
      arrowScale: arrowScale
    });
    this.sumOfForcesText = new Text(sumOfForcesEqualsZeroString, {
      pickable: false,
      font: new PhetFont({
        size: 16,
        weight: 'bold'
      }),
      centerX: width / 2,
      y: 195,
      maxWidth: 125,
      tandem: tandem.createTandem('sumOfForcesText')
    });

    //If the (rounded) sum of forces arrow is zero, then show the text "Sum of Forces = 0", see #76
    new DerivedProperty([model.showSumOfForcesProperty, roundedSumProperty], (showSumOfForces, sumOfForces) => showSumOfForces && sumOfForces === 0).linkAttribute(this.sumOfForcesText, 'visible');
    this.appliedForceArrow = new ReadoutArrow(appliedForceString, '#e66e23', this.layoutBounds.width / 2, 280, roundedAppliedForceProperty, model.showValuesProperty, tandem.createTandem('appliedForceArrow'), {
      labelPosition: 'side',
      arrowScale: arrowScale
    });
    this.frictionArrow = new ReadoutArrow(frictionForceString, 'red', this.layoutBounds.width / 2, 280, roundedFrictionForceProperty, model.showValuesProperty, tandem.createTandem('frictionArrow'), {
      labelPosition: 'side',
      arrowScale: arrowScale
    });

    // toolboxes and their children should be in front of all above items
    // contain the toolboxes in a parent node so that we can easily change the z-order of each toolbox.  This way
    // items of the right toolbox will not be layered in front of items of left toolbox items
    const toolboxContainer = new Node({
      tandem: tandem.createTandem('toolboxContainer')
    });
    toolboxContainer.addChild(leftItemToolboxNode);
    toolboxContainer.addChild(rightItemToolboxNode);
    this.addChild(toolboxContainer);

    // add the force arrows, which should be in front of all items and pusher
    this.addChild(this.sumArrow);
    this.addChild(this.appliedForceArrow);
    this.addChild(this.frictionArrow);
    this.addChild(this.sumOfForcesText);

    //Whichever arrow is smaller should be in front (in z-ordering)
    const frictionLargerProperty = new DerivedProperty([roundedAppliedForceProperty, roundedFrictionForceProperty], (roundedAppliedForce, roundedFrictionForce) => Math.abs(roundedFrictionForce) > Math.abs(roundedAppliedForce));
    frictionLargerProperty.link(frictionLarger => {
      const node = frictionLarger ? this.appliedForceArrow : this.frictionArrow;
      node.moveToFront();
    });

    //On the motion screens, when the 'Friction' label overlaps the force vector it should be displaced vertically
    Multilink.multilink([model.appliedForceProperty, model.frictionForceProperty], (appliedForce, frictionForce) => {
      const sameDirection = appliedForce < 0 && frictionForce < 0 || appliedForce > 0 && frictionForce > 0;
      this.frictionArrow.overlapsOther = sameDirection;
      this.frictionArrow.labelPosition = sameDirection ? 'bottom' : 'side';

      // the applied force arrow must be updated directly since its label position doesn't change
      this.appliedForceArrow.overlapsOther = sameDirection;
      this.appliedForceArrow.update();
    });
    model.showForceProperty.linkAttribute(this.appliedForceArrow, 'visible');
    model.showForceProperty.linkAttribute(this.frictionArrow, 'visible');
    model.showSumOfForcesProperty.linkAttribute(this.sumArrow, 'visible');

    //After the view is constructed, move one of the blocks to the top of the stack.
    model.viewInitialized(this);
  }

  // @private Get the height of the objects in the stack (doesn't include skateboard)
  get stackHeight() {
    let sum = 0;
    for (let i = 0; i < this.model.stack.length; i++) {
      sum = sum + this.model.stack.get(i).view.height;
    }
    return sum;
  }

  // @public Find the top of the stack, so that a new object can be placed on top
  get topOfStack() {
    const n = this.model.skateboard ? 334 : 360;
    return n - this.stackHeight;
  }

  // @public Get the size of an item's image.  Dependent on the current scale of the image.
  getSize(item) {
    // get the current scale for the element and apply it to the image
    const scaledWidth = item.view.sittingImage.width * item.getCurrentScale();
    return {
      width: scaledWidth,
      height: item.view.height
    };
  }
}
forcesAndMotionBasics.register('MotionScreenView', MotionScreenView);
export default MotionScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIlN0cmluZ1V0aWxzIiwiUGxheVBhdXNlQnV0dG9uIiwiUmVzZXRBbGxCdXR0b24iLCJTdGVwRm9yd2FyZEJ1dHRvbiIsIkZpbmVDb2Fyc2VTcGlubmVyIiwiUGhldEZvbnQiLCJIQm94IiwiSW1hZ2UiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlRleHQiLCJza2F0ZWJvYXJkX3BuZyIsIkZvcmNlc0FuZE1vdGlvbkJhc2ljc1F1ZXJ5UGFyYW1ldGVycyIsIkZvcmNlc0FuZE1vdGlvbkJhc2ljc0xheW91dEJvdW5kcyIsIlJlYWRvdXRBcnJvdyIsImZvcmNlc0FuZE1vdGlvbkJhc2ljcyIsIkZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MiLCJBY2NlbGVyb21ldGVyTm9kZSIsIkFwcGxpZWRGb3JjZVNsaWRlciIsIkl0ZW1Ob2RlIiwiTW90aW9uQ29udHJvbFBhbmVsIiwiTW92aW5nQmFja2dyb3VuZE5vZGUiLCJQdXNoZXJOb2RlIiwiU3BlZWRvbWV0ZXJOb2RlIiwiV2F0ZXJCdWNrZXROb2RlIiwic3VtT2ZGb3JjZXNTdHJpbmciLCJzdW1PZkZvcmNlcyIsIlBMQVlfUEFVU0VfQlVGRkVSIiwiYWNjZWxlcmF0aW9uU3RyaW5nIiwiYWNjZWxlcmF0aW9uIiwiYXBwbGllZEZvcmNlU3RyaW5nIiwiYXBwbGllZEZvcmNlIiwiZnJpY3Rpb25Gb3JjZVN0cmluZyIsImZyaWN0aW9uRm9yY2UiLCJwYXR0ZXJuME5hbWUxVmFsdWVVbml0c0FjY2VsZXJhdGlvblN0cmluZyIsInBhdHRlcm4iLCJwYXR0ZXJuMFZhbHVlVW5pdHNOZXd0b25zU3RyaW5nIiwic3VtT2ZGb3JjZXNFcXVhbHNaZXJvU3RyaW5nIiwic3VtT2ZGb3JjZXNFcXVhbHNaZXJvIiwiTW90aW9uU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJsYXlvdXRCb3VuZHMiLCJ3aWR0aCIsImhlaWdodCIsInNreUhlaWdodCIsImdyb3VuZEhlaWdodCIsInNreUdyYWRpZW50IiwiYWRkQ29sb3JTdG9wIiwic2t5IiwiZmlsbCIsInBpY2thYmxlIiwiZ3JvdW5kTm9kZSIsImFkZENoaWxkIiwiY3JlYXRlVGFuZGVtIiwibXV0YXRlIiwibGF5ZXJTcGxpdCIsInNrYXRlYm9hcmQiLCJjZW50ZXJYIiwieSIsImJveEhlaWdodCIsInNob3dJdGVtVG9vbGJveGVzIiwic3Ryb2tlIiwibGVmdEl0ZW1Ub29sYm94Tm9kZSIsImxpbmVXaWR0aCIsInJpZ2h0SXRlbVRvb2xib3hOb2RlIiwiZGlzYWJsZVRleHQiLCJub2RlIiwibGVuZ3RoIiwibWF4VGV4dFdpZHRoIiwibGVmdCIsInJpZ2h0IiwiYXBwbGllZEZvcmNlU2xpZGVyVGV4dCIsImZvbnQiLCJtYXhXaWR0aCIsImFwcGxpZWRGb3JjZVNsaWRlciIsInNwaW5uZXJSYW5nZSIsImxhenlNdWx0aWxpbmsiLCJhcHBsaWVkRm9yY2VQcm9wZXJ0eSIsInNwZWVkQ2xhc3NpZmljYXRpb25Qcm9wZXJ0eSIsInN0YWNrU2l6ZVByb3BlcnR5Iiwic3BlZWRDbGFzc2lmaWNhdGlvbiIsInN0YWNrU2l6ZSIsImVuYWJsZVJpZ2h0QnV0dG9ucyIsIm1heCIsImVuYWJsZUxlZnRCdXR0b25zIiwibWluIiwiYXBwbGllZEZvcmNlU3Bpbm5lciIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwidmFsdWVQYXR0ZXJuIiwiYWxpZ24iLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRleHRPcHRpb25zIiwicmFuZ2UiLCJkZWx0YUZpbmUiLCJkZWx0YUNvYXJzZSIsInNwYWNpbmciLCJjZW50ZXJCb3R0b20iLCJ0b3AiLCJsaW5rIiwic2l6ZSIsImVuYWJsZWQiLCJzdGFjayIsImxlbmd0aFByb3BlcnR5Iiwic3BlZWRvbWV0ZXJOb2RlIiwic3BlZWRQcm9wZXJ0eSIsInNob3dTcGVlZFByb3BlcnR5Iiwic2hvd1ZhbHVlc1Byb3BlcnR5IiwieCIsImNvbnRyb2xQYW5lbCIsInBsYXlQYXVzZUJ1dHRvbiIsInBsYXlQcm9wZXJ0eSIsInJhZGl1cyIsInNjYWxlRmFjdG9yV2hlbk5vdFBsYXlpbmciLCJzdGVwRm9yd2FyZEJ1dHRvbiIsImVuYWJsZWRQcm9wZXJ0eSIsIm5vdCIsImxpc3RlbmVyIiwibWFudWFsU3RlcCIsInBsYXlQYXVzZVZlcnRpY2FsT2Zmc2V0IiwicGxheVBhdXNlU3RlcEhCb3giLCJjaGlsZHJlbiIsInJlc2l6ZSIsImxlZnRDZW50ZXIiLCJsZWZ0Qm90dG9tIiwicGx1c1hZIiwicmVzZXRBbGxCdXR0b24iLCJyZXNldCIsInJpZ2h0Q2VudGVyIiwicmlnaHRCb3R0b20iLCJhY2NlbGVyb21ldGVyIiwiYWNjZWxlcm9tZXRlck5vZGUiLCJhY2NlbGVyYXRpb25Qcm9wZXJ0eSIsImxhYmVsU3RyaW5nIiwiZm9ybWF0IiwidmFsdWUiLCJsYWJlbFRleHQiLCJzdXBTY2FsZSIsInN1cFlPZmZzZXQiLCJ0aWNrTGFiZWwiLCJsYWJlbCIsInRpY2siLCJ0YW5kZW1JRCIsImJvdHRvbSIsInRpY2tMYWJlbHMiLCJ0aWNrcyIsImFjY2VsZXJvbWV0ZXJXaXRoVGlja0xhYmVscyIsInNob3dBY2NlbGVyYXRpb25Qcm9wZXJ0eSIsImxpbmtBdHRyaWJ1dGUiLCJpbml0aWFsTGFiZWxXaWR0aCIsIm11bHRpbGluayIsInNob3dWYWx1ZXMiLCJhY2NlbGVyYXRpb25WYWx1ZSIsInRvRml4ZWQiLCJzZXRTdHJpbmciLCJnZXRJdGVtU2lkZSIsIml0ZW0iLCJuYW1lIiwibGVmdEl0ZW1MYXllciIsInJpZ2h0SXRlbUxheWVyIiwiaXRlbU5vZGVzIiwiaSIsIml0ZW1zIiwiaXRlbVNpZGUiLCJ0b29sYm94Tm9kZSIsIml0ZW1MYXllciIsIkNvbnN0cnVjdG9yIiwiYnVja2V0IiwiaXRlbU5vZGUiLCJpbWFnZSIsInNpdHRpbmdJbWFnZSIsImhvbGRpbmdJbWFnZSIsInNob3dNYXNzZXNQcm9wZXJ0eSIsInB1c2giLCJ2aWV3IiwiYXJyb3dTY2FsZSIsInJvdW5kZWRBcHBsaWVkRm9yY2VQcm9wZXJ0eSIsInJvdW5kU3ltbWV0cmljIiwicm91bmRlZEZyaWN0aW9uRm9yY2VQcm9wZXJ0eSIsImZyaWN0aW9uRm9yY2VQcm9wZXJ0eSIsInJvdW5kZWRTdW1Qcm9wZXJ0eSIsImdldCIsInVuaXRzIiwic3RlcEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInNldCIsInN1bUFycm93IiwibGFiZWxQb3NpdGlvbiIsInN1bU9mRm9yY2VzVGV4dCIsIndlaWdodCIsInNob3dTdW1PZkZvcmNlc1Byb3BlcnR5Iiwic2hvd1N1bU9mRm9yY2VzIiwiYXBwbGllZEZvcmNlQXJyb3ciLCJmcmljdGlvbkFycm93IiwidG9vbGJveENvbnRhaW5lciIsImZyaWN0aW9uTGFyZ2VyUHJvcGVydHkiLCJyb3VuZGVkQXBwbGllZEZvcmNlIiwicm91bmRlZEZyaWN0aW9uRm9yY2UiLCJNYXRoIiwiYWJzIiwiZnJpY3Rpb25MYXJnZXIiLCJtb3ZlVG9Gcm9udCIsInNhbWVEaXJlY3Rpb24iLCJvdmVybGFwc090aGVyIiwidXBkYXRlIiwic2hvd0ZvcmNlUHJvcGVydHkiLCJ2aWV3SW5pdGlhbGl6ZWQiLCJzdGFja0hlaWdodCIsInN1bSIsInRvcE9mU3RhY2siLCJuIiwiZ2V0U2l6ZSIsInNjYWxlZFdpZHRoIiwiZ2V0Q3VycmVudFNjYWxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb3Rpb25TY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gc2NlbmVyeSB2aWV3IGZvciB0aGUgTW90aW9uLCBGcmljdGlvbiBhbmQgQWNjZWxlcmF0aW9uIHNjcmVlbnMuXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBQbGF5UGF1c2VCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUGxheVBhdXNlQnV0dG9uLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IFN0ZXBGb3J3YXJkQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1N0ZXBGb3J3YXJkQnV0dG9uLmpzJztcclxuaW1wb3J0IEZpbmVDb2Fyc2VTcGlubmVyIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GaW5lQ29hcnNlU3Bpbm5lci5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBJbWFnZSwgTGluZWFyR3JhZGllbnQsIE5vZGUsIFJlY3RhbmdsZSwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc2thdGVib2FyZF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3NrYXRlYm9hcmRfcG5nLmpzJztcclxuaW1wb3J0IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1F1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi8uLi9jb21tb24vRm9yY2VzQW5kTW90aW9uQmFzaWNzUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEZvcmNlc0FuZE1vdGlvbkJhc2ljc0xheW91dEJvdW5kcyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Gb3JjZXNBbmRNb3Rpb25CYXNpY3NMYXlvdXRCb3VuZHMuanMnO1xyXG5pbXBvcnQgUmVhZG91dEFycm93IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1JlYWRvdXRBcnJvdy5qcyc7XHJcbmltcG9ydCBmb3JjZXNBbmRNb3Rpb25CYXNpY3MgZnJvbSAnLi4vLi4vZm9yY2VzQW5kTW90aW9uQmFzaWNzLmpzJztcclxuaW1wb3J0IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MgZnJvbSAnLi4vLi4vRm9yY2VzQW5kTW90aW9uQmFzaWNzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBBY2NlbGVyb21ldGVyTm9kZSBmcm9tICcuL0FjY2VsZXJvbWV0ZXJOb2RlLmpzJztcclxuaW1wb3J0IEFwcGxpZWRGb3JjZVNsaWRlciBmcm9tICcuL0FwcGxpZWRGb3JjZVNsaWRlci5qcyc7XHJcbmltcG9ydCBJdGVtTm9kZSBmcm9tICcuL0l0ZW1Ob2RlLmpzJztcclxuaW1wb3J0IE1vdGlvbkNvbnRyb2xQYW5lbCBmcm9tICcuL01vdGlvbkNvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBNb3ZpbmdCYWNrZ3JvdW5kTm9kZSBmcm9tICcuL01vdmluZ0JhY2tncm91bmROb2RlLmpzJztcclxuaW1wb3J0IFB1c2hlck5vZGUgZnJvbSAnLi9QdXNoZXJOb2RlLmpzJztcclxuaW1wb3J0IFNwZWVkb21ldGVyTm9kZSBmcm9tICcuL1NwZWVkb21ldGVyTm9kZS5qcyc7XHJcbmltcG9ydCBXYXRlckJ1Y2tldE5vZGUgZnJvbSAnLi9XYXRlckJ1Y2tldE5vZGUuanMnO1xyXG5cclxuY29uc3Qgc3VtT2ZGb3JjZXNTdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLnN1bU9mRm9yY2VzO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBMQVlfUEFVU0VfQlVGRkVSID0gMTA7IC8vIHNlcGFyYXRpb24gYmV0d2VlbiBzdGVwIGFuZCByZXNldCBhbGwgYnV0dG9uLCB1c2VkZnVsIGZvciBpMThuXHJcblxyXG4vLyBzdHJpbmdzXHJcbmNvbnN0IGFjY2VsZXJhdGlvblN0cmluZyA9IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MuYWNjZWxlcmF0aW9uO1xyXG5jb25zdCBhcHBsaWVkRm9yY2VTdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLmFwcGxpZWRGb3JjZTtcclxuY29uc3QgZnJpY3Rpb25Gb3JjZVN0cmluZyA9IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MuZnJpY3Rpb25Gb3JjZTtcclxuY29uc3QgcGF0dGVybjBOYW1lMVZhbHVlVW5pdHNBY2NlbGVyYXRpb25TdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLnBhdHRlcm5bICcwbmFtZScgXVsgJzF2YWx1ZVVuaXRzQWNjZWxlcmF0aW9uJyBdO1xyXG5jb25zdCBwYXR0ZXJuMFZhbHVlVW5pdHNOZXd0b25zU3RyaW5nID0gRm9yY2VzQW5kTW90aW9uQmFzaWNzU3RyaW5ncy5wYXR0ZXJuWyAnMHZhbHVlVW5pdHNOZXd0b25zJyBdO1xyXG5jb25zdCBzdW1PZkZvcmNlc0VxdWFsc1plcm9TdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLnN1bU9mRm9yY2VzRXF1YWxzWmVybztcclxuXHJcbmNsYXNzIE1vdGlvblNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNb3Rpb25Nb2RlbH0gbW9kZWwgbW9kZWwgZm9yIHRoZSBlbnRpcmUgc2NyZWVuXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGxheW91dEJvdW5kczogRm9yY2VzQW5kTW90aW9uQmFzaWNzTGF5b3V0Qm91bmRzLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vVE9ETyB2aXNpYmlsaXR5P1xyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIC8vVmFyaWFibGVzIGZvciB0aGlzIGNvbnN0cnVjdG9yLCBmb3IgY29udmVuaWVuY2VcclxuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5sYXlvdXRCb3VuZHMud2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQ7XHJcblxyXG4gICAgLy9Db25zdGFudHNcclxuICAgIGNvbnN0IHNreUhlaWdodCA9IDM2MjtcclxuICAgIGNvbnN0IGdyb3VuZEhlaWdodCA9IGhlaWdodCAtIHNreUhlaWdodDtcclxuXHJcbiAgICAvL0NyZWF0ZSB0aGUgc3RhdGljIGJhY2tncm91bmRcclxuICAgIGNvbnN0IHNreUdyYWRpZW50ID0gbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAwLCBza3lIZWlnaHQgKS5hZGRDb2xvclN0b3AoIDAsICcjMDJhY2U0JyApLmFkZENvbG9yU3RvcCggMSwgJyNjZmVjZmMnICk7XHJcbiAgICB0aGlzLnNreSA9IG5ldyBSZWN0YW5nbGUoIC13aWR0aCwgLXNreUhlaWdodCwgd2lkdGggKiAzLCBza3lIZWlnaHQgKiAyLCB7IGZpbGw6IHNreUdyYWRpZW50LCBwaWNrYWJsZTogZmFsc2UgfSApO1xyXG5cclxuICAgIHRoaXMuZ3JvdW5kTm9kZSA9IG5ldyBSZWN0YW5nbGUoIC13aWR0aCwgc2t5SGVpZ2h0LCB3aWR0aCAqIDMsIGdyb3VuZEhlaWdodCAqIDMsIHtcclxuICAgICAgZmlsbDogJyNjNTlhNWInLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuc2t5ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmdyb3VuZE5vZGUgKTtcclxuXHJcbiAgICAvL0NyZWF0ZSB0aGUgZHluYW1pYyAobW92aW5nKSBiYWNrZ3JvdW5kXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTW92aW5nQmFja2dyb3VuZE5vZGUoIG1vZGVsLCB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAvIDIsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb3ZpbmdCYWNrZ3JvdW5kTm9kZScgKSApLm11dGF0ZSggeyBsYXllclNwbGl0OiB0cnVlIH0gKSApO1xyXG5cclxuICAgIC8vIFRoZSBwdXNoZXIgc2hvdWxkIGJlIGJlaGluZCB0aGUgc2thdGVib2FyZFxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFB1c2hlck5vZGUoIG1vZGVsLCB0aGlzLmxheW91dEJvdW5kcy53aWR0aCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3B1c2hlck5vZGUnICkgKSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgc2thdGVib2FyZCBpZiBvbiB0aGUgJ21vdGlvbicgc2NyZWVuXHJcbiAgICBpZiAoIG1vZGVsLnNrYXRlYm9hcmQgKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBJbWFnZSggc2thdGVib2FyZF9wbmcsIHtcclxuICAgICAgICBjZW50ZXJYOiB3aWR0aCAvIDIsIHk6IDMxNSArIDEyLFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdza2F0ZWJvYXJkSW1hZ2VOb2RlJyApXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vQWRkIHRvb2xib3ggYmFja2dyb3VuZHMgZm9yIHRoZSBvYmplY3RzXHJcbiAgICBjb25zdCBib3hIZWlnaHQgPSAxODA7XHJcbiAgICBjb25zdCBzaG93SXRlbVRvb2xib3hlcyA9IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1F1ZXJ5UGFyYW1ldGVycy5zaG93SXRlbVRvb2xib3hlcztcclxuICAgIGNvbnN0IGZpbGwgPSBzaG93SXRlbVRvb2xib3hlcyA/ICcjZTdlOGU5JyA6IG51bGw7XHJcbiAgICBjb25zdCBzdHJva2UgPSBzaG93SXRlbVRvb2xib3hlcyA/ICcjMDAwMDAwJyA6IG51bGw7XHJcbiAgICBjb25zdCBsZWZ0SXRlbVRvb2xib3hOb2RlID0gbmV3IFJlY3RhbmdsZSggMTAsIGhlaWdodCAtIGJveEhlaWdodCAtIDEwLCAzMDAsIGJveEhlaWdodCwgMTAsIDEwLCB7XHJcbiAgICAgIGZpbGw6IGZpbGwsXHJcbiAgICAgIHN0cm9rZTogc3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xlZnRJdGVtVG9vbGJveE5vZGUnIClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHJpZ2h0SXRlbVRvb2xib3hOb2RlID0gbmV3IFJlY3RhbmdsZSggd2lkdGggLSAxMCAtIDMwMCwgaGVpZ2h0IC0gYm94SGVpZ2h0IC0gMTAsIDMwMCwgYm94SGVpZ2h0LCAxMCwgMTAsIHtcclxuICAgICAgZmlsbDogZmlsbCxcclxuICAgICAgc3Ryb2tlOiBzdHJva2UsXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmlnaHRJdGVtVG9vbGJveE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvL0NyZWF0ZSB0aGUgc2xpZGVyXHJcbiAgICBjb25zdCBkaXNhYmxlVGV4dCA9IG5vZGUgPT4gbGVuZ3RoID0+IHtub2RlLmZpbGwgPSBsZW5ndGggPT09IDAgPyAnZ3JheScgOiAnYmxhY2snO307XHJcblxyXG4gICAgY29uc3QgbWF4VGV4dFdpZHRoID0gKCByaWdodEl0ZW1Ub29sYm94Tm9kZS5sZWZ0IC0gbGVmdEl0ZW1Ub29sYm94Tm9kZS5yaWdodCApIC0gMTA7XHJcbiAgICBjb25zdCBhcHBsaWVkRm9yY2VTbGlkZXJUZXh0ID0gbmV3IFRleHQoIGFwcGxpZWRGb3JjZVN0cmluZywge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIyICksXHJcbiAgICAgIGNlbnRlclg6IHdpZHRoIC8gMixcclxuICAgICAgeTogNDMwLFxyXG4gICAgICBtYXhXaWR0aDogbWF4VGV4dFdpZHRoLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhcHBsaWVkRm9yY2VTbGlkZXJUZXh0JyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBhcHBsaWVkRm9yY2VTbGlkZXIgPSBuZXcgQXBwbGllZEZvcmNlU2xpZGVyKCBtb2RlbCwgbmV3IFJhbmdlKCAtNTAwLCA1MDAgKSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FwcGxpZWRGb3JjZVNsaWRlcicgKSwge1xyXG4gICAgICAgIGNlbnRlclg6IHdpZHRoIC8gMiArIDEsXHJcbiAgICAgICAgeTogNTU1XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBhcHBsaWVkRm9yY2VTbGlkZXJUZXh0ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhcHBsaWVkRm9yY2VTbGlkZXIgKTtcclxuXHJcbiAgICAvLyBUaGUgcmFuZ2UgZm9yIHRoZSBzcGlubmVyIHdpbGwgY2hhbmdlIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBzdGFjayBoYXMgZXhjZWVkZWQgbWF4aW11bSBzcGVlZC4gVGhpcyB3aWxsXHJcbiAgICAvLyBtb3N0IG9mdGVuIGJlIGluIGNhc2VzIHdoZXJlIHRoZXJlIGlzIG5vIGZyaWN0aW9uLCBiZWNhdXNlIHRoZSBzcGVlZCB3aWxsIHJlbWFpbiBhdCBtYXhpbXVtIHZhbHVlcyBhbmQgd2VcclxuICAgIC8vIGRvIG5vdCB3YW50IHRvIGFsbG93IGFkZGl0aW9uYWwgYXBwbGllZCBmb3JjZSBhdCB0aGF0IHRpbWVcclxuICAgIGNvbnN0IHNwaW5uZXJSYW5nZSA9IG5ldyBSYW5nZSggLTUwMCwgNTAwICk7XHJcblxyXG4gICAgLy8gRG8gbm90IGFsbG93IHRoZSB1c2VyIHRvIGFwcGx5IGEgZm9yY2UgdGhhdCB3b3VsZCB0YWtlIHRoZSBvYmplY3QgYmV5b25kIGl0cyBtYXhpbXVtIHZlbG9jaXR5XHJcbiAgICBNdWx0aWxpbmsubGF6eU11bHRpbGluayggWyBtb2RlbC5hcHBsaWVkRm9yY2VQcm9wZXJ0eSwgbW9kZWwuc3BlZWRDbGFzc2lmaWNhdGlvblByb3BlcnR5LCBtb2RlbC5zdGFja1NpemVQcm9wZXJ0eSBdLCAoIGFwcGxpZWRGb3JjZSwgc3BlZWRDbGFzc2lmaWNhdGlvbiwgc3RhY2tTaXplICkgPT4ge1xyXG5cclxuICAgICAgY29uc3QgZW5hYmxlUmlnaHRCdXR0b25zID0gKCBzdGFja1NpemUgPiAwICYmICggc3BlZWRDbGFzc2lmaWNhdGlvbiAhPT0gJ1JJR0hUX1NQRUVEX0VYQ0VFREVEJyApICk7XHJcbiAgICAgIHNwaW5uZXJSYW5nZS5tYXggPSBlbmFibGVSaWdodEJ1dHRvbnMgPyA1MDAgOiAwO1xyXG5cclxuICAgICAgY29uc3QgZW5hYmxlTGVmdEJ1dHRvbnMgPSAoIHN0YWNrU2l6ZSA+IDAgJiYgKCBzcGVlZENsYXNzaWZpY2F0aW9uICE9PSAnTEVGVF9TUEVFRF9FWENFRURFRCcgKSApO1xyXG4gICAgICBzcGlubmVyUmFuZ2UubWluID0gZW5hYmxlTGVmdEJ1dHRvbnMgPyAtNTAwIDogMDtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBhcHBsaWVkRm9yY2VTcGlubmVyID0gbmV3IEZpbmVDb2Fyc2VTcGlubmVyKCBtb2RlbC5hcHBsaWVkRm9yY2VQcm9wZXJ0eSwge1xyXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG4gICAgICAgIHZhbHVlUGF0dGVybjogcGF0dGVybjBWYWx1ZVVuaXRzTmV3dG9uc1N0cmluZyxcclxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgeE1hcmdpbjogMjAsXHJcbiAgICAgICAgeU1hcmdpbjogNCxcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMiApLFxyXG4gICAgICAgICAgbWF4V2lkdGg6IG1heFRleHRXaWR0aCAvIDNcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICByYW5nZTogc3Bpbm5lclJhbmdlLFxyXG5cclxuICAgICAgZGVsdGFGaW5lOiAxLFxyXG4gICAgICBkZWx0YUNvYXJzZTogNTAsXHJcblxyXG4gICAgICBzcGFjaW5nOiA2LFxyXG4gICAgICBjZW50ZXJCb3R0b206IG5ldyBWZWN0b3IyKCB3aWR0aCAvIDIsIGFwcGxpZWRGb3JjZVNsaWRlci50b3AgLSAxMiApLFxyXG5cclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXBwbGllZEZvcmNlU3Bpbm5lcicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIGFwcGxpZWRGb3JjZVNwaW5uZXIgKTtcclxuXHJcbiAgICAvLyBmb3JjZSBjYW5ub3QgYmUgYXBwbGllZCB3aGVuIHRoZXJlIGlzIG5vdGhpbmcgb24gdGhlIHN0YWNrXHJcbiAgICBtb2RlbC5zdGFja1NpemVQcm9wZXJ0eS5saW5rKCBzaXplID0+IHtcclxuICAgICAgYXBwbGllZEZvcmNlU3Bpbm5lci5lbmFibGVkID0gc2l6ZSA+IDA7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbW9kZWwuc3RhY2subGVuZ3RoUHJvcGVydHkubGluayggZGlzYWJsZVRleHQoIGFwcGxpZWRGb3JjZVNsaWRlclRleHQgKSApO1xyXG4gICAgbW9kZWwuc3RhY2subGVuZ3RoUHJvcGVydHkubGluayggbGVuZ3RoID0+IHsgYXBwbGllZEZvcmNlU2xpZGVyLmVuYWJsZWQgPSBsZW5ndGggPiAwOyB9ICk7XHJcblxyXG4gICAgLy9DcmVhdGUgdGhlIHNwZWVkb21ldGVyLiAgU3BlY2lmeSB0aGUgcG9zaXRpb24gYWZ0ZXIgY29uc3RydWN0aW9uIHNvIHdlIGNhbiBzZXQgdGhlICd0b3AnXHJcbiAgICBjb25zdCBzcGVlZG9tZXRlck5vZGUgPSBuZXcgU3BlZWRvbWV0ZXJOb2RlKCBtb2RlbC5zcGVlZFByb3BlcnR5LCBtb2RlbC5zaG93U3BlZWRQcm9wZXJ0eSwgbW9kZWwuc2hvd1ZhbHVlc1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3BlZWRvbWV0ZXJOb2RlJyApLCB7XHJcbiAgICAgICAgeDogMzAwLFxyXG4gICAgICAgIHRvcDogOFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggc3BlZWRvbWV0ZXJOb2RlICk7XHJcblxyXG4gICAgLy9DcmVhdGUgYW5kIGFkZCB0aGUgY29udHJvbCBwYW5lbFxyXG4gICAgY29uc3QgY29udHJvbFBhbmVsID0gbmV3IE1vdGlvbkNvbnRyb2xQYW5lbCggbW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250cm9sUGFuZWwnICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvbnRyb2xQYW5lbCApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgcGxheSwgcGF1c2UsIGFuZCBzdGVwIGJ1dHRvbnNcclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ1dHRvbiA9IG5ldyBQbGF5UGF1c2VCdXR0b24oIG1vZGVsLnBsYXlQcm9wZXJ0eSwge1xyXG4gICAgICByYWRpdXM6IDE4LFxyXG4gICAgICBzY2FsZUZhY3RvcldoZW5Ob3RQbGF5aW5nOiAxLjI4LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbGF5UGF1c2VCdXR0b24nIClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHN0ZXBGb3J3YXJkQnV0dG9uID0gbmV3IFN0ZXBGb3J3YXJkQnV0dG9uKCB7XHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogRGVyaXZlZFByb3BlcnR5Lm5vdCggbW9kZWwucGxheVByb3BlcnR5ICksXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7IG1vZGVsLm1hbnVhbFN0ZXAoKTsgfSxcclxuICAgICAgcmFkaXVzOiAxOCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RlcEZvcndhcmRCdXR0b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwbGF5LCBzdGVwLCBhbmQgcmVzZXQgYnV0dG9ucyBpbiBhbiBIQm94IGFsaWduZWQgbGVmdCBib3R0b20gdW5kZXIgdGhlIGNvbnRyb2wgcGFuZWxcclxuICAgIGNvbnN0IHBsYXlQYXVzZVZlcnRpY2FsT2Zmc2V0ID0gMzU7XHJcbiAgICBjb25zdCBwbGF5UGF1c2VTdGVwSEJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHBsYXlQYXVzZUJ1dHRvbiwgc3RlcEZvcndhcmRCdXR0b24gXSxcclxuICAgICAgc3BhY2luZzogUExBWV9QQVVTRV9CVUZGRVIsXHJcbiAgICAgIHJlc2l6ZTogZmFsc2UsXHJcbiAgICAgIGxlZnRDZW50ZXI6IGNvbnRyb2xQYW5lbC5sZWZ0Qm90dG9tLnBsdXNYWSggMCwgcGxheVBhdXNlVmVydGljYWxPZmZzZXQgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGxheVBhdXNlU3RlcEhCb3ggKTtcclxuXHJcbiAgICAvL1Jlc2V0IGFsbCBidXR0b24gZ29lcyBiZW5lYXRoIHRoZSBjb250cm9sIHBhbmVsLiAgTm90IGEgY2xvc3VyZSB2YXJpYWJsZSBzaW5jZSBBUEkgYWNjZXNzIGlzIHJlcXVpcmVkLlxyXG4gICAgLy9UT0RPOiBJcyB0aGF0IE9LPyBvciBzaG91bGQgd2UgaW52ZXN0IGR5bmFtaWMgc2VhcmNoL2xvb2t1cHMgdG8ga2VlcCBhcyBjbG9zdXJlIHZhcj9cclxuICAgIHRoaXMucmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByYWRpdXM6IDIzLFxyXG4gICAgICByaWdodENlbnRlcjogY29udHJvbFBhbmVsLnJpZ2h0Qm90dG9tLnBsdXNYWSggMCwgcGxheVBhdXNlVmVydGljYWxPZmZzZXQgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRBbGxCdXR0b24nIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucmVzZXRBbGxCdXR0b24gKTtcclxuXHJcbiAgICAvLyBpMThuIC0gaWYgdGhlIHBsYXkgY29udHJvbCBidXR0b25zIGFyZSB0b28gY2xvc2UgdG8gcmVzZXQgYWxsLCB0aGV5IHNob3VsZCBiZSBzZXBhcmF0ZWRcclxuICAgIGlmICggcGxheVBhdXNlU3RlcEhCb3gucmlnaHQgPiB0aGlzLnJlc2V0QWxsQnV0dG9uLmxlZnQgLSBQTEFZX1BBVVNFX0JVRkZFUiApIHtcclxuICAgICAgcGxheVBhdXNlU3RlcEhCb3gubGVmdENlbnRlciA9IGNvbnRyb2xQYW5lbC5sZWZ0Qm90dG9tLnBsdXNYWSggLTIgKiBQTEFZX1BBVVNFX0JVRkZFUiwgcGxheVBhdXNlVmVydGljYWxPZmZzZXQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvL0FkZCB0aGUgYWNjZWxlcm9tZXRlciwgaWYgb24gdGhlIGZpbmFsIHNjcmVlblxyXG4gICAgaWYgKCBtb2RlbC5hY2NlbGVyb21ldGVyICkge1xyXG5cclxuICAgICAgY29uc3QgYWNjZWxlcm9tZXRlck5vZGUgPSBuZXcgQWNjZWxlcm9tZXRlck5vZGUoIG1vZGVsLmFjY2VsZXJhdGlvblByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWNjZWxlcm9tZXRlck5vZGUnICkgKTtcclxuXHJcbiAgICAgIC8vIGJ1aWxkIHVwIHRoZSBzdHJpbmcgbGFiZWwgZm9yIHRoZSBhY2NlbGVyYXRpb25cclxuICAgICAgY29uc3QgbGFiZWxTdHJpbmcgPSBTdHJpbmdVdGlscy5mb3JtYXQoIHBhdHRlcm4wTmFtZTFWYWx1ZVVuaXRzQWNjZWxlcmF0aW9uU3RyaW5nLCBhY2NlbGVyYXRpb25TdHJpbmcsIG1vZGVsLmFjY2VsZXJhdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIGNvbnN0IGxhYmVsVGV4dCA9IG5ldyBSaWNoVGV4dCggbGFiZWxTdHJpbmcsIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE4ICksXHJcbiAgICAgICAgc3VwU2NhbGU6IDAuNjAsXHJcbiAgICAgICAgc3VwWU9mZnNldDogMixcclxuICAgICAgICBtYXhXaWR0aDogYWNjZWxlcm9tZXRlck5vZGUud2lkdGggKiAzIC8gMlxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBjcmVhdGUgdGhlIHRpY2sgbGFiZWxzXHJcbiAgICAgIGNvbnN0IHRpY2tMYWJlbCA9ICggbGFiZWwsIHRpY2ssIHRhbmRlbUlEICkgPT4gbmV3IFRleHQoIGxhYmVsLCB7XHJcbiAgICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSxcclxuICAgICAgICBjZW50ZXJYOiB0aWNrLmNlbnRlclgsXHJcbiAgICAgICAgdG9wOiB0aWNrLmJvdHRvbSArIDI3LFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggYHRpY2tMYWJlbCR7dGFuZGVtSUR9VGV4dGAgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IHRpY2tMYWJlbHMgPSBuZXcgTm9kZSgge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpY2tMYWJlbHMnICksXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIHRpY2tMYWJlbCggJy0yMCcsIGFjY2VsZXJvbWV0ZXJOb2RlLnRpY2tzWyAwIF0sICdOZWdhdGl2ZTIwJyApLFxyXG4gICAgICAgICAgdGlja0xhYmVsKCAnMCcsIGFjY2VsZXJvbWV0ZXJOb2RlLnRpY2tzWyAyIF0sICdaZXJvJyApLFxyXG4gICAgICAgICAgdGlja0xhYmVsKCAnMjAnLCBhY2NlbGVyb21ldGVyTm9kZS50aWNrc1sgNCBdLCAnUG9zaXRpdmUyMCcgKVxyXG4gICAgICAgIF1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gcHV0IGl0IGFsbCB0b2dldGhlciBpbiBhIFZCb3hcclxuICAgICAgY29uc3QgYWNjZWxlcm9tZXRlcldpdGhUaWNrTGFiZWxzID0gbmV3IE5vZGUoIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhY2NlbGVyb21ldGVyV2l0aFRpY2tMYWJlbHMnICksXHJcbiAgICAgICAgY2hpbGRyZW46IFsgbGFiZWxUZXh0LCBhY2NlbGVyb21ldGVyTm9kZSwgdGlja0xhYmVscyBdLFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgICBjZW50ZXJYOiAzMDAsXHJcbiAgICAgICAgeTogMTcwXHJcbiAgICAgIH0gKTtcclxuICAgICAgbGFiZWxUZXh0LmJvdHRvbSA9IGFjY2VsZXJvbWV0ZXJOb2RlLnRvcDtcclxuICAgICAgdGlja0xhYmVscy50b3AgPSBhY2NlbGVyb21ldGVyTm9kZS5ib3R0b207XHJcbiAgICAgIG1vZGVsLnNob3dBY2NlbGVyYXRpb25Qcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBhY2NlbGVyb21ldGVyV2l0aFRpY2tMYWJlbHMsICd2aXNpYmxlJyApO1xyXG5cclxuICAgICAgdGhpcy5hZGRDaGlsZCggYWNjZWxlcm9tZXRlcldpdGhUaWNrTGFiZWxzICk7XHJcblxyXG4gICAgICAvLyB3aGVuZXZlciBzaG93VmFsdWVzIGFuZCBhY2NsZXJhdGlvbiBjaGFuZ2VzLCB1cGRhdGUgdGhlIGxhYmVsIHRleHRcclxuICAgICAgY29uc3QgaW5pdGlhbExhYmVsV2lkdGggPSBsYWJlbFRleHQud2lkdGg7XHJcbiAgICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbW9kZWwuc2hvd1ZhbHVlc1Byb3BlcnR5LCBtb2RlbC5hY2NlbGVyYXRpb25Qcm9wZXJ0eSBdLCAoIHNob3dWYWx1ZXMsIGFjY2VsZXJhdGlvbiApID0+IHtcclxuICAgICAgICBpZiAoIHNob3dWYWx1ZXMgKSB7XHJcbiAgICAgICAgICBjb25zdCBhY2NlbGVyYXRpb25WYWx1ZSA9IFV0aWxzLnRvRml4ZWQoIGFjY2VsZXJhdGlvbiwgMiApO1xyXG4gICAgICAgICAgbGFiZWxUZXh0LnNldFN0cmluZyggU3RyaW5nVXRpbHMuZm9ybWF0KCBwYXR0ZXJuME5hbWUxVmFsdWVVbml0c0FjY2VsZXJhdGlvblN0cmluZywgYWNjZWxlcmF0aW9uU3RyaW5nLCBhY2NlbGVyYXRpb25WYWx1ZSApICk7XHJcblxyXG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgdGhlIGFjY2VsZXJhdGlvbiByZWFkb3V0IGRvZXMgbm90IHNoaWZ0IGFzIHRoZSB2YWx1ZSBjaGFuZ2VzIGJ5IGNvbXBlbnNhdGluZyBmb3IgdGhlIGNoYW5nZVxyXG4gICAgICAgICAgLy8gaW4gd2lkdGguXHJcbiAgICAgICAgICBsYWJlbFRleHQuY2VudGVyWCA9IGFjY2VsZXJvbWV0ZXJOb2RlLmNlbnRlclggKyAoIGxhYmVsVGV4dC53aWR0aCAtIGluaXRpYWxMYWJlbFdpZHRoICkgLyAyIC0gMTA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgbGFiZWxUZXh0LnNldFN0cmluZyggYWNjZWxlcmF0aW9uU3RyaW5nICk7XHJcbiAgICAgICAgICBsYWJlbFRleHQuY2VudGVyWCA9IGFjY2VsZXJvbWV0ZXJOb2RlLmNlbnRlclg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWFwIHRoZSBpdGVtcyB0byB0aGVpciBjb3JyZWN0IHRvb2xib3gsIG9uZSBvZiBsZWZ0IG9yIHJpZ2h0LCBjb3JyZXNwb25kaW5nIHRvIHRoZSBzaWRlIG9mIHRoZSBzY3JlZW4gdGhhdFxyXG4gICAgLy8gdG9vbGJveCBpcyBzaXR0aW5nIG9uLlxyXG4gICAgY29uc3QgZ2V0SXRlbVNpZGUgPSBpdGVtID0+IHtcclxuICAgICAgLy8gdGhlIGZyaWRnZSBhbmQgdGhlIGNyYXRlcyBib3RoIGdvIGluIGh0ZSBsZWZ0IHRvb2xib3hcclxuICAgICAgaWYgKCBpdGVtLm5hbWUgPT09ICdmcmlkZ2UnIHx8IGl0ZW0ubmFtZSA9PT0gJ2NyYXRlMScgfHwgaXRlbS5uYW1lID09PSAnY3JhdGUyJyApIHtcclxuICAgICAgICByZXR1cm4gJ2xlZnQnO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAncmlnaHQnO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vSXRlcmF0ZSBvdmVyIHRoZSBpdGVtcyBpbiB0aGUgbW9kZWwgYW5kIGNyZWF0ZSBhbmQgYWRkIG5vZGVzIGZvciBlYWNoIG9uZVxyXG4gICAgY29uc3QgbGVmdEl0ZW1MYXllciA9IG5ldyBOb2RlKCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xlZnRJdGVtTGF5ZXInICkgfSApO1xyXG4gICAgY29uc3QgcmlnaHRJdGVtTGF5ZXIgPSBuZXcgTm9kZSggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyaWdodEl0ZW1MYXllcicgKSB9ICk7XHJcbiAgICB0aGlzLml0ZW1Ob2RlcyA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbW9kZWwuaXRlbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGl0ZW0gPSBtb2RlbC5pdGVtc1sgaSBdO1xyXG4gICAgICBjb25zdCBpdGVtU2lkZSA9IGdldEl0ZW1TaWRlKCBpdGVtICk7XHJcbiAgICAgIGNvbnN0IHRvb2xib3hOb2RlID0gaXRlbVNpZGUgPT09ICdsZWZ0JyA/IGxlZnRJdGVtVG9vbGJveE5vZGUgOiByaWdodEl0ZW1Ub29sYm94Tm9kZTtcclxuICAgICAgY29uc3QgaXRlbUxheWVyID0gaXRlbVNpZGUgPT09ICdsZWZ0JyA/IGxlZnRJdGVtTGF5ZXIgOiByaWdodEl0ZW1MYXllcjtcclxuICAgICAgY29uc3QgQ29uc3RydWN0b3IgPSBpdGVtLmJ1Y2tldCA/IFdhdGVyQnVja2V0Tm9kZSA6IEl0ZW1Ob2RlO1xyXG4gICAgICBjb25zdCBpdGVtTm9kZSA9IG5ldyBDb25zdHJ1Y3RvciggbW9kZWwsIHRoaXMsIGl0ZW0sXHJcbiAgICAgICAgaXRlbS5pbWFnZSxcclxuICAgICAgICBpdGVtLnNpdHRpbmdJbWFnZSB8fCBpdGVtLmltYWdlLFxyXG4gICAgICAgIGl0ZW0uaG9sZGluZ0ltYWdlIHx8IGl0ZW0uaW1hZ2UsXHJcbiAgICAgICAgbW9kZWwuc2hvd01hc3Nlc1Byb3BlcnR5LFxyXG4gICAgICAgIHRvb2xib3hOb2RlLFxyXG4gICAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oIGl0ZW0ubmFtZSApICk7XHJcbiAgICAgIHRoaXMuaXRlbU5vZGVzLnB1c2goIGl0ZW1Ob2RlICk7XHJcblxyXG4gICAgICAvL1Byb3ZpZGUgYSByZWZlcmVuY2UgZnJvbSB0aGUgaXRlbSBtb2RlbCB0byBpdHMgdmlldyBzbyB0aGF0IHZpZXcgZGltZW5zaW9ucyBjYW4gYmUgbG9va2VkIHVwIGVhc2lseVxyXG4gICAgICBpdGVtLnZpZXcgPSBpdGVtTm9kZTtcclxuICAgICAgaXRlbUxheWVyLmFkZENoaWxkKCBpdGVtTm9kZSApO1xyXG4gICAgfVxyXG5cclxuICAgIGxlZnRJdGVtVG9vbGJveE5vZGUuYWRkQ2hpbGQoIGxlZnRJdGVtTGF5ZXIgKTtcclxuICAgIHJpZ2h0SXRlbVRvb2xib3hOb2RlLmFkZENoaWxkKCByaWdodEl0ZW1MYXllciApO1xyXG5cclxuICAgIC8vQWRkIHRoZSBmb3JjZSBhcnJvd3MgJiBhc3NvY2lhdGVkIHJlYWRvdXRzIGluIGZyb250IG9mIHRoZSBpdGVtc1xyXG4gICAgY29uc3QgYXJyb3dTY2FsZSA9IDAuMztcclxuXHJcbiAgICAvL1JvdW5kIHRoZSBmb3JjZXMgc28gdGhhdCB0aGUgc3VtIGlzIGNvcnJlY3QgaW4gdGhlIGRpc3BsYXksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZm9yY2VzLWFuZC1tb3Rpb24tYmFzaWNzL2lzc3Vlcy83MiBhbmQgIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3JjZXMtYW5kLW1vdGlvbi1iYXNpY3MvaXNzdWVzLzc0XHJcbiAgICBjb25zdCByb3VuZGVkQXBwbGllZEZvcmNlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIG1vZGVsLmFwcGxpZWRGb3JjZVByb3BlcnR5IF0sXHJcbiAgICAgIGFwcGxpZWRGb3JjZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggYXBwbGllZEZvcmNlICkgKTtcclxuICAgIGNvbnN0IHJvdW5kZWRGcmljdGlvbkZvcmNlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIG1vZGVsLmZyaWN0aW9uRm9yY2VQcm9wZXJ0eSBdLFxyXG4gICAgICBmcmljdGlvbkZvcmNlID0+IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBmcmljdGlvbkZvcmNlICkgKTtcclxuXHJcbiAgICAvL09ubHkgdXBkYXRlIHRoZSBzdW0gZm9yY2UgYXJyb3cgYWZ0ZXIgYm90aCBmcmljdGlvbiBhbmQgYXBwbGllZCBmb3JjZSBjaGFuZ2VkLCBzbyB3ZSBkb24ndCBnZXQgcGFydGlhbCB1cGRhdGVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvcmNlcy1hbmQtbW90aW9uLWJhc2ljcy9pc3N1ZXMvODNcclxuICAgIGNvbnN0IHJvdW5kZWRTdW1Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggcm91bmRlZEFwcGxpZWRGb3JjZVByb3BlcnR5LmdldCgpICsgcm91bmRlZEZyaWN0aW9uRm9yY2VQcm9wZXJ0eS5nZXQoKSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyb3VuZGVkU3VtUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnTidcclxuICAgIH0gKTtcclxuXHJcbiAgICBtb2RlbC5zdGVwRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICByb3VuZGVkU3VtUHJvcGVydHkuc2V0KCByb3VuZGVkQXBwbGllZEZvcmNlUHJvcGVydHkuZ2V0KCkgKyByb3VuZGVkRnJpY3Rpb25Gb3JjZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zdW1BcnJvdyA9IG5ldyBSZWFkb3V0QXJyb3coIHN1bU9mRm9yY2VzU3RyaW5nLCAnIzk2YzgzYycsIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC8gMiwgMjI1LCByb3VuZGVkU3VtUHJvcGVydHksIG1vZGVsLnNob3dWYWx1ZXNQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1bUFycm93JyApLCB7XHJcbiAgICAgICAgbGFiZWxQb3NpdGlvbjogJ3RvcCcsXHJcbiAgICAgICAgYXJyb3dTY2FsZTogYXJyb3dTY2FsZVxyXG4gICAgICB9ICk7XHJcbiAgICB0aGlzLnN1bU9mRm9yY2VzVGV4dCA9IG5ldyBUZXh0KCBzdW1PZkZvcmNlc0VxdWFsc1plcm9TdHJpbmcsIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgY2VudGVyWDogd2lkdGggLyAyLFxyXG4gICAgICB5OiAxOTUsXHJcbiAgICAgIG1heFdpZHRoOiAxMjUsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1bU9mRm9yY2VzVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vSWYgdGhlIChyb3VuZGVkKSBzdW0gb2YgZm9yY2VzIGFycm93IGlzIHplcm8sIHRoZW4gc2hvdyB0aGUgdGV4dCBcIlN1bSBvZiBGb3JjZXMgPSAwXCIsIHNlZSAjNzZcclxuICAgIG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbW9kZWwuc2hvd1N1bU9mRm9yY2VzUHJvcGVydHksIHJvdW5kZWRTdW1Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIHNob3dTdW1PZkZvcmNlcywgc3VtT2ZGb3JjZXMgKSA9PiBzaG93U3VtT2ZGb3JjZXMgJiYgc3VtT2ZGb3JjZXMgPT09IDAgKS5saW5rQXR0cmlidXRlKCB0aGlzLnN1bU9mRm9yY2VzVGV4dCwgJ3Zpc2libGUnICk7XHJcbiAgICB0aGlzLmFwcGxpZWRGb3JjZUFycm93ID0gbmV3IFJlYWRvdXRBcnJvdyggYXBwbGllZEZvcmNlU3RyaW5nLCAnI2U2NmUyMycsIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC8gMiwgMjgwLCByb3VuZGVkQXBwbGllZEZvcmNlUHJvcGVydHksIG1vZGVsLnNob3dWYWx1ZXNQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FwcGxpZWRGb3JjZUFycm93JyApLCB7XHJcbiAgICAgICAgbGFiZWxQb3NpdGlvbjogJ3NpZGUnLFxyXG4gICAgICAgIGFycm93U2NhbGU6IGFycm93U2NhbGVcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5mcmljdGlvbkFycm93ID0gbmV3IFJlYWRvdXRBcnJvdyggZnJpY3Rpb25Gb3JjZVN0cmluZywgJ3JlZCcsIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC8gMiwgMjgwLCByb3VuZGVkRnJpY3Rpb25Gb3JjZVByb3BlcnR5LCBtb2RlbC5zaG93VmFsdWVzUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmcmljdGlvbkFycm93JyApLCB7XHJcbiAgICAgICAgbGFiZWxQb3NpdGlvbjogJ3NpZGUnLFxyXG4gICAgICAgIGFycm93U2NhbGU6IGFycm93U2NhbGVcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIHRvb2xib3hlcyBhbmQgdGhlaXIgY2hpbGRyZW4gc2hvdWxkIGJlIGluIGZyb250IG9mIGFsbCBhYm92ZSBpdGVtc1xyXG4gICAgLy8gY29udGFpbiB0aGUgdG9vbGJveGVzIGluIGEgcGFyZW50IG5vZGUgc28gdGhhdCB3ZSBjYW4gZWFzaWx5IGNoYW5nZSB0aGUgei1vcmRlciBvZiBlYWNoIHRvb2xib3guICBUaGlzIHdheVxyXG4gICAgLy8gaXRlbXMgb2YgdGhlIHJpZ2h0IHRvb2xib3ggd2lsbCBub3QgYmUgbGF5ZXJlZCBpbiBmcm9udCBvZiBpdGVtcyBvZiBsZWZ0IHRvb2xib3ggaXRlbXNcclxuICAgIGNvbnN0IHRvb2xib3hDb250YWluZXIgPSBuZXcgTm9kZSggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b29sYm94Q29udGFpbmVyJyApIH0gKTtcclxuICAgIHRvb2xib3hDb250YWluZXIuYWRkQ2hpbGQoIGxlZnRJdGVtVG9vbGJveE5vZGUgKTtcclxuICAgIHRvb2xib3hDb250YWluZXIuYWRkQ2hpbGQoIHJpZ2h0SXRlbVRvb2xib3hOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0b29sYm94Q29udGFpbmVyICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBmb3JjZSBhcnJvd3MsIHdoaWNoIHNob3VsZCBiZSBpbiBmcm9udCBvZiBhbGwgaXRlbXMgYW5kIHB1c2hlclxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5zdW1BcnJvdyApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5hcHBsaWVkRm9yY2VBcnJvdyApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5mcmljdGlvbkFycm93ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnN1bU9mRm9yY2VzVGV4dCApO1xyXG5cclxuICAgIC8vV2hpY2hldmVyIGFycm93IGlzIHNtYWxsZXIgc2hvdWxkIGJlIGluIGZyb250IChpbiB6LW9yZGVyaW5nKVxyXG4gICAgY29uc3QgZnJpY3Rpb25MYXJnZXJQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgcm91bmRlZEFwcGxpZWRGb3JjZVByb3BlcnR5LCByb3VuZGVkRnJpY3Rpb25Gb3JjZVByb3BlcnR5IF0sXHJcbiAgICAgICggcm91bmRlZEFwcGxpZWRGb3JjZSwgcm91bmRlZEZyaWN0aW9uRm9yY2UgKSA9PiBNYXRoLmFicyggcm91bmRlZEZyaWN0aW9uRm9yY2UgKSA+IE1hdGguYWJzKCByb3VuZGVkQXBwbGllZEZvcmNlICkgKTtcclxuICAgIGZyaWN0aW9uTGFyZ2VyUHJvcGVydHkubGluayggZnJpY3Rpb25MYXJnZXIgPT4ge1xyXG4gICAgICBjb25zdCBub2RlID0gZnJpY3Rpb25MYXJnZXIgPyB0aGlzLmFwcGxpZWRGb3JjZUFycm93IDogdGhpcy5mcmljdGlvbkFycm93O1xyXG4gICAgICBub2RlLm1vdmVUb0Zyb250KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy9PbiB0aGUgbW90aW9uIHNjcmVlbnMsIHdoZW4gdGhlICdGcmljdGlvbicgbGFiZWwgb3ZlcmxhcHMgdGhlIGZvcmNlIHZlY3RvciBpdCBzaG91bGQgYmUgZGlzcGxhY2VkIHZlcnRpY2FsbHlcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbW9kZWwuYXBwbGllZEZvcmNlUHJvcGVydHksIG1vZGVsLmZyaWN0aW9uRm9yY2VQcm9wZXJ0eSBdLCAoIGFwcGxpZWRGb3JjZSwgZnJpY3Rpb25Gb3JjZSApID0+IHtcclxuICAgICAgY29uc3Qgc2FtZURpcmVjdGlvbiA9ICggYXBwbGllZEZvcmNlIDwgMCAmJiBmcmljdGlvbkZvcmNlIDwgMCApIHx8ICggYXBwbGllZEZvcmNlID4gMCAmJiBmcmljdGlvbkZvcmNlID4gMCApO1xyXG4gICAgICB0aGlzLmZyaWN0aW9uQXJyb3cub3ZlcmxhcHNPdGhlciA9IHNhbWVEaXJlY3Rpb247XHJcbiAgICAgIHRoaXMuZnJpY3Rpb25BcnJvdy5sYWJlbFBvc2l0aW9uID0gc2FtZURpcmVjdGlvbiA/ICdib3R0b20nIDogJ3NpZGUnO1xyXG5cclxuICAgICAgLy8gdGhlIGFwcGxpZWQgZm9yY2UgYXJyb3cgbXVzdCBiZSB1cGRhdGVkIGRpcmVjdGx5IHNpbmNlIGl0cyBsYWJlbCBwb3NpdGlvbiBkb2Vzbid0IGNoYW5nZVxyXG4gICAgICB0aGlzLmFwcGxpZWRGb3JjZUFycm93Lm92ZXJsYXBzT3RoZXIgPSBzYW1lRGlyZWN0aW9uO1xyXG4gICAgICB0aGlzLmFwcGxpZWRGb3JjZUFycm93LnVwZGF0ZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIG1vZGVsLnNob3dGb3JjZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMuYXBwbGllZEZvcmNlQXJyb3csICd2aXNpYmxlJyApO1xyXG4gICAgbW9kZWwuc2hvd0ZvcmNlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdGhpcy5mcmljdGlvbkFycm93LCAndmlzaWJsZScgKTtcclxuICAgIG1vZGVsLnNob3dTdW1PZkZvcmNlc1Byb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMuc3VtQXJyb3csICd2aXNpYmxlJyApO1xyXG5cclxuICAgIC8vQWZ0ZXIgdGhlIHZpZXcgaXMgY29uc3RydWN0ZWQsIG1vdmUgb25lIG9mIHRoZSBibG9ja3MgdG8gdGhlIHRvcCBvZiB0aGUgc3RhY2suXHJcbiAgICBtb2RlbC52aWV3SW5pdGlhbGl6ZWQoIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlIEdldCB0aGUgaGVpZ2h0IG9mIHRoZSBvYmplY3RzIGluIHRoZSBzdGFjayAoZG9lc24ndCBpbmNsdWRlIHNrYXRlYm9hcmQpXHJcbiAgZ2V0IHN0YWNrSGVpZ2h0KCkge1xyXG4gICAgbGV0IHN1bSA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm1vZGVsLnN0YWNrLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBzdW0gPSBzdW0gKyB0aGlzLm1vZGVsLnN0YWNrLmdldCggaSApLnZpZXcuaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1bTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgRmluZCB0aGUgdG9wIG9mIHRoZSBzdGFjaywgc28gdGhhdCBhIG5ldyBvYmplY3QgY2FuIGJlIHBsYWNlZCBvbiB0b3BcclxuICBnZXQgdG9wT2ZTdGFjaygpIHtcclxuICAgIGNvbnN0IG4gPSB0aGlzLm1vZGVsLnNrYXRlYm9hcmQgPyAzMzQgOiAzNjA7XHJcbiAgICByZXR1cm4gbiAtIHRoaXMuc3RhY2tIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIEdldCB0aGUgc2l6ZSBvZiBhbiBpdGVtJ3MgaW1hZ2UuICBEZXBlbmRlbnQgb24gdGhlIGN1cnJlbnQgc2NhbGUgb2YgdGhlIGltYWdlLlxyXG4gIGdldFNpemUoIGl0ZW0gKSB7XHJcbiAgICAvLyBnZXQgdGhlIGN1cnJlbnQgc2NhbGUgZm9yIHRoZSBlbGVtZW50IGFuZCBhcHBseSBpdCB0byB0aGUgaW1hZ2VcclxuICAgIGNvbnN0IHNjYWxlZFdpZHRoID0gaXRlbS52aWV3LnNpdHRpbmdJbWFnZS53aWR0aCAqIGl0ZW0uZ2V0Q3VycmVudFNjYWxlKCk7XHJcbiAgICByZXR1cm4geyB3aWR0aDogc2NhbGVkV2lkdGgsIGhlaWdodDogaXRlbS52aWV3LmhlaWdodCB9O1xyXG4gIH1cclxufVxyXG5cclxuZm9yY2VzQW5kTW90aW9uQmFzaWNzLnJlZ2lzdGVyKCAnTW90aW9uU2NyZWVuVmlldycsIE1vdGlvblNjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW90aW9uU2NyZWVuVmlldztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxL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