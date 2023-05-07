// Copyright 2014-2023, University of Colorado Boulder

/**
 * Screen view for the tab where the user makes isotopes of a given element by adding and removing neutrons.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Bucket from '../../../../phetcommon/js/model/Bucket.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import BucketDragListener from '../../../../shred/js/view/BucketDragListener.js';
import ExpandedPeriodicTableNode from '../../../../shred/js/view/ExpandedPeriodicTableNode.js';
import IsotopeCanvasNode from '../../../../shred/js/view/IsotopeCanvasNode.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import HSlider from '../../../../sun/js/HSlider.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';
import MixIsotopesModel from '../model/MixIsotopesModel.js';
import AverageAtomicMassIndicator from './AverageAtomicMassIndicator.js';
import ControlIsotope from './ControlIsotope.js';
import IsotopeProportionsPieChart from './IsotopeProportionsPieChart.js';
const averageAtomicMassString = IsotopesAndAtomicMassStrings.averageAtomicMass;
const isotopeMixtureString = IsotopesAndAtomicMassStrings.isotopeMixture;
const myMixString = IsotopesAndAtomicMassStrings.myMix;
const naturesMixString = IsotopesAndAtomicMassStrings.naturesMix;
const percentCompositionString = IsotopesAndAtomicMassStrings.percentComposition;

// constants
const MAX_SLIDER_WIDTH = 99.75; //empirically determined

class MixIsotopesScreenView extends ScreenView {
  /**
   * @param {MixIsotopesModel} mixIsotopesModel
   * @param {Tandem} tandem
   */
  constructor(mixIsotopesModel, tandem) {
    super({
      layoutBounds: ShredConstants.LAYOUT_BOUNDS
    });
    this.model = mixIsotopesModel;
    const self = this;
    this.updatePieChart = true; // track when to update pie chart in the animation frame

    // Set up the model view transform. The test chamber is centered at (0, 0) in model space, and this transform is set
    // up to place the chamber where we want it on the canvas.  The multiplier factors for the 2nd point can be adjusted
    // to shift the center right or left, and the scale factor can be adjusted to zoom in or out (smaller numbers zoom
    // out, larger ones zoom in).
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(Utils.roundSymmetric(this.layoutBounds.width * 0.32), Utils.roundSymmetric(this.layoutBounds.height * 0.33)), 1.0);

    // Add the nodes that will allow the canvas to be layered.
    const controlsLayer = new Node();
    this.addChild(controlsLayer);
    const bucketHoleLayer = new Node();
    this.addChild(bucketHoleLayer);
    const chamberLayer = new Node();
    this.addChild(chamberLayer);

    // rendering these two nodes at last so that isotopes are at the over everything but behind the bucket
    const isotopeLayer = new Node();
    const bucketFrontLayer = new Node();

    // buckets
    const addBucketView = addedBucket => {
      const bucketHole = new BucketHole(addedBucket, this.modelViewTransform);
      const bucketFront = new BucketFront(addedBucket, this.modelViewTransform);
      bucketFront.addInputListener(new BucketDragListener(addedBucket, bucketFront, this.modelViewTransform));

      // Bucket hole is first item added to view for proper layering.
      bucketHoleLayer.addChild(bucketHole);
      bucketFrontLayer.addChild(bucketFront);
      bucketFront.moveToFront();
      mixIsotopesModel.bucketList.addItemRemovedListener(function removalListener(removedBucket) {
        if (removedBucket === addedBucket) {
          bucketHoleLayer.removeChild(bucketHole);
          bucketFront.interruptSubtreeInput(); // cancel any in-progress interactions, prevents multi-touch issues
          bucketFrontLayer.removeChild(bucketFront);
          mixIsotopesModel.bucketList.removeItemRemovedListener(removalListener);
        }
      });
    };
    mixIsotopesModel.bucketList.addItemAddedListener(addedBucket => {
      addBucketView(addedBucket);
    });
    mixIsotopesModel.bucketList.forEach(addedBucket => {
      addBucketView(addedBucket);
    });

    // isotopes
    const addIsotopeView = addedIsotope => {
      const isotopeView = new ParticleView(addedIsotope, this.modelViewTransform);
      isotopeView.center = this.modelViewTransform.modelToViewPosition(addedIsotope.positionProperty.get());
      isotopeView.pickable = mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS;
      isotopeLayer.addChild(isotopeView);
      const moveToFront = value => {
        if (value) {
          isotopeView.moveToFront();
        }
      };
      addedIsotope.userControlledProperty.link(moveToFront);
      mixIsotopesModel.isotopesList.addItemRemovedListener(function removalListener(removedIsotope) {
        if (removedIsotope === addedIsotope) {
          isotopeLayer.removeChild(isotopeView);
          addedIsotope.userControlledProperty.unlink(moveToFront);
          isotopeView.dispose();
          mixIsotopesModel.isotopesList.removeItemRemovedListener(removalListener);
        }
      });
    };
    mixIsotopesModel.isotopesList.forEach(addedIsotope => {
      addIsotopeView(addedIsotope);
    });
    mixIsotopesModel.isotopesList.addItemAddedListener(addedIsotope => {
      if (mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS) {
        addIsotopeView(addedIsotope);
      } else {
        this.isotopesLayer.setIsotopes(this.model.isotopesList);
        mixIsotopesModel.isotopesList.addItemRemovedListener(function removalListener(removedIsotope) {
          if (removedIsotope === addedIsotope) {
            self.isotopesLayer.setIsotopes(self.model.isotopesList);
            mixIsotopesModel.isotopesList.removeItemRemovedListener(removalListener);
          }
        });
      }
    });

    // numeric controllers
    mixIsotopesModel.numericalControllerList.addItemAddedListener(addedController => {
      const controllerView = new ControlIsotope(addedController, 0, 100);
      const center_pos = this.modelViewTransform.modelToViewPosition(addedController.centerPosition);
      controllerView.centerY = center_pos.y;
      // if the width of slider decreases due to thumb position, keep the left position fixed
      controllerView.left = center_pos.x - MAX_SLIDER_WIDTH / 2;
      controlsLayer.addChild(controllerView);
      mixIsotopesModel.numericalControllerList.addItemRemovedListener(function removalListener(removedController) {
        if (removedController === addedController) {
          controlsLayer.removeChild(controllerView);
          controllerView.dispose();
          mixIsotopesModel.numericalControllerList.removeItemRemovedListener(removalListener);
        }
      });
    });

    // test chamber
    const testChamberNode = new Rectangle(this.modelViewTransform.modelToViewBounds(this.model.testChamber.getTestChamberRect()), {
      fill: 'black',
      lineWidth: 1
    });
    chamberLayer.addChild(testChamberNode);
    this.isotopesLayer = new IsotopeCanvasNode(this.model.naturesIsotopesList, this.modelViewTransform, {
      canvasBounds: this.modelViewTransform.modelToViewBounds(this.model.testChamber.getTestChamberRect())
    });
    this.addChild(this.isotopesLayer);
    this.isotopesLayer.visible = false;
    this.model.naturesIsotopeUpdated.addListener(() => {
      this.isotopesLayer.setIsotopes(this.model.naturesIsotopesList);
    });
    const clearBoxButton = new EraserButton({
      baseColor: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      listener: () => {
        mixIsotopesModel.clearBox();
      }
    });
    this.addChild(clearBoxButton);
    clearBoxButton.top = chamberLayer.bottom + 5;
    clearBoxButton.left = chamberLayer.left;

    // Add the interactive periodic table that allows the user to select the current element.
    const periodicTableNode = new ExpandedPeriodicTableNode(mixIsotopesModel.selectedAtomConfig, 18, {
      tandem: tandem
    });
    periodicTableNode.scale(0.55);
    periodicTableNode.top = 10;
    periodicTableNode.right = this.layoutBounds.width - 10;
    this.addChild(periodicTableNode);

    // pie chart
    this.isotopeProportionsPieChart = new IsotopeProportionsPieChart(this.model);
    this.isotopeProportionsPieChart.scale(0.6);
    this.isotopeProportionsPieChart.centerX = this.isotopeProportionsPieChart.centerX + 150; // Empirically determined
    const compositionBox = new AccordionBox(this.isotopeProportionsPieChart, {
      cornerRadius: 3,
      titleNode: new Text(percentCompositionString, {
        font: ShredConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      }),
      fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property(true),
      minWidth: periodicTableNode.width,
      maxWidth: periodicTableNode.width,
      contentAlign: 'center',
      titleAlignX: 'left',
      buttonAlign: 'right',
      expandCollapseButtonOptions: {
        touchAreaXDilation: 16,
        touchAreaYDilation: 16
      }
    });
    compositionBox.left = periodicTableNode.left;
    compositionBox.top = periodicTableNode.bottom + 15;
    this.addChild(compositionBox);
    const averageAtomicMassBox = new AccordionBox(new AverageAtomicMassIndicator(this.model), {
      cornerRadius: 3,
      titleNode: new Text(averageAtomicMassString, {
        font: ShredConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      }),
      fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property(true),
      minWidth: periodicTableNode.width,
      maxWidth: periodicTableNode.width,
      contentAlign: 'center',
      titleAlignX: 'left',
      buttonAlign: 'right',
      expandCollapseButtonOptions: {
        touchAreaXDilation: 16,
        touchAreaYDilation: 16
      }
    });
    averageAtomicMassBox.left = compositionBox.left;
    averageAtomicMassBox.top = compositionBox.bottom + 10;
    this.addChild(averageAtomicMassBox);
    const interactivityModeSelectionNode = new InteractivityModeSelectionNode(mixIsotopesModel, this.modelViewTransform);
    interactivityModeSelectionNode.right = testChamberNode.right;
    interactivityModeSelectionNode.top = testChamberNode.bottom + 5;
    this.addChild(interactivityModeSelectionNode);
    const isotopeMixtureSelectionNode = new IsotopeMixtureSelectionNode(mixIsotopesModel.showingNaturesMixProperty);
    isotopeMixtureSelectionNode.top = averageAtomicMassBox.bottom + 10;
    isotopeMixtureSelectionNode.left = averageAtomicMassBox.left;
    this.addChild(isotopeMixtureSelectionNode);

    // Create and add the reset all button in the bottom right, which resets the model.
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel any interactions that are in progress
        mixIsotopesModel.reset();
        compositionBox.expandedProperty.reset();
        averageAtomicMassBox.expandedProperty.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    });
    resetAllButton.scale(0.85);
    this.addChild(resetAllButton);
    this.addChild(isotopeLayer);
    this.addChild(bucketFrontLayer);

    // Update component visibility based on whether "nature's mix" is being shown.  This doesn't need unlink as it stays
    // throughout the sim life.
    mixIsotopesModel.showingNaturesMixProperty.link(() => {
      if (mixIsotopesModel.showingNaturesMixProperty.get() === true) {
        interactivityModeSelectionNode.visible = false;
        clearBoxButton.visible = false;
        this.isotopesLayer.visible = true;
      } else {
        interactivityModeSelectionNode.visible = true;
        clearBoxButton.visible = true;
        this.isotopesLayer.visible = false;
      }
      if (mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.SLIDERS_AND_SMALL_ATOMS && mixIsotopesModel.showingNaturesMixProperty.get() === false) {
        this.isotopesLayer.visible = true;
        this.isotopesLayer.setIsotopes(this.model.isotopesList);
      }
    });

    // Update the visibility of the isotopes based on the interactivity mode, doesn't need unlink as it stays throughout
    // the sim life.
    mixIsotopesModel.interactivityModeProperty.link(() => {
      if (mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS) {
        this.isotopesLayer.visible = false;
      } else {
        this.isotopesLayer.visible = true;
        this.isotopesLayer.setIsotopes(this.model.isotopesList);
      }
    });

    // Set the flag to cause the pie chart to get updated when the isotope count changes, doesn't need unlink as it
    // stays throughout the sim life
    mixIsotopesModel.testChamber.isotopeCountProperty.link(() => {
      this.updatePieChart = true;
    });

    // Listen for changes to the model state that can end up leaving particles that are being dragged in odd states,
    // and cancel any interactions with the individual isotopes.  This helps to prevent multi-touch issues such as those
    // described in https://github.com/phetsims/isotopes-and-atomic-mass/issues/101
    Multilink.multilink([mixIsotopesModel.showingNaturesMixProperty, mixIsotopesModel.interactivityModeProperty], () => {
      isotopeLayer.interruptSubtreeInput();
    });
    mixIsotopesModel.selectedAtomConfig.atomUpdated.addListener(() => {
      isotopeLayer.interruptSubtreeInput();
    });
  }

  /**
   * step the time-dependent behavior
   * @public
   */
  step() {
    // As an optimization we update the pie chart once every animation frame in place of updating it every time an
    // isotope is added in the test chamber.
    if (this.updatePieChart) {
      this.isotopeProportionsPieChart.update();
      this.updatePieChart = false;
    }
  }
}

/**
 * selector node containing radio buttons to select between My Mix or Nature's Mix
 */
class IsotopeMixtureSelectionNode extends Node {
  /**
   * @param {Property} isotopeMixtureProperty
   */
  constructor(isotopeMixtureProperty) {
    super();
    const radioButtonRadius = 6;
    const LABEL_FONT = new PhetFont(14);
    const MAX_WIDTH = 160;
    const myMixButton = new AquaRadioButton(isotopeMixtureProperty, false, new Text(myMixString, {
      font: LABEL_FONT,
      maxWidth: MAX_WIDTH
    }), {
      radius: radioButtonRadius
    });
    const naturesMixButton = new AquaRadioButton(isotopeMixtureProperty, true, new Text(naturesMixString, {
      font: LABEL_FONT,
      maxWidth: MAX_WIDTH
    }), {
      radius: radioButtonRadius
    });
    const label = new Text(isotopeMixtureString, {
      font: LABEL_FONT,
      maxWidth: MAX_WIDTH
    });
    this.addChild(label);
    myMixButton.left = 0;
    myMixButton.top = label.bottom + 3;
    this.addChild(myMixButton);
    naturesMixButton.left = 0;
    naturesMixButton.top = myMixButton.bottom + 8;
    this.addChild(naturesMixButton);
  }
}

/**
 * selector node containing radio buttons to select Buckets or Sliders in "My Mix" mode
 */
class InteractivityModeSelectionNode extends RectangularRadioButtonGroup {
  /**
   * @param {MixIsotopesModel} model
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(model, modelViewTransform) {
    const bucketNode = new Node();
    const bucket = new Bucket({
      baseColor: Color.gray,
      size: new Dimension2(50, 30)
    });
    bucketNode.addChild(new BucketHole(bucket, modelViewTransform));
    bucketNode.addChild(new BucketFront(bucket, modelViewTransform));
    bucketNode.scale(0.5);
    const range = new Range(0, 100);
    const slider = new HSlider(new Property(50), range, {
      trackSize: new Dimension2(50, 5),
      thumbSize: new Dimension2(15, 30),
      majorTickLength: 15,
      // pdom - this slider is just an icon and should not have PDOM representation
      tagName: null
    });
    slider.addMajorTick(0);
    slider.addMajorTick(100);
    slider.scale(0.5);
    const radioButtonContent = [{
      value: MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS,
      createNode: () => bucketNode
    }, {
      value: MixIsotopesModel.InteractivityMode.SLIDERS_AND_SMALL_ATOMS,
      createNode: () => slider
    }];
    super(model.interactivityModeProperty, radioButtonContent, {
      orientation: 'horizontal',
      spacing: 5,
      radioButtonOptions: {
        baseColor: Color.white,
        buttonAppearanceStrategyOptions: {
          selectedStroke: '#3291b8',
          selectedLineWidth: 2,
          deselectedContentOpacity: 0.2
        }
      }
    });
  }
}
isotopesAndAtomicMass.register('MixIsotopesScreenView', MixIsotopesScreenView);
export default MixIsotopesScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJCdWNrZXQiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiQnVja2V0RnJvbnQiLCJCdWNrZXRIb2xlIiwiRXJhc2VyQnV0dG9uIiwiUmVzZXRBbGxCdXR0b24iLCJQaGV0Rm9udCIsIkNvbG9yIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJTaHJlZENvbnN0YW50cyIsIkJ1Y2tldERyYWdMaXN0ZW5lciIsIkV4cGFuZGVkUGVyaW9kaWNUYWJsZU5vZGUiLCJJc290b3BlQ2FudmFzTm9kZSIsIlBhcnRpY2xlVmlldyIsIkFjY29yZGlvbkJveCIsIkFxdWFSYWRpb0J1dHRvbiIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsIkhTbGlkZXIiLCJpc290b3Blc0FuZEF0b21pY01hc3MiLCJJc290b3Blc0FuZEF0b21pY01hc3NTdHJpbmdzIiwiTWl4SXNvdG9wZXNNb2RlbCIsIkF2ZXJhZ2VBdG9taWNNYXNzSW5kaWNhdG9yIiwiQ29udHJvbElzb3RvcGUiLCJJc290b3BlUHJvcG9ydGlvbnNQaWVDaGFydCIsImF2ZXJhZ2VBdG9taWNNYXNzU3RyaW5nIiwiYXZlcmFnZUF0b21pY01hc3MiLCJpc290b3BlTWl4dHVyZVN0cmluZyIsImlzb3RvcGVNaXh0dXJlIiwibXlNaXhTdHJpbmciLCJteU1peCIsIm5hdHVyZXNNaXhTdHJpbmciLCJuYXR1cmVzTWl4IiwicGVyY2VudENvbXBvc2l0aW9uU3RyaW5nIiwicGVyY2VudENvbXBvc2l0aW9uIiwiTUFYX1NMSURFUl9XSURUSCIsIk1peElzb3RvcGVzU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibWl4SXNvdG9wZXNNb2RlbCIsInRhbmRlbSIsImxheW91dEJvdW5kcyIsIkxBWU9VVF9CT1VORFMiLCJtb2RlbCIsInNlbGYiLCJ1cGRhdGVQaWVDaGFydCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nIiwiWkVSTyIsInJvdW5kU3ltbWV0cmljIiwid2lkdGgiLCJoZWlnaHQiLCJjb250cm9sc0xheWVyIiwiYWRkQ2hpbGQiLCJidWNrZXRIb2xlTGF5ZXIiLCJjaGFtYmVyTGF5ZXIiLCJpc290b3BlTGF5ZXIiLCJidWNrZXRGcm9udExheWVyIiwiYWRkQnVja2V0VmlldyIsImFkZGVkQnVja2V0IiwiYnVja2V0SG9sZSIsImJ1Y2tldEZyb250IiwiYWRkSW5wdXRMaXN0ZW5lciIsIm1vdmVUb0Zyb250IiwiYnVja2V0TGlzdCIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmFsTGlzdGVuZXIiLCJyZW1vdmVkQnVja2V0IiwicmVtb3ZlQ2hpbGQiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJmb3JFYWNoIiwiYWRkSXNvdG9wZVZpZXciLCJhZGRlZElzb3RvcGUiLCJpc290b3BlVmlldyIsImNlbnRlciIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwiZ2V0IiwicGlja2FibGUiLCJpbnRlcmFjdGl2aXR5TW9kZVByb3BlcnR5IiwiSW50ZXJhY3Rpdml0eU1vZGUiLCJCVUNLRVRTX0FORF9MQVJHRV9BVE9NUyIsInZhbHVlIiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImxpbmsiLCJpc290b3Blc0xpc3QiLCJyZW1vdmVkSXNvdG9wZSIsInVubGluayIsImRpc3Bvc2UiLCJpc290b3Blc0xheWVyIiwic2V0SXNvdG9wZXMiLCJudW1lcmljYWxDb250cm9sbGVyTGlzdCIsImFkZGVkQ29udHJvbGxlciIsImNvbnRyb2xsZXJWaWV3IiwiY2VudGVyX3BvcyIsImNlbnRlclBvc2l0aW9uIiwiY2VudGVyWSIsInkiLCJsZWZ0IiwieCIsInJlbW92ZWRDb250cm9sbGVyIiwidGVzdENoYW1iZXJOb2RlIiwibW9kZWxUb1ZpZXdCb3VuZHMiLCJ0ZXN0Q2hhbWJlciIsImdldFRlc3RDaGFtYmVyUmVjdCIsImZpbGwiLCJsaW5lV2lkdGgiLCJuYXR1cmVzSXNvdG9wZXNMaXN0IiwiY2FudmFzQm91bmRzIiwidmlzaWJsZSIsIm5hdHVyZXNJc290b3BlVXBkYXRlZCIsImFkZExpc3RlbmVyIiwiY2xlYXJCb3hCdXR0b24iLCJiYXNlQ29sb3IiLCJESVNQTEFZX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IiLCJsaXN0ZW5lciIsImNsZWFyQm94IiwidG9wIiwiYm90dG9tIiwicGVyaW9kaWNUYWJsZU5vZGUiLCJzZWxlY3RlZEF0b21Db25maWciLCJzY2FsZSIsInJpZ2h0IiwiaXNvdG9wZVByb3BvcnRpb25zUGllQ2hhcnQiLCJjZW50ZXJYIiwiY29tcG9zaXRpb25Cb3giLCJjb3JuZXJSYWRpdXMiLCJ0aXRsZU5vZGUiLCJmb250IiwiQUNDT1JESU9OX0JPWF9USVRMRV9GT05UIiwibWF4V2lkdGgiLCJBQ0NPUkRJT05fQk9YX1RJVExFX01BWF9XSURUSCIsImV4cGFuZGVkUHJvcGVydHkiLCJtaW5XaWR0aCIsImNvbnRlbnRBbGlnbiIsInRpdGxlQWxpZ25YIiwiYnV0dG9uQWxpZ24iLCJleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJhdmVyYWdlQXRvbWljTWFzc0JveCIsImludGVyYWN0aXZpdHlNb2RlU2VsZWN0aW9uTm9kZSIsIkludGVyYWN0aXZpdHlNb2RlU2VsZWN0aW9uTm9kZSIsImlzb3RvcGVNaXh0dXJlU2VsZWN0aW9uTm9kZSIsIklzb3RvcGVNaXh0dXJlU2VsZWN0aW9uTm9kZSIsInNob3dpbmdOYXR1cmVzTWl4UHJvcGVydHkiLCJyZXNldEFsbEJ1dHRvbiIsInJlc2V0IiwibWF4WCIsIm1heFkiLCJTTElERVJTX0FORF9TTUFMTF9BVE9NUyIsImlzb3RvcGVDb3VudFByb3BlcnR5IiwibXVsdGlsaW5rIiwiYXRvbVVwZGF0ZWQiLCJzdGVwIiwidXBkYXRlIiwiaXNvdG9wZU1peHR1cmVQcm9wZXJ0eSIsInJhZGlvQnV0dG9uUmFkaXVzIiwiTEFCRUxfRk9OVCIsIk1BWF9XSURUSCIsIm15TWl4QnV0dG9uIiwicmFkaXVzIiwibmF0dXJlc01peEJ1dHRvbiIsImxhYmVsIiwiYnVja2V0Tm9kZSIsImJ1Y2tldCIsImdyYXkiLCJzaXplIiwicmFuZ2UiLCJzbGlkZXIiLCJ0cmFja1NpemUiLCJ0aHVtYlNpemUiLCJtYWpvclRpY2tMZW5ndGgiLCJ0YWdOYW1lIiwiYWRkTWFqb3JUaWNrIiwicmFkaW9CdXR0b25Db250ZW50IiwiY3JlYXRlTm9kZSIsIm9yaWVudGF0aW9uIiwic3BhY2luZyIsInJhZGlvQnV0dG9uT3B0aW9ucyIsIndoaXRlIiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyIsInNlbGVjdGVkU3Ryb2tlIiwic2VsZWN0ZWRMaW5lV2lkdGgiLCJkZXNlbGVjdGVkQ29udGVudE9wYWNpdHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1peElzb3RvcGVzU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY3JlZW4gdmlldyBmb3IgdGhlIHRhYiB3aGVyZSB0aGUgdXNlciBtYWtlcyBpc290b3BlcyBvZiBhIGdpdmVuIGVsZW1lbnQgYnkgYWRkaW5nIGFuZCByZW1vdmluZyBuZXV0cm9ucy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKiBAYXV0aG9yIEphbWVzIFNtaXRoXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBCdWNrZXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9CdWNrZXQuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBCdWNrZXRGcm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnVja2V0L0J1Y2tldEZyb250LmpzJztcclxuaW1wb3J0IEJ1Y2tldEhvbGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1Y2tldC9CdWNrZXRIb2xlLmpzJztcclxuaW1wb3J0IEVyYXNlckJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9FcmFzZXJCdXR0b24uanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBTaHJlZENvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9TaHJlZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCdWNrZXREcmFnTGlzdGVuZXIgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvdmlldy9CdWNrZXREcmFnTGlzdGVuZXIuanMnO1xyXG5pbXBvcnQgRXhwYW5kZWRQZXJpb2RpY1RhYmxlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy92aWV3L0V4cGFuZGVkUGVyaW9kaWNUYWJsZU5vZGUuanMnO1xyXG5pbXBvcnQgSXNvdG9wZUNhbnZhc05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvdmlldy9Jc290b3BlQ2FudmFzTm9kZS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZVZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvdmlldy9QYXJ0aWNsZVZpZXcuanMnO1xyXG5pbXBvcnQgQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b24uanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IGlzb3RvcGVzQW5kQXRvbWljTWFzcyBmcm9tICcuLi8uLi9pc290b3Blc0FuZEF0b21pY01hc3MuanMnO1xyXG5pbXBvcnQgSXNvdG9wZXNBbmRBdG9taWNNYXNzU3RyaW5ncyBmcm9tICcuLi8uLi9Jc290b3Blc0FuZEF0b21pY01hc3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IE1peElzb3RvcGVzTW9kZWwgZnJvbSAnLi4vbW9kZWwvTWl4SXNvdG9wZXNNb2RlbC5qcyc7XHJcbmltcG9ydCBBdmVyYWdlQXRvbWljTWFzc0luZGljYXRvciBmcm9tICcuL0F2ZXJhZ2VBdG9taWNNYXNzSW5kaWNhdG9yLmpzJztcclxuaW1wb3J0IENvbnRyb2xJc290b3BlIGZyb20gJy4vQ29udHJvbElzb3RvcGUuanMnO1xyXG5pbXBvcnQgSXNvdG9wZVByb3BvcnRpb25zUGllQ2hhcnQgZnJvbSAnLi9Jc290b3BlUHJvcG9ydGlvbnNQaWVDaGFydC5qcyc7XHJcblxyXG5jb25zdCBhdmVyYWdlQXRvbWljTWFzc1N0cmluZyA9IElzb3RvcGVzQW5kQXRvbWljTWFzc1N0cmluZ3MuYXZlcmFnZUF0b21pY01hc3M7XHJcbmNvbnN0IGlzb3RvcGVNaXh0dXJlU3RyaW5nID0gSXNvdG9wZXNBbmRBdG9taWNNYXNzU3RyaW5ncy5pc290b3BlTWl4dHVyZTtcclxuY29uc3QgbXlNaXhTdHJpbmcgPSBJc290b3Blc0FuZEF0b21pY01hc3NTdHJpbmdzLm15TWl4O1xyXG5jb25zdCBuYXR1cmVzTWl4U3RyaW5nID0gSXNvdG9wZXNBbmRBdG9taWNNYXNzU3RyaW5ncy5uYXR1cmVzTWl4O1xyXG5jb25zdCBwZXJjZW50Q29tcG9zaXRpb25TdHJpbmcgPSBJc290b3Blc0FuZEF0b21pY01hc3NTdHJpbmdzLnBlcmNlbnRDb21wb3NpdGlvbjtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVhfU0xJREVSX1dJRFRIID0gOTkuNzU7IC8vZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuY2xhc3MgTWl4SXNvdG9wZXNTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWl4SXNvdG9wZXNNb2RlbH0gbWl4SXNvdG9wZXNNb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbWl4SXNvdG9wZXNNb2RlbCwgdGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHsgbGF5b3V0Qm91bmRzOiBTaHJlZENvbnN0YW50cy5MQVlPVVRfQk9VTkRTIH0gKTtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0gbWl4SXNvdG9wZXNNb2RlbDtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy51cGRhdGVQaWVDaGFydCA9IHRydWU7IC8vIHRyYWNrIHdoZW4gdG8gdXBkYXRlIHBpZSBjaGFydCBpbiB0aGUgYW5pbWF0aW9uIGZyYW1lXHJcblxyXG4gICAgLy8gU2V0IHVwIHRoZSBtb2RlbCB2aWV3IHRyYW5zZm9ybS4gVGhlIHRlc3QgY2hhbWJlciBpcyBjZW50ZXJlZCBhdCAoMCwgMCkgaW4gbW9kZWwgc3BhY2UsIGFuZCB0aGlzIHRyYW5zZm9ybSBpcyBzZXRcclxuICAgIC8vIHVwIHRvIHBsYWNlIHRoZSBjaGFtYmVyIHdoZXJlIHdlIHdhbnQgaXQgb24gdGhlIGNhbnZhcy4gIFRoZSBtdWx0aXBsaWVyIGZhY3RvcnMgZm9yIHRoZSAybmQgcG9pbnQgY2FuIGJlIGFkanVzdGVkXHJcbiAgICAvLyB0byBzaGlmdCB0aGUgY2VudGVyIHJpZ2h0IG9yIGxlZnQsIGFuZCB0aGUgc2NhbGUgZmFjdG9yIGNhbiBiZSBhZGp1c3RlZCB0byB6b29tIGluIG9yIG91dCAoc21hbGxlciBudW1iZXJzIHpvb21cclxuICAgIC8vIG91dCwgbGFyZ2VyIG9uZXMgem9vbSBpbikuXHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICogMC4zMiApLFxyXG4gICAgICAgIFV0aWxzLnJvdW5kU3ltbWV0cmljKCB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgKiAwLjMzIClcclxuICAgICAgKSxcclxuICAgICAgMS4wXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbm9kZXMgdGhhdCB3aWxsIGFsbG93IHRoZSBjYW52YXMgdG8gYmUgbGF5ZXJlZC5cclxuICAgIGNvbnN0IGNvbnRyb2xzTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY29udHJvbHNMYXllciApO1xyXG4gICAgY29uc3QgYnVja2V0SG9sZUxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJ1Y2tldEhvbGVMYXllciApO1xyXG4gICAgY29uc3QgY2hhbWJlckxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNoYW1iZXJMYXllciApO1xyXG5cclxuICAgIC8vIHJlbmRlcmluZyB0aGVzZSB0d28gbm9kZXMgYXQgbGFzdCBzbyB0aGF0IGlzb3RvcGVzIGFyZSBhdCB0aGUgb3ZlciBldmVyeXRoaW5nIGJ1dCBiZWhpbmQgdGhlIGJ1Y2tldFxyXG4gICAgY29uc3QgaXNvdG9wZUxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IGJ1Y2tldEZyb250TGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIC8vIGJ1Y2tldHNcclxuICAgIGNvbnN0IGFkZEJ1Y2tldFZpZXcgPSBhZGRlZEJ1Y2tldCA9PiB7XHJcbiAgICAgIGNvbnN0IGJ1Y2tldEhvbGUgPSBuZXcgQnVja2V0SG9sZSggYWRkZWRCdWNrZXQsIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtICk7XHJcbiAgICAgIGNvbnN0IGJ1Y2tldEZyb250ID0gbmV3IEJ1Y2tldEZyb250KCBhZGRlZEJ1Y2tldCwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuICAgICAgYnVja2V0RnJvbnQuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEJ1Y2tldERyYWdMaXN0ZW5lciggYWRkZWRCdWNrZXQsIGJ1Y2tldEZyb250LCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSApICk7XHJcblxyXG4gICAgICAvLyBCdWNrZXQgaG9sZSBpcyBmaXJzdCBpdGVtIGFkZGVkIHRvIHZpZXcgZm9yIHByb3BlciBsYXllcmluZy5cclxuICAgICAgYnVja2V0SG9sZUxheWVyLmFkZENoaWxkKCBidWNrZXRIb2xlICk7XHJcbiAgICAgIGJ1Y2tldEZyb250TGF5ZXIuYWRkQ2hpbGQoIGJ1Y2tldEZyb250ICk7XHJcbiAgICAgIGJ1Y2tldEZyb250Lm1vdmVUb0Zyb250KCk7XHJcblxyXG4gICAgICBtaXhJc290b3Blc01vZGVsLmJ1Y2tldExpc3QuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggZnVuY3Rpb24gcmVtb3ZhbExpc3RlbmVyKCByZW1vdmVkQnVja2V0ICkge1xyXG4gICAgICAgIGlmICggcmVtb3ZlZEJ1Y2tldCA9PT0gYWRkZWRCdWNrZXQgKSB7XHJcbiAgICAgICAgICBidWNrZXRIb2xlTGF5ZXIucmVtb3ZlQ2hpbGQoIGJ1Y2tldEhvbGUgKTtcclxuICAgICAgICAgIGJ1Y2tldEZyb250LmludGVycnVwdFN1YnRyZWVJbnB1dCgpOyAvLyBjYW5jZWwgYW55IGluLXByb2dyZXNzIGludGVyYWN0aW9ucywgcHJldmVudHMgbXVsdGktdG91Y2ggaXNzdWVzXHJcbiAgICAgICAgICBidWNrZXRGcm9udExheWVyLnJlbW92ZUNoaWxkKCBidWNrZXRGcm9udCApO1xyXG4gICAgICAgICAgbWl4SXNvdG9wZXNNb2RlbC5idWNrZXRMaXN0LnJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBtaXhJc290b3Blc01vZGVsLmJ1Y2tldExpc3QuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGFkZGVkQnVja2V0ID0+IHsgYWRkQnVja2V0VmlldyggYWRkZWRCdWNrZXQgKTsgfSApO1xyXG4gICAgbWl4SXNvdG9wZXNNb2RlbC5idWNrZXRMaXN0LmZvckVhY2goIGFkZGVkQnVja2V0ID0+IHsgYWRkQnVja2V0VmlldyggYWRkZWRCdWNrZXQgKTsgfSApO1xyXG5cclxuICAgIC8vIGlzb3RvcGVzXHJcbiAgICBjb25zdCBhZGRJc290b3BlVmlldyA9IGFkZGVkSXNvdG9wZSA9PiB7XHJcbiAgICAgIGNvbnN0IGlzb3RvcGVWaWV3ID0gbmV3IFBhcnRpY2xlVmlldyggYWRkZWRJc290b3BlLCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG4gICAgICBpc290b3BlVmlldy5jZW50ZXIgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBhZGRlZElzb3RvcGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICBpc290b3BlVmlldy5waWNrYWJsZSA9ICggbWl4SXNvdG9wZXNNb2RlbC5pbnRlcmFjdGl2aXR5TW9kZVByb3BlcnR5LmdldCgpID09PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWl4SXNvdG9wZXNNb2RlbC5JbnRlcmFjdGl2aXR5TW9kZS5CVUNLRVRTX0FORF9MQVJHRV9BVE9NUyApO1xyXG5cclxuICAgICAgaXNvdG9wZUxheWVyLmFkZENoaWxkKCBpc290b3BlVmlldyApO1xyXG5cclxuICAgICAgY29uc3QgbW92ZVRvRnJvbnQgPSB2YWx1ZSA9PiB7XHJcbiAgICAgICAgaWYgKCB2YWx1ZSApIHtcclxuICAgICAgICAgIGlzb3RvcGVWaWV3Lm1vdmVUb0Zyb250KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBhZGRlZElzb3RvcGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCBtb3ZlVG9Gcm9udCApO1xyXG4gICAgICBtaXhJc290b3Blc01vZGVsLmlzb3RvcGVzTGlzdC5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBmdW5jdGlvbiByZW1vdmFsTGlzdGVuZXIoIHJlbW92ZWRJc290b3BlICkge1xyXG4gICAgICAgIGlmICggcmVtb3ZlZElzb3RvcGUgPT09IGFkZGVkSXNvdG9wZSApIHtcclxuICAgICAgICAgIGlzb3RvcGVMYXllci5yZW1vdmVDaGlsZCggaXNvdG9wZVZpZXcgKTtcclxuICAgICAgICAgIGFkZGVkSXNvdG9wZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnVubGluayggbW92ZVRvRnJvbnQgKTtcclxuICAgICAgICAgIGlzb3RvcGVWaWV3LmRpc3Bvc2UoKTtcclxuICAgICAgICAgIG1peElzb3RvcGVzTW9kZWwuaXNvdG9wZXNMaXN0LnJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBtaXhJc290b3Blc01vZGVsLmlzb3RvcGVzTGlzdC5mb3JFYWNoKCBhZGRlZElzb3RvcGUgPT4geyBhZGRJc290b3BlVmlldyggYWRkZWRJc290b3BlICk7IH0gKTtcclxuXHJcbiAgICBtaXhJc290b3Blc01vZGVsLmlzb3RvcGVzTGlzdC5hZGRJdGVtQWRkZWRMaXN0ZW5lciggYWRkZWRJc290b3BlID0+IHtcclxuICAgICAgaWYgKCBtaXhJc290b3Blc01vZGVsLmludGVyYWN0aXZpdHlNb2RlUHJvcGVydHkuZ2V0KCkgPT09XHJcbiAgICAgICAgICAgTWl4SXNvdG9wZXNNb2RlbC5JbnRlcmFjdGl2aXR5TW9kZS5CVUNLRVRTX0FORF9MQVJHRV9BVE9NUyApIHtcclxuICAgICAgICBhZGRJc290b3BlVmlldyggYWRkZWRJc290b3BlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5pc290b3Blc0xheWVyLnNldElzb3RvcGVzKCB0aGlzLm1vZGVsLmlzb3RvcGVzTGlzdCApO1xyXG4gICAgICAgIG1peElzb3RvcGVzTW9kZWwuaXNvdG9wZXNMaXN0LmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGZ1bmN0aW9uIHJlbW92YWxMaXN0ZW5lciggcmVtb3ZlZElzb3RvcGUgKSB7XHJcbiAgICAgICAgICBpZiAoIHJlbW92ZWRJc290b3BlID09PSBhZGRlZElzb3RvcGUgKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaXNvdG9wZXNMYXllci5zZXRJc290b3Blcyggc2VsZi5tb2RlbC5pc290b3Blc0xpc3QgKTtcclxuICAgICAgICAgICAgbWl4SXNvdG9wZXNNb2RlbC5pc290b3Blc0xpc3QucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbnVtZXJpYyBjb250cm9sbGVyc1xyXG4gICAgbWl4SXNvdG9wZXNNb2RlbC5udW1lcmljYWxDb250cm9sbGVyTGlzdC5hZGRJdGVtQWRkZWRMaXN0ZW5lciggYWRkZWRDb250cm9sbGVyID0+IHtcclxuICAgICAgY29uc3QgY29udHJvbGxlclZpZXcgPSBuZXcgQ29udHJvbElzb3RvcGUoIGFkZGVkQ29udHJvbGxlciwgMCwgMTAwICk7XHJcbiAgICAgIGNvbnN0IGNlbnRlcl9wb3MgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBhZGRlZENvbnRyb2xsZXIuY2VudGVyUG9zaXRpb24gKTtcclxuICAgICAgY29udHJvbGxlclZpZXcuY2VudGVyWSA9IGNlbnRlcl9wb3MueTtcclxuICAgICAgLy8gaWYgdGhlIHdpZHRoIG9mIHNsaWRlciBkZWNyZWFzZXMgZHVlIHRvIHRodW1iIHBvc2l0aW9uLCBrZWVwIHRoZSBsZWZ0IHBvc2l0aW9uIGZpeGVkXHJcbiAgICAgIGNvbnRyb2xsZXJWaWV3LmxlZnQgPSBjZW50ZXJfcG9zLnggLSAoIE1BWF9TTElERVJfV0lEVEggLyAyICk7XHJcbiAgICAgIGNvbnRyb2xzTGF5ZXIuYWRkQ2hpbGQoIGNvbnRyb2xsZXJWaWV3ICk7XHJcblxyXG4gICAgICBtaXhJc290b3Blc01vZGVsLm51bWVyaWNhbENvbnRyb2xsZXJMaXN0LmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGZ1bmN0aW9uIHJlbW92YWxMaXN0ZW5lciggcmVtb3ZlZENvbnRyb2xsZXIgKSB7XHJcbiAgICAgICAgaWYgKCByZW1vdmVkQ29udHJvbGxlciA9PT0gYWRkZWRDb250cm9sbGVyICkge1xyXG4gICAgICAgICAgY29udHJvbHNMYXllci5yZW1vdmVDaGlsZCggY29udHJvbGxlclZpZXcgKTtcclxuICAgICAgICAgIGNvbnRyb2xsZXJWaWV3LmRpc3Bvc2UoKTtcclxuICAgICAgICAgIG1peElzb3RvcGVzTW9kZWwubnVtZXJpY2FsQ29udHJvbGxlckxpc3QucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGVzdCBjaGFtYmVyXHJcbiAgICBjb25zdCB0ZXN0Q2hhbWJlck5vZGUgPSBuZXcgUmVjdGFuZ2xlKCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0JvdW5kcyhcclxuICAgICAgdGhpcy5tb2RlbC50ZXN0Q2hhbWJlci5nZXRUZXN0Q2hhbWJlclJlY3QoKSApLCB7XHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogMVxyXG4gICAgfSApO1xyXG4gICAgY2hhbWJlckxheWVyLmFkZENoaWxkKCB0ZXN0Q2hhbWJlck5vZGUgKTtcclxuICAgIHRoaXMuaXNvdG9wZXNMYXllciA9IG5ldyBJc290b3BlQ2FudmFzTm9kZSggdGhpcy5tb2RlbC5uYXR1cmVzSXNvdG9wZXNMaXN0LCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICBjYW52YXNCb3VuZHM6IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3Qm91bmRzKCB0aGlzLm1vZGVsLnRlc3RDaGFtYmVyLmdldFRlc3RDaGFtYmVyUmVjdCgpIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuaXNvdG9wZXNMYXllciApO1xyXG4gICAgdGhpcy5pc290b3Blc0xheWVyLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMubW9kZWwubmF0dXJlc0lzb3RvcGVVcGRhdGVkLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuaXNvdG9wZXNMYXllci5zZXRJc290b3BlcyggdGhpcy5tb2RlbC5uYXR1cmVzSXNvdG9wZXNMaXN0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2xlYXJCb3hCdXR0b24gPSBuZXcgRXJhc2VyQnV0dG9uKCB7XHJcbiAgICAgIGJhc2VDb2xvcjogU2hyZWRDb25zdGFudHMuRElTUExBWV9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIG1peElzb3RvcGVzTW9kZWwuY2xlYXJCb3goKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY2xlYXJCb3hCdXR0b24gKTtcclxuICAgIGNsZWFyQm94QnV0dG9uLnRvcCA9IGNoYW1iZXJMYXllci5ib3R0b20gKyA1O1xyXG4gICAgY2xlYXJCb3hCdXR0b24ubGVmdCA9IGNoYW1iZXJMYXllci5sZWZ0O1xyXG5cclxuICAgIC8vIEFkZCB0aGUgaW50ZXJhY3RpdmUgcGVyaW9kaWMgdGFibGUgdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gc2VsZWN0IHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICBjb25zdCBwZXJpb2RpY1RhYmxlTm9kZSA9IG5ldyBFeHBhbmRlZFBlcmlvZGljVGFibGVOb2RlKCBtaXhJc290b3Blc01vZGVsLnNlbGVjdGVkQXRvbUNvbmZpZywgMTgsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuICAgIHBlcmlvZGljVGFibGVOb2RlLnNjYWxlKCAwLjU1ICk7XHJcbiAgICBwZXJpb2RpY1RhYmxlTm9kZS50b3AgPSAxMDtcclxuICAgIHBlcmlvZGljVGFibGVOb2RlLnJpZ2h0ID0gdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggLSAxMDtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBlcmlvZGljVGFibGVOb2RlICk7XHJcblxyXG4gICAgLy8gcGllIGNoYXJ0XHJcbiAgICB0aGlzLmlzb3RvcGVQcm9wb3J0aW9uc1BpZUNoYXJ0ID0gbmV3IElzb3RvcGVQcm9wb3J0aW9uc1BpZUNoYXJ0KCB0aGlzLm1vZGVsICk7XHJcbiAgICB0aGlzLmlzb3RvcGVQcm9wb3J0aW9uc1BpZUNoYXJ0LnNjYWxlKCAwLjYgKTtcclxuICAgIHRoaXMuaXNvdG9wZVByb3BvcnRpb25zUGllQ2hhcnQuY2VudGVyWCA9IHRoaXMuaXNvdG9wZVByb3BvcnRpb25zUGllQ2hhcnQuY2VudGVyWCArIDE1MDsgLy8gRW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgY29uc3QgY29tcG9zaXRpb25Cb3ggPSBuZXcgQWNjb3JkaW9uQm94KCB0aGlzLmlzb3RvcGVQcm9wb3J0aW9uc1BpZUNoYXJ0LCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogMyxcclxuICAgICAgdGl0bGVOb2RlOiBuZXcgVGV4dCggcGVyY2VudENvbXBvc2l0aW9uU3RyaW5nLCB7XHJcbiAgICAgICAgZm9udDogU2hyZWRDb25zdGFudHMuQUNDT1JESU9OX0JPWF9USVRMRV9GT05ULFxyXG4gICAgICAgIG1heFdpZHRoOiBTaHJlZENvbnN0YW50cy5BQ0NPUkRJT05fQk9YX1RJVExFX01BWF9XSURUSFxyXG4gICAgICB9ICksXHJcbiAgICAgIGZpbGw6IFNocmVkQ29uc3RhbnRzLkRJU1BMQVlfUEFORUxfQkFDS0dST1VORF9DT0xPUixcclxuICAgICAgZXhwYW5kZWRQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCB0cnVlICksXHJcbiAgICAgIG1pbldpZHRoOiBwZXJpb2RpY1RhYmxlTm9kZS53aWR0aCxcclxuICAgICAgbWF4V2lkdGg6IHBlcmlvZGljVGFibGVOb2RlLndpZHRoLFxyXG4gICAgICBjb250ZW50QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICB0aXRsZUFsaWduWDogJ2xlZnQnLFxyXG4gICAgICBidXR0b25BbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAxNixcclxuICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDE2XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGNvbXBvc2l0aW9uQm94LmxlZnQgPSBwZXJpb2RpY1RhYmxlTm9kZS5sZWZ0O1xyXG4gICAgY29tcG9zaXRpb25Cb3gudG9wID0gcGVyaW9kaWNUYWJsZU5vZGUuYm90dG9tICsgMTU7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjb21wb3NpdGlvbkJveCApO1xyXG5cclxuICAgIGNvbnN0IGF2ZXJhZ2VBdG9taWNNYXNzQm94ID0gbmV3IEFjY29yZGlvbkJveCggbmV3IEF2ZXJhZ2VBdG9taWNNYXNzSW5kaWNhdG9yKCB0aGlzLm1vZGVsICksIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiAzLFxyXG4gICAgICB0aXRsZU5vZGU6IG5ldyBUZXh0KCBhdmVyYWdlQXRvbWljTWFzc1N0cmluZywge1xyXG4gICAgICAgIGZvbnQ6IFNocmVkQ29uc3RhbnRzLkFDQ09SRElPTl9CT1hfVElUTEVfRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDogU2hyZWRDb25zdGFudHMuQUNDT1JESU9OX0JPWF9USVRMRV9NQVhfV0lEVEhcclxuICAgICAgfSApLFxyXG4gICAgICBmaWxsOiBTaHJlZENvbnN0YW50cy5ESVNQTEFZX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgICAgIGV4cGFuZGVkUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggdHJ1ZSApLFxyXG4gICAgICBtaW5XaWR0aDogcGVyaW9kaWNUYWJsZU5vZGUud2lkdGgsXHJcbiAgICAgIG1heFdpZHRoOiBwZXJpb2RpY1RhYmxlTm9kZS53aWR0aCxcclxuICAgICAgY29udGVudEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgdGl0bGVBbGlnblg6ICdsZWZ0JyxcclxuICAgICAgYnV0dG9uQWxpZ246ICdyaWdodCcsXHJcbiAgICAgIGV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMTYsXHJcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxNlxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBhdmVyYWdlQXRvbWljTWFzc0JveC5sZWZ0ID0gY29tcG9zaXRpb25Cb3gubGVmdDtcclxuICAgIGF2ZXJhZ2VBdG9taWNNYXNzQm94LnRvcCA9IGNvbXBvc2l0aW9uQm94LmJvdHRvbSArIDEwO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYXZlcmFnZUF0b21pY01hc3NCb3ggKTtcclxuXHJcbiAgICBjb25zdCBpbnRlcmFjdGl2aXR5TW9kZVNlbGVjdGlvbk5vZGUgPSBuZXcgSW50ZXJhY3Rpdml0eU1vZGVTZWxlY3Rpb25Ob2RlKCBtaXhJc290b3Blc01vZGVsLCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG4gICAgaW50ZXJhY3Rpdml0eU1vZGVTZWxlY3Rpb25Ob2RlLnJpZ2h0ID0gdGVzdENoYW1iZXJOb2RlLnJpZ2h0O1xyXG4gICAgaW50ZXJhY3Rpdml0eU1vZGVTZWxlY3Rpb25Ob2RlLnRvcCA9IHRlc3RDaGFtYmVyTm9kZS5ib3R0b20gKyA1O1xyXG4gICAgdGhpcy5hZGRDaGlsZCggaW50ZXJhY3Rpdml0eU1vZGVTZWxlY3Rpb25Ob2RlICk7XHJcblxyXG4gICAgY29uc3QgaXNvdG9wZU1peHR1cmVTZWxlY3Rpb25Ob2RlID0gbmV3IElzb3RvcGVNaXh0dXJlU2VsZWN0aW9uTm9kZSggbWl4SXNvdG9wZXNNb2RlbC5zaG93aW5nTmF0dXJlc01peFByb3BlcnR5ICk7XHJcbiAgICBpc290b3BlTWl4dHVyZVNlbGVjdGlvbk5vZGUudG9wID0gYXZlcmFnZUF0b21pY01hc3NCb3guYm90dG9tICsgMTA7XHJcbiAgICBpc290b3BlTWl4dHVyZVNlbGVjdGlvbk5vZGUubGVmdCA9IGF2ZXJhZ2VBdG9taWNNYXNzQm94LmxlZnQ7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBpc290b3BlTWl4dHVyZVNlbGVjdGlvbk5vZGUgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgcmVzZXQgYWxsIGJ1dHRvbiBpbiB0aGUgYm90dG9tIHJpZ2h0LCB3aGljaCByZXNldHMgdGhlIG1vZGVsLlxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpOyAvLyBjYW5jZWwgYW55IGludGVyYWN0aW9ucyB0aGF0IGFyZSBpbiBwcm9ncmVzc1xyXG4gICAgICAgIG1peElzb3RvcGVzTW9kZWwucmVzZXQoKTtcclxuICAgICAgICBjb21wb3NpdGlvbkJveC5leHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgICAgYXZlcmFnZUF0b21pY01hc3NCb3guZXhwYW5kZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIDEwLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSAxMFxyXG4gICAgfSApO1xyXG4gICAgcmVzZXRBbGxCdXR0b24uc2NhbGUoIDAuODUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggaXNvdG9wZUxheWVyICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBidWNrZXRGcm9udExheWVyICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIGNvbXBvbmVudCB2aXNpYmlsaXR5IGJhc2VkIG9uIHdoZXRoZXIgXCJuYXR1cmUncyBtaXhcIiBpcyBiZWluZyBzaG93bi4gIFRoaXMgZG9lc24ndCBuZWVkIHVubGluayBhcyBpdCBzdGF5c1xyXG4gICAgLy8gdGhyb3VnaG91dCB0aGUgc2ltIGxpZmUuXHJcbiAgICBtaXhJc290b3Blc01vZGVsLnNob3dpbmdOYXR1cmVzTWl4UHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBpZiAoIG1peElzb3RvcGVzTW9kZWwuc2hvd2luZ05hdHVyZXNNaXhQcm9wZXJ0eS5nZXQoKSA9PT0gdHJ1ZSApIHtcclxuICAgICAgICBpbnRlcmFjdGl2aXR5TW9kZVNlbGVjdGlvbk5vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIGNsZWFyQm94QnV0dG9uLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzb3RvcGVzTGF5ZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaW50ZXJhY3Rpdml0eU1vZGVTZWxlY3Rpb25Ob2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGNsZWFyQm94QnV0dG9uLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNvdG9wZXNMYXllci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBtaXhJc290b3Blc01vZGVsLmludGVyYWN0aXZpdHlNb2RlUHJvcGVydHkuZ2V0KCkgPT09XHJcbiAgICAgICAgICAgTWl4SXNvdG9wZXNNb2RlbC5JbnRlcmFjdGl2aXR5TW9kZS5TTElERVJTX0FORF9TTUFMTF9BVE9NUyAmJlxyXG4gICAgICAgICAgIG1peElzb3RvcGVzTW9kZWwuc2hvd2luZ05hdHVyZXNNaXhQcm9wZXJ0eS5nZXQoKSA9PT0gZmFsc2UgKSB7XHJcbiAgICAgICAgdGhpcy5pc290b3Blc0xheWVyLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNvdG9wZXNMYXllci5zZXRJc290b3BlcyggdGhpcy5tb2RlbC5pc290b3Blc0xpc3QgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgaXNvdG9wZXMgYmFzZWQgb24gdGhlIGludGVyYWN0aXZpdHkgbW9kZSwgZG9lc24ndCBuZWVkIHVubGluayBhcyBpdCBzdGF5cyB0aHJvdWdob3V0XHJcbiAgICAvLyB0aGUgc2ltIGxpZmUuXHJcbiAgICBtaXhJc290b3Blc01vZGVsLmludGVyYWN0aXZpdHlNb2RlUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBpZiAoIG1peElzb3RvcGVzTW9kZWwuaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eS5nZXQoKSA9PT0gTWl4SXNvdG9wZXNNb2RlbC5JbnRlcmFjdGl2aXR5TW9kZS5CVUNLRVRTX0FORF9MQVJHRV9BVE9NUyApIHtcclxuICAgICAgICB0aGlzLmlzb3RvcGVzTGF5ZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaXNvdG9wZXNMYXllci52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzb3RvcGVzTGF5ZXIuc2V0SXNvdG9wZXMoIHRoaXMubW9kZWwuaXNvdG9wZXNMaXN0ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIGZsYWcgdG8gY2F1c2UgdGhlIHBpZSBjaGFydCB0byBnZXQgdXBkYXRlZCB3aGVuIHRoZSBpc290b3BlIGNvdW50IGNoYW5nZXMsIGRvZXNuJ3QgbmVlZCB1bmxpbmsgYXMgaXRcclxuICAgIC8vIHN0YXlzIHRocm91Z2hvdXQgdGhlIHNpbSBsaWZlXHJcbiAgICBtaXhJc290b3Blc01vZGVsLnRlc3RDaGFtYmVyLmlzb3RvcGVDb3VudFByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgdGhpcy51cGRhdGVQaWVDaGFydCA9IHRydWU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBtb2RlbCBzdGF0ZSB0aGF0IGNhbiBlbmQgdXAgbGVhdmluZyBwYXJ0aWNsZXMgdGhhdCBhcmUgYmVpbmcgZHJhZ2dlZCBpbiBvZGQgc3RhdGVzLFxyXG4gICAgLy8gYW5kIGNhbmNlbCBhbnkgaW50ZXJhY3Rpb25zIHdpdGggdGhlIGluZGl2aWR1YWwgaXNvdG9wZXMuICBUaGlzIGhlbHBzIHRvIHByZXZlbnQgbXVsdGktdG91Y2ggaXNzdWVzIHN1Y2ggYXMgdGhvc2VcclxuICAgIC8vIGRlc2NyaWJlZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvaXNvdG9wZXMtYW5kLWF0b21pYy1tYXNzL2lzc3Vlcy8xMDFcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgbWl4SXNvdG9wZXNNb2RlbC5zaG93aW5nTmF0dXJlc01peFByb3BlcnR5LCBtaXhJc290b3Blc01vZGVsLmludGVyYWN0aXZpdHlNb2RlUHJvcGVydHkgXSxcclxuICAgICAgKCkgPT4geyBpc290b3BlTGF5ZXIuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IH1cclxuICAgICk7XHJcbiAgICBtaXhJc290b3Blc01vZGVsLnNlbGVjdGVkQXRvbUNvbmZpZy5hdG9tVXBkYXRlZC5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBpc290b3BlTGF5ZXIuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGVwIHRoZSB0aW1lLWRlcGVuZGVudCBiZWhhdmlvclxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCkge1xyXG5cclxuICAgIC8vIEFzIGFuIG9wdGltaXphdGlvbiB3ZSB1cGRhdGUgdGhlIHBpZSBjaGFydCBvbmNlIGV2ZXJ5IGFuaW1hdGlvbiBmcmFtZSBpbiBwbGFjZSBvZiB1cGRhdGluZyBpdCBldmVyeSB0aW1lIGFuXHJcbiAgICAvLyBpc290b3BlIGlzIGFkZGVkIGluIHRoZSB0ZXN0IGNoYW1iZXIuXHJcbiAgICBpZiAoIHRoaXMudXBkYXRlUGllQ2hhcnQgKSB7XHJcbiAgICAgIHRoaXMuaXNvdG9wZVByb3BvcnRpb25zUGllQ2hhcnQudXBkYXRlKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlUGllQ2hhcnQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBzZWxlY3RvciBub2RlIGNvbnRhaW5pbmcgcmFkaW8gYnV0dG9ucyB0byBzZWxlY3QgYmV0d2VlbiBNeSBNaXggb3IgTmF0dXJlJ3MgTWl4XHJcbiAqL1xyXG5jbGFzcyBJc290b3BlTWl4dHVyZVNlbGVjdGlvbk5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eX0gaXNvdG9wZU1peHR1cmVQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpc290b3BlTWl4dHVyZVByb3BlcnR5ICkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIGNvbnN0IHJhZGlvQnV0dG9uUmFkaXVzID0gNjtcclxuICAgIGNvbnN0IExBQkVMX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XHJcbiAgICBjb25zdCBNQVhfV0lEVEggPSAxNjA7XHJcbiAgICBjb25zdCBteU1peEJ1dHRvbiA9IG5ldyBBcXVhUmFkaW9CdXR0b24oXHJcbiAgICAgIGlzb3RvcGVNaXh0dXJlUHJvcGVydHksXHJcbiAgICAgIGZhbHNlLFxyXG4gICAgICBuZXcgVGV4dCggbXlNaXhTdHJpbmcsIHsgZm9udDogTEFCRUxfRk9OVCwgbWF4V2lkdGg6IE1BWF9XSURUSCB9ICksIHsgcmFkaXVzOiByYWRpb0J1dHRvblJhZGl1cyB9XHJcbiAgICApO1xyXG4gICAgY29uc3QgbmF0dXJlc01peEJ1dHRvbiA9IG5ldyBBcXVhUmFkaW9CdXR0b24oXHJcbiAgICAgIGlzb3RvcGVNaXh0dXJlUHJvcGVydHksXHJcbiAgICAgIHRydWUsXHJcbiAgICAgIG5ldyBUZXh0KCBuYXR1cmVzTWl4U3RyaW5nLCB7IGZvbnQ6IExBQkVMX0ZPTlQsIG1heFdpZHRoOiBNQVhfV0lEVEggfSApLCB7IHJhZGl1czogcmFkaW9CdXR0b25SYWRpdXMgfVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGxhYmVsID0gbmV3IFRleHQoIGlzb3RvcGVNaXh0dXJlU3RyaW5nLCB7IGZvbnQ6IExBQkVMX0ZPTlQsIG1heFdpZHRoOiBNQVhfV0lEVEggfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGFiZWwgKTtcclxuICAgIG15TWl4QnV0dG9uLmxlZnQgPSAwO1xyXG4gICAgbXlNaXhCdXR0b24udG9wID0gbGFiZWwuYm90dG9tICsgMztcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG15TWl4QnV0dG9uICk7XHJcbiAgICBuYXR1cmVzTWl4QnV0dG9uLmxlZnQgPSAwO1xyXG4gICAgbmF0dXJlc01peEJ1dHRvbi50b3AgPSBteU1peEJ1dHRvbi5ib3R0b20gKyA4O1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmF0dXJlc01peEJ1dHRvbiApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIHNlbGVjdG9yIG5vZGUgY29udGFpbmluZyByYWRpbyBidXR0b25zIHRvIHNlbGVjdCBCdWNrZXRzIG9yIFNsaWRlcnMgaW4gXCJNeSBNaXhcIiBtb2RlXHJcbiAqL1xyXG5jbGFzcyBJbnRlcmFjdGl2aXR5TW9kZVNlbGVjdGlvbk5vZGUgZXh0ZW5kcyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01peElzb3RvcGVzTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuICAgIGNvbnN0IGJ1Y2tldE5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAgY29uc3QgYnVja2V0ID0gbmV3IEJ1Y2tldCgge1xyXG4gICAgICBiYXNlQ29sb3I6IENvbG9yLmdyYXksXHJcbiAgICAgIHNpemU6IG5ldyBEaW1lbnNpb24yKCA1MCwgMzAgKVxyXG4gICAgfSApO1xyXG4gICAgYnVja2V0Tm9kZS5hZGRDaGlsZCggbmV3IEJ1Y2tldEhvbGUoIGJ1Y2tldCwgbW9kZWxWaWV3VHJhbnNmb3JtICkgKTtcclxuICAgIGJ1Y2tldE5vZGUuYWRkQ2hpbGQoIG5ldyBCdWNrZXRGcm9udCggYnVja2V0LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSApO1xyXG4gICAgYnVja2V0Tm9kZS5zY2FsZSggMC41ICk7XHJcblxyXG4gICAgY29uc3QgcmFuZ2UgPSBuZXcgUmFuZ2UoIDAsIDEwMCApO1xyXG4gICAgY29uc3Qgc2xpZGVyID0gbmV3IEhTbGlkZXIoIG5ldyBQcm9wZXJ0eSggNTAgKSwgcmFuZ2UsIHtcclxuICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggNTAsIDUgKSxcclxuICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTUsIDMwICksXHJcbiAgICAgIG1ham9yVGlja0xlbmd0aDogMTUsXHJcblxyXG4gICAgICAvLyBwZG9tIC0gdGhpcyBzbGlkZXIgaXMganVzdCBhbiBpY29uIGFuZCBzaG91bGQgbm90IGhhdmUgUERPTSByZXByZXNlbnRhdGlvblxyXG4gICAgICB0YWdOYW1lOiBudWxsXHJcbiAgICB9ICk7XHJcbiAgICBzbGlkZXIuYWRkTWFqb3JUaWNrKCAwICk7XHJcbiAgICBzbGlkZXIuYWRkTWFqb3JUaWNrKCAxMDAgKTtcclxuICAgIHNsaWRlci5zY2FsZSggMC41ICk7XHJcblxyXG4gICAgY29uc3QgcmFkaW9CdXR0b25Db250ZW50ID0gW1xyXG4gICAgICB7IHZhbHVlOiBNaXhJc290b3Blc01vZGVsLkludGVyYWN0aXZpdHlNb2RlLkJVQ0tFVFNfQU5EX0xBUkdFX0FUT01TLCBjcmVhdGVOb2RlOiAoKSA9PiBidWNrZXROb2RlIH0sXHJcbiAgICAgIHsgdmFsdWU6IE1peElzb3RvcGVzTW9kZWwuSW50ZXJhY3Rpdml0eU1vZGUuU0xJREVSU19BTkRfU01BTExfQVRPTVMsIGNyZWF0ZU5vZGU6ICgpID0+IHNsaWRlciB9XHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBtb2RlbC5pbnRlcmFjdGl2aXR5TW9kZVByb3BlcnR5LCByYWRpb0J1dHRvbkNvbnRlbnQsIHtcclxuICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgcmFkaW9CdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgYmFzZUNvbG9yOiBDb2xvci53aGl0ZSxcclxuICAgICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7XHJcbiAgICAgICAgICBzZWxlY3RlZFN0cm9rZTogJyMzMjkxYjgnLFxyXG4gICAgICAgICAgc2VsZWN0ZWRMaW5lV2lkdGg6IDIsXHJcbiAgICAgICAgICBkZXNlbGVjdGVkQ29udGVudE9wYWNpdHk6IDAuMlxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuaXNvdG9wZXNBbmRBdG9taWNNYXNzLnJlZ2lzdGVyKCAnTWl4SXNvdG9wZXNTY3JlZW5WaWV3JywgTWl4SXNvdG9wZXNTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1peElzb3RvcGVzU2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxv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