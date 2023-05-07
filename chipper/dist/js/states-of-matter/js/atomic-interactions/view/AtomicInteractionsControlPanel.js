// Copyright 2015-2023, University of Colorado Boulder

/**
 * Control panel used for selecting atom combinations.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Image, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import pushPin_png from '../../../images/pushPin_png.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import AtomAndMoleculeIconFactory from '../../common/view/AtomAndMoleculeIconFactory.js';
import SOMColors from '../../common/view/SOMColors.js';
import TitledSlider from '../../common/view/TitledSlider.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import AtomPair from '../model/AtomPair.js';
const adjustableAttractionString = StatesOfMatterStrings.adjustableAttraction;
const argonString = StatesOfMatterStrings.argon;
const atomDiameterString = StatesOfMatterStrings.atomDiameter;
const atomsString = StatesOfMatterStrings.Atoms;
const customAttractionString = StatesOfMatterStrings.customAttraction;
const interactionStrengthString = StatesOfMatterStrings.interactionStrength;
const largeString = StatesOfMatterStrings.large;
const movingString = StatesOfMatterStrings.moving;
const neonString = StatesOfMatterStrings.neon;
const oxygenString = StatesOfMatterStrings.oxygen;
const pinnedString = StatesOfMatterStrings.pinned;
const smallString = StatesOfMatterStrings.small;
const strongString = StatesOfMatterStrings.strong;
const weakString = StatesOfMatterStrings.weak;

// constants
const NORMAL_TEXT_FONT = new PhetFont(12);
const RADIO_BUTTON_RADIUS = 6;
const TITLE_TEXT_WIDTH = 130;
const PANEL_X_MARGIN = 10;
const AQUA_RADIO_BUTTON_X_SPACING = 8; // only used for atomic-interactions

class AtomicInteractionsControlPanel extends Node {
  /**
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {boolean} enableHeterogeneousAtoms - flag for enabling heterogeneous atom combinations
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor(dualAtomModel, enableHeterogeneousAtoms, options) {
    options = merge({
      xMargin: 5,
      yMargin: 8,
      fill: 'black',
      stroke: 'white',
      panelTextFill: 'white',
      tickTextColor: 'black',
      buttonTextFill: enableHeterogeneousAtoms ? 'black' : 'white',
      lineWidth: 1,
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      minWidth: 0,
      tandem: Tandem.REQUIRED
    }, options);
    super();

    // This control panel width differs between SOM full version and the Atomic Interactions sim, so we are using
    // different max width values.  These were empirically determined.
    const SLIDER_TITLE_MAX_WIDTH = enableHeterogeneousAtoms ? 225 : 150;
    const NORMAL_TEXT_MAX_WIDTH = enableHeterogeneousAtoms ? 200 : 165;

    // white text within SOM full version, black text in Atomic Interactions
    // white stroke around the atoms & molecules panel within SOM full version, black stroke in Atomic Interactions
    let neonAndNeonLabelItems;
    let argonAndArgonLabelItems;
    let oxygenAndOxygenLabelItems;
    let neonAndArgonLabelItems;
    let neonAndOxygenLabelItems;
    let argonAndOxygenLabelItems;
    let adjustableAttraction;
    let atomPairSelector;
    let labelWidth;
    let createLabelNode;
    let labelNodes;
    let titleNode;
    const sliderTrackWidth = 140; // empirically determined

    // common options for radio button labels
    const labelTextOptions = {
      font: NORMAL_TEXT_FONT,
      fill: options.buttonTextFill,
      maxWidth: enableHeterogeneousAtoms ? NORMAL_TEXT_MAX_WIDTH / 2 : NORMAL_TEXT_MAX_WIDTH
    };

    // allows user to select from a fixed list of heterogeneous and homogeneous combinations of atoms
    if (enableHeterogeneousAtoms) {
      neonAndNeonLabelItems = [new Text(neonString, labelTextOptions), new Text(neonString, labelTextOptions)];
      argonAndArgonLabelItems = [new Text(argonString, labelTextOptions), new Text(argonString, labelTextOptions)];
      oxygenAndOxygenLabelItems = [new Text(oxygenString, labelTextOptions), new Text(oxygenString, labelTextOptions)];
      neonAndArgonLabelItems = [new Text(neonString, labelTextOptions), new Text(argonString, labelTextOptions)];
      neonAndOxygenLabelItems = [new Text(neonString, labelTextOptions), new Text(oxygenString, labelTextOptions)];
      argonAndOxygenLabelItems = [new Text(argonString, labelTextOptions), new Text(oxygenString, labelTextOptions)];
      const customAttractionLabel = new Text(customAttractionString, {
        font: NORMAL_TEXT_FONT,
        fill: options.buttonTextFill,
        maxWidth: NORMAL_TEXT_MAX_WIDTH
      });
      const pushpinImage = new Image(pushPin_png, {
        tandem: options.tandem.createTandem('pushpinImage')
      });
      pushpinImage.scale(15 / pushpinImage.height);
      const maxWidthOfTitleText = 100; // empirically determined
      const pinnedNodeText = new HBox({
        children: [pushpinImage, new Text(pinnedString, {
          font: new PhetFont(10),
          maxWidth: maxWidthOfTitleText,
          tandem: options.tandem.createTandem('pinnedNodeText')
        }), new HStrut(pushpinImage.width)],
        spacing: 5
      });
      const movingNodeText = new Text(movingString, {
        font: new PhetFont(10),
        maxWidth: maxWidthOfTitleText,
        tandem: options.tandem.createTandem('movingNodeText')
      });
      labelNodes = [pinnedNodeText, movingNodeText];
      labelWidth = Math.max(neonAndArgonLabelItems[0].width + neonAndArgonLabelItems[1].width, argonAndArgonLabelItems[0].width + argonAndArgonLabelItems[1].width, oxygenAndOxygenLabelItems[0].width + oxygenAndOxygenLabelItems[1].width, neonAndNeonLabelItems[0].width + neonAndNeonLabelItems[1].width, neonAndOxygenLabelItems[0].width + neonAndOxygenLabelItems[1].width);
      labelWidth = Math.max(labelNodes[0].width * 2, labelNodes[1].width * 2, labelWidth, sliderTrackWidth, options.minWidth - 2 * PANEL_X_MARGIN - 2 * RADIO_BUTTON_RADIUS - AQUA_RADIO_BUTTON_X_SPACING);

      // function to create a label node
      const createLabelNode = atomNameTextNodes => {
        const strutWidth1 = labelWidth / 2 - atomNameTextNodes[0].width;
        const strutWidth2 = labelWidth / 2 - atomNameTextNodes[1].width;
        return new HBox({
          children: [atomNameTextNodes[0], new HStrut(strutWidth1), atomNameTextNodes[1], new HStrut(strutWidth2)]
        });
      };
      const radioButtonGroup = new AquaRadioButtonGroup(dualAtomModel.atomPairProperty, [{
        createNode: () => createLabelNode(neonAndNeonLabelItems),
        value: AtomPair.NEON_NEON,
        tandemName: 'neonAndNeonRadioButton'
      }, {
        createNode: () => createLabelNode(argonAndArgonLabelItems),
        value: AtomPair.ARGON_ARGON,
        tandemName: 'argonAndArgonRadioButton'
      }, {
        createNode: () => createLabelNode(oxygenAndOxygenLabelItems),
        value: AtomPair.OXYGEN_OXYGEN,
        tandemName: 'oxygenAndOxygenRadioButton'
      }, {
        createNode: () => createLabelNode(neonAndArgonLabelItems),
        value: AtomPair.NEON_ARGON,
        tandemName: 'neonAndArgonRadioButton'
      }, {
        createNode: () => createLabelNode(neonAndOxygenLabelItems),
        value: AtomPair.NEON_OXYGEN,
        tandemName: 'neonAndOxygenRadioButton'
      }, {
        createNode: () => createLabelNode(argonAndOxygenLabelItems),
        value: AtomPair.ARGON_OXYGEN,
        tandemName: 'argonAndOxygenRadioButton'
      }, {
        createNode: () => customAttractionLabel,
        value: AtomPair.ADJUSTABLE,
        tandemName: 'adjustableRadioButton'
      }], {
        spacing: 13,
        radioButtonOptions: {
          radius: RADIO_BUTTON_RADIUS,
          xSpacing: AQUA_RADIO_BUTTON_X_SPACING
        },
        tandem: options.tandem.createTandem('radioButtonGroup')
      });

      // create the title of the panel in such a way that it will align in a column with the atom selections
      const createTitle = labelNodePair => {
        const strutWidth1 = RADIO_BUTTON_RADIUS;
        const strutWidth2 = labelWidth / 2 - labelNodePair[0].width;
        const strutWidth3 = labelWidth / 2 - labelNodePair[1].width;
        return new HBox({
          children: [new HStrut(strutWidth1), labelNodePair[0], new HStrut(strutWidth2 + 9 + RADIO_BUTTON_RADIUS), labelNodePair[1], new HStrut(strutWidth3 + 10)]
        });
      };
      titleNode = createTitle(labelNodes);

      // put the title and radio button group together into a single node
      atomPairSelector = new VBox({
        children: [titleNode, radioButtonGroup],
        align: 'left',
        spacing: 5
      });
      titleNode.align = 'center';
    } else {
      // allows the user to choose the type of atom, both atoms will be the same type
      const titleText = new Text(atomsString, {
        font: new PhetFont(14),
        fill: options.panelTextFill,
        maxWidth: TITLE_TEXT_WIDTH,
        tandem: options.tandem.createTandem('titleText')
      });

      // Set up objects that describe the pieces that make up a selector item in the control panel, conforms to the
      // contract: { label: {Node}, icon: {Node} }
      const neon = {
        label: new Text(neonString, labelTextOptions),
        icon: AtomAndMoleculeIconFactory.createIcon(SubstanceType.NEON)
      };
      const argon = {
        label: new Text(argonString, labelTextOptions),
        icon: AtomAndMoleculeIconFactory.createIcon(SubstanceType.ARGON)
      };
      adjustableAttraction = {
        label: new Text(adjustableAttractionString, {
          font: NORMAL_TEXT_FONT,
          fill: options.buttonTextFill,
          maxWidth: NORMAL_TEXT_MAX_WIDTH
        }),
        icon: AtomAndMoleculeIconFactory.createIcon(SubstanceType.ADJUSTABLE_ATOM)
      };
      labelNodes = {
        label: titleText
      };

      // compute the maximum item width
      const widestLabelAndIconSpec = _.maxBy([neon, argon, adjustableAttraction, labelNodes], item => item.label.width + (item.icon ? item.icon.width : 0));
      labelWidth = widestLabelAndIconSpec.label.width + (widestLabelAndIconSpec.icon ? widestLabelAndIconSpec.icon.width : 0);
      labelWidth = Math.max(labelWidth, sliderTrackWidth, options.minWidth - 2 * PANEL_X_MARGIN);

      // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
      createLabelNode = atomSelectorLabelSpec => {
        if (atomSelectorLabelSpec.icon) {
          const strutWidth = labelWidth - atomSelectorLabelSpec.label.width - atomSelectorLabelSpec.icon.width;
          return new HBox({
            children: [atomSelectorLabelSpec.label, new HStrut(strutWidth), atomSelectorLabelSpec.icon]
          });
        } else {
          return new HBox({
            children: [atomSelectorLabelSpec.label]
          });
        }
      };
      const radioButtonContent = [{
        value: AtomPair.NEON_NEON,
        createNode: () => createLabelNode(neon),
        tandemName: 'neonRadioButton'
      }, {
        value: AtomPair.ARGON_ARGON,
        createNode: () => createLabelNode(argon),
        tandemName: 'argonRadioButton'
      }, {
        value: AtomPair.ADJUSTABLE,
        createNode: () => createLabelNode(adjustableAttraction),
        tandemName: 'adjustableAttractionRadioButton'
      }];
      const radioButtonGroup = new RectangularRadioButtonGroup(dualAtomModel.atomPairProperty, radioButtonContent, {
        orientation: 'vertical',
        radioButtonOptions: {
          cornerRadius: 5,
          baseColor: 'black',
          buttonAppearanceStrategyOptions: {
            selectedLineWidth: 1,
            selectedStroke: 'white',
            deselectedLineWidth: 0,
            deselectedContentOpacity: 1
          }
        },
        tandem: options.tandem.createTandem('radioButtonGroup')
      });
      atomPairSelector = radioButtonGroup;
      titleNode = new BackgroundNode(labelNodes.label, {
        yMargin: 1,
        rectangleOptions: {
          fill: SOMColors.backgroundProperty,
          opacity: 1
        }
      });
    }
    const commonSliderOptions = merge({}, SOMConstants.ADJUSTABLE_ATTRACTION_SLIDER_COMMON_OPTIONS, {
      trackSize: new Dimension2(sliderTrackWidth, 5),
      majorTickStroke: options.panelTextFill,
      trackStroke: options.panelTextFill,
      constrainValue: value => Utils.roundToInterval(value, 5),
      startDrag: () => {
        dualAtomModel.setMotionPaused(true);
      },
      endDrag: () => {
        dualAtomModel.setMotionPaused(false);
      }
    });
    const maxTickTextWidth = enableHeterogeneousAtoms ? 85 : 35;
    const tickTextOptions = {
      font: SOMConstants.SLIDER_TICK_TEXT_FONT,
      fill: options.panelTextFill,
      maxWidth: maxTickTextWidth
    };
    const smallText = new Text(smallString, tickTextOptions);
    const largeText = new Text(largeString, tickTextOptions);
    const atomDiameterSlider = new TitledSlider(dualAtomModel.adjustableAtomDiameterProperty, new Range(SOMConstants.MIN_SIGMA, SOMConstants.MAX_SIGMA), atomDiameterString, options.tandem.createTandem('atomDiameterSlider'), {
      titleOptions: {
        fill: options.panelTextFill,
        maxWidth: SLIDER_TITLE_MAX_WIDTH
      },
      sliderOptions: commonSliderOptions,
      phetioDocumentation: 'Used for \'Adjustable Attraction\' only'
    });
    if (enableHeterogeneousAtoms) {
      atomDiameterSlider.slider.addMajorTick(SOMConstants.MIN_SIGMA);
      atomDiameterSlider.slider.addMajorTick(SOMConstants.MAX_SIGMA);
    } else {
      atomDiameterSlider.slider.addMajorTick(SOMConstants.MIN_SIGMA, smallText);
      atomDiameterSlider.slider.addMajorTick(SOMConstants.MAX_SIGMA, largeText);
    }

    // add interaction strength slider
    const interactionStrengthSlider = new TitledSlider(dualAtomModel.adjustableAtomInteractionStrengthProperty, new Range(SOMConstants.MIN_EPSILON, SOMConstants.MAX_EPSILON), interactionStrengthString, options.tandem.createTandem('interactionStrengthSlider'), {
      sliderOptions: commonSliderOptions,
      titleOptions: {
        fill: options.panelTextFill,
        maxWidth: SLIDER_TITLE_MAX_WIDTH
      },
      phetioDocumentation: 'Used for \'Adjustable Attraction\' only'
    });
    const weakText = new Text(weakString, tickTextOptions);
    interactionStrengthSlider.slider.addMajorTick(SOMConstants.MIN_EPSILON, weakText);
    const strongText = new Text(strongString, tickTextOptions);
    interactionStrengthSlider.slider.addMajorTick(SOMConstants.MAX_EPSILON, strongText);
    const content = new VBox({
      align: 'center',
      children: [atomPairSelector],
      spacing: 5
    });
    const radioButtonPanel = new Panel(content, {
      stroke: options.stroke,
      cornerRadius: options.cornerRadius,
      lineWidth: options.lineWidth,
      fill: options.fill,
      xMargin: PANEL_X_MARGIN,
      minWidth: options.minWidth,
      align: 'left'
    });
    this.addChild(radioButtonPanel);

    // hide or show the controls for handling the adjustable atom based on the atom pair setting
    dualAtomModel.atomPairProperty.link(atomPair => {
      if (atomPair === AtomPair.ADJUSTABLE) {
        content.addChild(atomDiameterSlider);
        content.addChild(interactionStrengthSlider);
      } else {
        if (content.hasChild(atomDiameterSlider)) {
          content.removeChild(atomDiameterSlider);
        }
        if (content.hasChild(interactionStrengthSlider)) {
          content.removeChild(interactionStrengthSlider);
        }
      }
    });

    // Add the title node after radio button panel is added in the SOM full version.  This title is at the top center of
    // the panel.
    if (!enableHeterogeneousAtoms) {
      this.addChild(titleNode);

      // Keep the title node centered if its bounds change (which can only be done through phet-io).
      titleNode.localBoundsProperty.link(() => {
        titleNode.centerX = radioButtonPanel.centerX;
        titleNode.bottom = radioButtonPanel.top + 5; // empirically determined to overlap reasonably well
      });

      // Hide the title if all items are removed from the radio button group (which can only be done through phet-io).
      atomPairSelector.localBoundsProperty.link(localBounds => {
        titleNode.visible = !localBounds.equals(Bounds2.NOTHING);
      });
    }
    this.mutate(options);
  }
}
statesOfMatter.register('AtomicInteractionsControlPanel', AtomicInteractionsControlPanel);
export default AtomicInteractionsControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlJhbmdlIiwiVXRpbHMiLCJtZXJnZSIsIkJhY2tncm91bmROb2RlIiwiUGhldEZvbnQiLCJIQm94IiwiSFN0cnV0IiwiSW1hZ2UiLCJOb2RlIiwiVGV4dCIsIlZCb3giLCJBcXVhUmFkaW9CdXR0b25Hcm91cCIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsIlBhbmVsIiwiVGFuZGVtIiwicHVzaFBpbl9wbmciLCJTT01Db25zdGFudHMiLCJTdWJzdGFuY2VUeXBlIiwiQXRvbUFuZE1vbGVjdWxlSWNvbkZhY3RvcnkiLCJTT01Db2xvcnMiLCJUaXRsZWRTbGlkZXIiLCJzdGF0ZXNPZk1hdHRlciIsIlN0YXRlc09mTWF0dGVyU3RyaW5ncyIsIkF0b21QYWlyIiwiYWRqdXN0YWJsZUF0dHJhY3Rpb25TdHJpbmciLCJhZGp1c3RhYmxlQXR0cmFjdGlvbiIsImFyZ29uU3RyaW5nIiwiYXJnb24iLCJhdG9tRGlhbWV0ZXJTdHJpbmciLCJhdG9tRGlhbWV0ZXIiLCJhdG9tc1N0cmluZyIsIkF0b21zIiwiY3VzdG9tQXR0cmFjdGlvblN0cmluZyIsImN1c3RvbUF0dHJhY3Rpb24iLCJpbnRlcmFjdGlvblN0cmVuZ3RoU3RyaW5nIiwiaW50ZXJhY3Rpb25TdHJlbmd0aCIsImxhcmdlU3RyaW5nIiwibGFyZ2UiLCJtb3ZpbmdTdHJpbmciLCJtb3ZpbmciLCJuZW9uU3RyaW5nIiwibmVvbiIsIm94eWdlblN0cmluZyIsIm94eWdlbiIsInBpbm5lZFN0cmluZyIsInBpbm5lZCIsInNtYWxsU3RyaW5nIiwic21hbGwiLCJzdHJvbmdTdHJpbmciLCJzdHJvbmciLCJ3ZWFrU3RyaW5nIiwid2VhayIsIk5PUk1BTF9URVhUX0ZPTlQiLCJSQURJT19CVVRUT05fUkFESVVTIiwiVElUTEVfVEVYVF9XSURUSCIsIlBBTkVMX1hfTUFSR0lOIiwiQVFVQV9SQURJT19CVVRUT05fWF9TUEFDSU5HIiwiQXRvbWljSW50ZXJhY3Rpb25zQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJkdWFsQXRvbU1vZGVsIiwiZW5hYmxlSGV0ZXJvZ2VuZW91c0F0b21zIiwib3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiZmlsbCIsInN0cm9rZSIsInBhbmVsVGV4dEZpbGwiLCJ0aWNrVGV4dENvbG9yIiwiYnV0dG9uVGV4dEZpbGwiLCJsaW5lV2lkdGgiLCJjb3JuZXJSYWRpdXMiLCJQQU5FTF9DT1JORVJfUkFESVVTIiwibWluV2lkdGgiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsIlNMSURFUl9USVRMRV9NQVhfV0lEVEgiLCJOT1JNQUxfVEVYVF9NQVhfV0lEVEgiLCJuZW9uQW5kTmVvbkxhYmVsSXRlbXMiLCJhcmdvbkFuZEFyZ29uTGFiZWxJdGVtcyIsIm94eWdlbkFuZE94eWdlbkxhYmVsSXRlbXMiLCJuZW9uQW5kQXJnb25MYWJlbEl0ZW1zIiwibmVvbkFuZE94eWdlbkxhYmVsSXRlbXMiLCJhcmdvbkFuZE94eWdlbkxhYmVsSXRlbXMiLCJhdG9tUGFpclNlbGVjdG9yIiwibGFiZWxXaWR0aCIsImNyZWF0ZUxhYmVsTm9kZSIsImxhYmVsTm9kZXMiLCJ0aXRsZU5vZGUiLCJzbGlkZXJUcmFja1dpZHRoIiwibGFiZWxUZXh0T3B0aW9ucyIsImZvbnQiLCJtYXhXaWR0aCIsImN1c3RvbUF0dHJhY3Rpb25MYWJlbCIsInB1c2hwaW5JbWFnZSIsImNyZWF0ZVRhbmRlbSIsInNjYWxlIiwiaGVpZ2h0IiwibWF4V2lkdGhPZlRpdGxlVGV4dCIsInBpbm5lZE5vZGVUZXh0IiwiY2hpbGRyZW4iLCJ3aWR0aCIsInNwYWNpbmciLCJtb3ZpbmdOb2RlVGV4dCIsIk1hdGgiLCJtYXgiLCJhdG9tTmFtZVRleHROb2RlcyIsInN0cnV0V2lkdGgxIiwic3RydXRXaWR0aDIiLCJyYWRpb0J1dHRvbkdyb3VwIiwiYXRvbVBhaXJQcm9wZXJ0eSIsImNyZWF0ZU5vZGUiLCJ2YWx1ZSIsIk5FT05fTkVPTiIsInRhbmRlbU5hbWUiLCJBUkdPTl9BUkdPTiIsIk9YWUdFTl9PWFlHRU4iLCJORU9OX0FSR09OIiwiTkVPTl9PWFlHRU4iLCJBUkdPTl9PWFlHRU4iLCJBREpVU1RBQkxFIiwicmFkaW9CdXR0b25PcHRpb25zIiwicmFkaXVzIiwieFNwYWNpbmciLCJjcmVhdGVUaXRsZSIsImxhYmVsTm9kZVBhaXIiLCJzdHJ1dFdpZHRoMyIsImFsaWduIiwidGl0bGVUZXh0IiwibGFiZWwiLCJpY29uIiwiY3JlYXRlSWNvbiIsIk5FT04iLCJBUkdPTiIsIkFESlVTVEFCTEVfQVRPTSIsIndpZGVzdExhYmVsQW5kSWNvblNwZWMiLCJfIiwibWF4QnkiLCJpdGVtIiwiYXRvbVNlbGVjdG9yTGFiZWxTcGVjIiwic3RydXRXaWR0aCIsInJhZGlvQnV0dG9uQ29udGVudCIsIm9yaWVudGF0aW9uIiwiYmFzZUNvbG9yIiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyIsInNlbGVjdGVkTGluZVdpZHRoIiwic2VsZWN0ZWRTdHJva2UiLCJkZXNlbGVjdGVkTGluZVdpZHRoIiwiZGVzZWxlY3RlZENvbnRlbnRPcGFjaXR5IiwicmVjdGFuZ2xlT3B0aW9ucyIsImJhY2tncm91bmRQcm9wZXJ0eSIsIm9wYWNpdHkiLCJjb21tb25TbGlkZXJPcHRpb25zIiwiQURKVVNUQUJMRV9BVFRSQUNUSU9OX1NMSURFUl9DT01NT05fT1BUSU9OUyIsInRyYWNrU2l6ZSIsIm1ham9yVGlja1N0cm9rZSIsInRyYWNrU3Ryb2tlIiwiY29uc3RyYWluVmFsdWUiLCJyb3VuZFRvSW50ZXJ2YWwiLCJzdGFydERyYWciLCJzZXRNb3Rpb25QYXVzZWQiLCJlbmREcmFnIiwibWF4VGlja1RleHRXaWR0aCIsInRpY2tUZXh0T3B0aW9ucyIsIlNMSURFUl9USUNLX1RFWFRfRk9OVCIsInNtYWxsVGV4dCIsImxhcmdlVGV4dCIsImF0b21EaWFtZXRlclNsaWRlciIsImFkanVzdGFibGVBdG9tRGlhbWV0ZXJQcm9wZXJ0eSIsIk1JTl9TSUdNQSIsIk1BWF9TSUdNQSIsInRpdGxlT3B0aW9ucyIsInNsaWRlck9wdGlvbnMiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwic2xpZGVyIiwiYWRkTWFqb3JUaWNrIiwiaW50ZXJhY3Rpb25TdHJlbmd0aFNsaWRlciIsImFkanVzdGFibGVBdG9tSW50ZXJhY3Rpb25TdHJlbmd0aFByb3BlcnR5IiwiTUlOX0VQU0lMT04iLCJNQVhfRVBTSUxPTiIsIndlYWtUZXh0Iiwic3Ryb25nVGV4dCIsImNvbnRlbnQiLCJyYWRpb0J1dHRvblBhbmVsIiwiYWRkQ2hpbGQiLCJsaW5rIiwiYXRvbVBhaXIiLCJoYXNDaGlsZCIsInJlbW92ZUNoaWxkIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsImNlbnRlclgiLCJib3R0b20iLCJ0b3AiLCJsb2NhbEJvdW5kcyIsInZpc2libGUiLCJlcXVhbHMiLCJOT1RISU5HIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBdG9taWNJbnRlcmFjdGlvbnNDb250cm9sUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udHJvbCBwYW5lbCB1c2VkIGZvciBzZWxlY3RpbmcgYXRvbSBjb21iaW5hdGlvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEJhY2tncm91bmROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CYWNrZ3JvdW5kTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBIU3RydXQsIEltYWdlLCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFxdWFSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBwdXNoUGluX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaFBpbl9wbmcuanMnO1xyXG5pbXBvcnQgU09NQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9TT01Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgU3Vic3RhbmNlVHlwZSBmcm9tICcuLi8uLi9jb21tb24vU3Vic3RhbmNlVHlwZS5qcyc7XHJcbmltcG9ydCBBdG9tQW5kTW9sZWN1bGVJY29uRmFjdG9yeSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9BdG9tQW5kTW9sZWN1bGVJY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBTT01Db2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU09NQ29sb3JzLmpzJztcclxuaW1wb3J0IFRpdGxlZFNsaWRlciBmcm9tICcuLi8uLi9jb21tb24vdmlldy9UaXRsZWRTbGlkZXIuanMnO1xyXG5pbXBvcnQgc3RhdGVzT2ZNYXR0ZXIgZnJvbSAnLi4vLi4vc3RhdGVzT2ZNYXR0ZXIuanMnO1xyXG5pbXBvcnQgU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzIGZyb20gJy4uLy4uL1N0YXRlc09mTWF0dGVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBBdG9tUGFpciBmcm9tICcuLi9tb2RlbC9BdG9tUGFpci5qcyc7XHJcblxyXG5jb25zdCBhZGp1c3RhYmxlQXR0cmFjdGlvblN0cmluZyA9IFN0YXRlc09mTWF0dGVyU3RyaW5ncy5hZGp1c3RhYmxlQXR0cmFjdGlvbjtcclxuY29uc3QgYXJnb25TdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3MuYXJnb247XHJcbmNvbnN0IGF0b21EaWFtZXRlclN0cmluZyA9IFN0YXRlc09mTWF0dGVyU3RyaW5ncy5hdG9tRGlhbWV0ZXI7XHJcbmNvbnN0IGF0b21zU3RyaW5nID0gU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzLkF0b21zO1xyXG5jb25zdCBjdXN0b21BdHRyYWN0aW9uU3RyaW5nID0gU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzLmN1c3RvbUF0dHJhY3Rpb247XHJcbmNvbnN0IGludGVyYWN0aW9uU3RyZW5ndGhTdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3MuaW50ZXJhY3Rpb25TdHJlbmd0aDtcclxuY29uc3QgbGFyZ2VTdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3MubGFyZ2U7XHJcbmNvbnN0IG1vdmluZ1N0cmluZyA9IFN0YXRlc09mTWF0dGVyU3RyaW5ncy5tb3Zpbmc7XHJcbmNvbnN0IG5lb25TdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3MubmVvbjtcclxuY29uc3Qgb3h5Z2VuU3RyaW5nID0gU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzLm94eWdlbjtcclxuY29uc3QgcGlubmVkU3RyaW5nID0gU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzLnBpbm5lZDtcclxuY29uc3Qgc21hbGxTdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3Muc21hbGw7XHJcbmNvbnN0IHN0cm9uZ1N0cmluZyA9IFN0YXRlc09mTWF0dGVyU3RyaW5ncy5zdHJvbmc7XHJcbmNvbnN0IHdlYWtTdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3Mud2VhaztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBOT1JNQUxfVEVYVF9GT05UID0gbmV3IFBoZXRGb250KCAxMiApO1xyXG5jb25zdCBSQURJT19CVVRUT05fUkFESVVTID0gNjtcclxuY29uc3QgVElUTEVfVEVYVF9XSURUSCA9IDEzMDtcclxuY29uc3QgUEFORUxfWF9NQVJHSU4gPSAxMDtcclxuY29uc3QgQVFVQV9SQURJT19CVVRUT05fWF9TUEFDSU5HID0gODsgLy8gb25seSB1c2VkIGZvciBhdG9taWMtaW50ZXJhY3Rpb25zXHJcblxyXG5jbGFzcyBBdG9taWNJbnRlcmFjdGlvbnNDb250cm9sUGFuZWwgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtEdWFsQXRvbU1vZGVsfSBkdWFsQXRvbU1vZGVsIC0gbW9kZWwgb2YgdGhlIHNpbXVsYXRpb25cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcyAtIGZsYWcgZm9yIGVuYWJsaW5nIGhldGVyb2dlbmVvdXMgYXRvbSBjb21iaW5hdGlvbnNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIHRoYXQgY2FuIGJlIHBhc3NlZCBvbiB0byB0aGUgdW5kZXJseWluZyBub2RlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGR1YWxBdG9tTW9kZWwsIGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcywgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgeE1hcmdpbjogNSxcclxuICAgICAgeU1hcmdpbjogOCxcclxuICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgc3Ryb2tlOiAnd2hpdGUnLFxyXG4gICAgICBwYW5lbFRleHRGaWxsOiAnd2hpdGUnLFxyXG4gICAgICB0aWNrVGV4dENvbG9yOiAnYmxhY2snLFxyXG4gICAgICBidXR0b25UZXh0RmlsbDogZW5hYmxlSGV0ZXJvZ2VuZW91c0F0b21zID8gJ2JsYWNrJyA6ICd3aGl0ZScsXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgY29ybmVyUmFkaXVzOiBTT01Db25zdGFudHMuUEFORUxfQ09STkVSX1JBRElVUyxcclxuICAgICAgbWluV2lkdGg6IDAsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBUaGlzIGNvbnRyb2wgcGFuZWwgd2lkdGggZGlmZmVycyBiZXR3ZWVuIFNPTSBmdWxsIHZlcnNpb24gYW5kIHRoZSBBdG9taWMgSW50ZXJhY3Rpb25zIHNpbSwgc28gd2UgYXJlIHVzaW5nXHJcbiAgICAvLyBkaWZmZXJlbnQgbWF4IHdpZHRoIHZhbHVlcy4gIFRoZXNlIHdlcmUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cclxuICAgIGNvbnN0IFNMSURFUl9USVRMRV9NQVhfV0lEVEggPSBlbmFibGVIZXRlcm9nZW5lb3VzQXRvbXMgPyAyMjUgOiAxNTA7XHJcbiAgICBjb25zdCBOT1JNQUxfVEVYVF9NQVhfV0lEVEggPSBlbmFibGVIZXRlcm9nZW5lb3VzQXRvbXMgPyAyMDAgOiAxNjU7XHJcblxyXG4gICAgLy8gd2hpdGUgdGV4dCB3aXRoaW4gU09NIGZ1bGwgdmVyc2lvbiwgYmxhY2sgdGV4dCBpbiBBdG9taWMgSW50ZXJhY3Rpb25zXHJcbiAgICAvLyB3aGl0ZSBzdHJva2UgYXJvdW5kIHRoZSBhdG9tcyAmIG1vbGVjdWxlcyBwYW5lbCB3aXRoaW4gU09NIGZ1bGwgdmVyc2lvbiwgYmxhY2sgc3Ryb2tlIGluIEF0b21pYyBJbnRlcmFjdGlvbnNcclxuICAgIGxldCBuZW9uQW5kTmVvbkxhYmVsSXRlbXM7XHJcbiAgICBsZXQgYXJnb25BbmRBcmdvbkxhYmVsSXRlbXM7XHJcbiAgICBsZXQgb3h5Z2VuQW5kT3h5Z2VuTGFiZWxJdGVtcztcclxuICAgIGxldCBuZW9uQW5kQXJnb25MYWJlbEl0ZW1zO1xyXG4gICAgbGV0IG5lb25BbmRPeHlnZW5MYWJlbEl0ZW1zO1xyXG4gICAgbGV0IGFyZ29uQW5kT3h5Z2VuTGFiZWxJdGVtcztcclxuICAgIGxldCBhZGp1c3RhYmxlQXR0cmFjdGlvbjtcclxuICAgIGxldCBhdG9tUGFpclNlbGVjdG9yO1xyXG4gICAgbGV0IGxhYmVsV2lkdGg7XHJcbiAgICBsZXQgY3JlYXRlTGFiZWxOb2RlO1xyXG4gICAgbGV0IGxhYmVsTm9kZXM7XHJcbiAgICBsZXQgdGl0bGVOb2RlO1xyXG4gICAgY29uc3Qgc2xpZGVyVHJhY2tXaWR0aCA9IDE0MDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuICAgIC8vIGNvbW1vbiBvcHRpb25zIGZvciByYWRpbyBidXR0b24gbGFiZWxzXHJcbiAgICBjb25zdCBsYWJlbFRleHRPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBOT1JNQUxfVEVYVF9GT05ULFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmJ1dHRvblRleHRGaWxsLFxyXG4gICAgICBtYXhXaWR0aDogZW5hYmxlSGV0ZXJvZ2VuZW91c0F0b21zID8gTk9STUFMX1RFWFRfTUFYX1dJRFRIIC8gMiA6IE5PUk1BTF9URVhUX01BWF9XSURUSFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBhbGxvd3MgdXNlciB0byBzZWxlY3QgZnJvbSBhIGZpeGVkIGxpc3Qgb2YgaGV0ZXJvZ2VuZW91cyBhbmQgaG9tb2dlbmVvdXMgY29tYmluYXRpb25zIG9mIGF0b21zXHJcbiAgICBpZiAoIGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcyApIHtcclxuICAgICAgbmVvbkFuZE5lb25MYWJlbEl0ZW1zID0gW1xyXG4gICAgICAgIG5ldyBUZXh0KCBuZW9uU3RyaW5nLCBsYWJlbFRleHRPcHRpb25zICksXHJcbiAgICAgICAgbmV3IFRleHQoIG5lb25TdHJpbmcsIGxhYmVsVGV4dE9wdGlvbnMgKVxyXG4gICAgICBdO1xyXG4gICAgICBhcmdvbkFuZEFyZ29uTGFiZWxJdGVtcyA9IFtcclxuICAgICAgICBuZXcgVGV4dCggYXJnb25TdHJpbmcsIGxhYmVsVGV4dE9wdGlvbnMgKSxcclxuICAgICAgICBuZXcgVGV4dCggYXJnb25TdHJpbmcsIGxhYmVsVGV4dE9wdGlvbnMgKVxyXG4gICAgICBdO1xyXG4gICAgICBveHlnZW5BbmRPeHlnZW5MYWJlbEl0ZW1zID0gW1xyXG4gICAgICAgIG5ldyBUZXh0KCBveHlnZW5TdHJpbmcsIGxhYmVsVGV4dE9wdGlvbnMgKSxcclxuICAgICAgICBuZXcgVGV4dCggb3h5Z2VuU3RyaW5nLCBsYWJlbFRleHRPcHRpb25zIClcclxuICAgICAgXTtcclxuICAgICAgbmVvbkFuZEFyZ29uTGFiZWxJdGVtcyA9IFtcclxuICAgICAgICBuZXcgVGV4dCggbmVvblN0cmluZywgbGFiZWxUZXh0T3B0aW9ucyApLFxyXG4gICAgICAgIG5ldyBUZXh0KCBhcmdvblN0cmluZywgbGFiZWxUZXh0T3B0aW9ucyApXHJcbiAgICAgIF07XHJcbiAgICAgIG5lb25BbmRPeHlnZW5MYWJlbEl0ZW1zID0gW1xyXG4gICAgICAgIG5ldyBUZXh0KCBuZW9uU3RyaW5nLCBsYWJlbFRleHRPcHRpb25zICksXHJcbiAgICAgICAgbmV3IFRleHQoIG94eWdlblN0cmluZywgbGFiZWxUZXh0T3B0aW9ucyApXHJcbiAgICAgIF07XHJcbiAgICAgIGFyZ29uQW5kT3h5Z2VuTGFiZWxJdGVtcyA9IFtcclxuICAgICAgICBuZXcgVGV4dCggYXJnb25TdHJpbmcsIGxhYmVsVGV4dE9wdGlvbnMgKSxcclxuICAgICAgICBuZXcgVGV4dCggb3h5Z2VuU3RyaW5nLCBsYWJlbFRleHRPcHRpb25zIClcclxuICAgICAgXTtcclxuICAgICAgY29uc3QgY3VzdG9tQXR0cmFjdGlvbkxhYmVsID0gbmV3IFRleHQoIGN1c3RvbUF0dHJhY3Rpb25TdHJpbmcsIHtcclxuICAgICAgICBmb250OiBOT1JNQUxfVEVYVF9GT05ULFxyXG4gICAgICAgIGZpbGw6IG9wdGlvbnMuYnV0dG9uVGV4dEZpbGwsXHJcbiAgICAgICAgbWF4V2lkdGg6IE5PUk1BTF9URVhUX01BWF9XSURUSFxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IHB1c2hwaW5JbWFnZSA9IG5ldyBJbWFnZSggcHVzaFBpbl9wbmcsIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3B1c2hwaW5JbWFnZScgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHB1c2hwaW5JbWFnZS5zY2FsZSggMTUgLyBwdXNocGluSW1hZ2UuaGVpZ2h0ICk7XHJcbiAgICAgIGNvbnN0IG1heFdpZHRoT2ZUaXRsZVRleHQgPSAxMDA7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgY29uc3QgcGlubmVkTm9kZVRleHQgPSBuZXcgSEJveCgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBwdXNocGluSW1hZ2UsXHJcbiAgICAgICAgICBuZXcgVGV4dCggcGlubmVkU3RyaW5nLCB7XHJcbiAgICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTAgKSxcclxuICAgICAgICAgICAgbWF4V2lkdGg6IG1heFdpZHRoT2ZUaXRsZVRleHQsXHJcbiAgICAgICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncGlubmVkTm9kZVRleHQnIClcclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICAgIG5ldyBIU3RydXQoIHB1c2hwaW5JbWFnZS53aWR0aCApXHJcbiAgICAgICAgXSxcclxuICAgICAgICBzcGFjaW5nOiA1XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IG1vdmluZ05vZGVUZXh0ID0gbmV3IFRleHQoIG1vdmluZ1N0cmluZywge1xyXG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTAgKSxcclxuICAgICAgICBtYXhXaWR0aDogbWF4V2lkdGhPZlRpdGxlVGV4dCxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vdmluZ05vZGVUZXh0JyApXHJcbiAgICAgIH0gKTtcclxuICAgICAgbGFiZWxOb2RlcyA9IFsgcGlubmVkTm9kZVRleHQsIG1vdmluZ05vZGVUZXh0IF07XHJcbiAgICAgIGxhYmVsV2lkdGggPSBNYXRoLm1heChcclxuICAgICAgICBuZW9uQW5kQXJnb25MYWJlbEl0ZW1zWyAwIF0ud2lkdGggKyBuZW9uQW5kQXJnb25MYWJlbEl0ZW1zWyAxIF0ud2lkdGgsXHJcbiAgICAgICAgYXJnb25BbmRBcmdvbkxhYmVsSXRlbXNbIDAgXS53aWR0aCArIGFyZ29uQW5kQXJnb25MYWJlbEl0ZW1zWyAxIF0ud2lkdGgsXHJcbiAgICAgICAgb3h5Z2VuQW5kT3h5Z2VuTGFiZWxJdGVtc1sgMCBdLndpZHRoICsgb3h5Z2VuQW5kT3h5Z2VuTGFiZWxJdGVtc1sgMSBdLndpZHRoLFxyXG4gICAgICAgIG5lb25BbmROZW9uTGFiZWxJdGVtc1sgMCBdLndpZHRoICsgbmVvbkFuZE5lb25MYWJlbEl0ZW1zWyAxIF0ud2lkdGgsXHJcbiAgICAgICAgbmVvbkFuZE94eWdlbkxhYmVsSXRlbXNbIDAgXS53aWR0aCArIG5lb25BbmRPeHlnZW5MYWJlbEl0ZW1zWyAxIF0ud2lkdGggKTtcclxuICAgICAgbGFiZWxXaWR0aCA9IE1hdGgubWF4KFxyXG4gICAgICAgIGxhYmVsTm9kZXNbIDAgXS53aWR0aCAqIDIsXHJcbiAgICAgICAgbGFiZWxOb2Rlc1sgMSBdLndpZHRoICogMixcclxuICAgICAgICBsYWJlbFdpZHRoLCBzbGlkZXJUcmFja1dpZHRoLFxyXG4gICAgICAgIG9wdGlvbnMubWluV2lkdGggLSAyICogUEFORUxfWF9NQVJHSU4gLSAyICogUkFESU9fQlVUVE9OX1JBRElVUyAtIEFRVUFfUkFESU9fQlVUVE9OX1hfU1BBQ0lORyApO1xyXG5cclxuICAgICAgLy8gZnVuY3Rpb24gdG8gY3JlYXRlIGEgbGFiZWwgbm9kZVxyXG4gICAgICBjb25zdCBjcmVhdGVMYWJlbE5vZGUgPSBhdG9tTmFtZVRleHROb2RlcyA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3RydXRXaWR0aDEgPSBsYWJlbFdpZHRoIC8gMiAtIGF0b21OYW1lVGV4dE5vZGVzWyAwIF0ud2lkdGg7XHJcbiAgICAgICAgY29uc3Qgc3RydXRXaWR0aDIgPSBsYWJlbFdpZHRoIC8gMiAtIGF0b21OYW1lVGV4dE5vZGVzWyAxIF0ud2lkdGg7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICBjaGlsZHJlbjogWyBhdG9tTmFtZVRleHROb2Rlc1sgMCBdLCBuZXcgSFN0cnV0KCBzdHJ1dFdpZHRoMSApLCBhdG9tTmFtZVRleHROb2Rlc1sgMSBdLCBuZXcgSFN0cnV0KCBzdHJ1dFdpZHRoMiApIF1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjb25zdCByYWRpb0J1dHRvbkdyb3VwID0gbmV3IEFxdWFSYWRpb0J1dHRvbkdyb3VwKFxyXG4gICAgICAgIGR1YWxBdG9tTW9kZWwuYXRvbVBhaXJQcm9wZXJ0eSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsTm9kZSggbmVvbkFuZE5lb25MYWJlbEl0ZW1zICksXHJcbiAgICAgICAgICAgIHZhbHVlOiBBdG9tUGFpci5ORU9OX05FT04sXHJcbiAgICAgICAgICAgIHRhbmRlbU5hbWU6ICduZW9uQW5kTmVvblJhZGlvQnV0dG9uJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gY3JlYXRlTGFiZWxOb2RlKCBhcmdvbkFuZEFyZ29uTGFiZWxJdGVtcyApLFxyXG4gICAgICAgICAgICB2YWx1ZTogQXRvbVBhaXIuQVJHT05fQVJHT04sXHJcbiAgICAgICAgICAgIHRhbmRlbU5hbWU6ICdhcmdvbkFuZEFyZ29uUmFkaW9CdXR0b24nXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBjcmVhdGVMYWJlbE5vZGUoIG94eWdlbkFuZE94eWdlbkxhYmVsSXRlbXMgKSxcclxuICAgICAgICAgICAgdmFsdWU6IEF0b21QYWlyLk9YWUdFTl9PWFlHRU4sXHJcbiAgICAgICAgICAgIHRhbmRlbU5hbWU6ICdveHlnZW5BbmRPeHlnZW5SYWRpb0J1dHRvbidcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsTm9kZSggbmVvbkFuZEFyZ29uTGFiZWxJdGVtcyApLFxyXG4gICAgICAgICAgICB2YWx1ZTogQXRvbVBhaXIuTkVPTl9BUkdPTixcclxuICAgICAgICAgICAgdGFuZGVtTmFtZTogJ25lb25BbmRBcmdvblJhZGlvQnV0dG9uJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gY3JlYXRlTGFiZWxOb2RlKCBuZW9uQW5kT3h5Z2VuTGFiZWxJdGVtcyApLFxyXG4gICAgICAgICAgICB2YWx1ZTogQXRvbVBhaXIuTkVPTl9PWFlHRU4sXHJcbiAgICAgICAgICAgIHRhbmRlbU5hbWU6ICduZW9uQW5kT3h5Z2VuUmFkaW9CdXR0b24nXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBjcmVhdGVMYWJlbE5vZGUoIGFyZ29uQW5kT3h5Z2VuTGFiZWxJdGVtcyApLFxyXG4gICAgICAgICAgICB2YWx1ZTogQXRvbVBhaXIuQVJHT05fT1hZR0VOLFxyXG4gICAgICAgICAgICB0YW5kZW1OYW1lOiAnYXJnb25BbmRPeHlnZW5SYWRpb0J1dHRvbidcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGN1c3RvbUF0dHJhY3Rpb25MYWJlbCxcclxuICAgICAgICAgICAgdmFsdWU6IEF0b21QYWlyLkFESlVTVEFCTEUsXHJcbiAgICAgICAgICAgIHRhbmRlbU5hbWU6ICdhZGp1c3RhYmxlUmFkaW9CdXR0b24nXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzcGFjaW5nOiAxMyxcclxuICAgICAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgICByYWRpdXM6IFJBRElPX0JVVFRPTl9SQURJVVMsXHJcbiAgICAgICAgICAgIHhTcGFjaW5nOiBBUVVBX1JBRElPX0JVVFRPTl9YX1NQQUNJTkdcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JhZGlvQnV0dG9uR3JvdXAnIClcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBjcmVhdGUgdGhlIHRpdGxlIG9mIHRoZSBwYW5lbCBpbiBzdWNoIGEgd2F5IHRoYXQgaXQgd2lsbCBhbGlnbiBpbiBhIGNvbHVtbiB3aXRoIHRoZSBhdG9tIHNlbGVjdGlvbnNcclxuICAgICAgY29uc3QgY3JlYXRlVGl0bGUgPSBsYWJlbE5vZGVQYWlyID0+IHtcclxuICAgICAgICBjb25zdCBzdHJ1dFdpZHRoMSA9IFJBRElPX0JVVFRPTl9SQURJVVM7XHJcbiAgICAgICAgY29uc3Qgc3RydXRXaWR0aDIgPSAoIGxhYmVsV2lkdGggLyAyIC0gbGFiZWxOb2RlUGFpclsgMCBdLndpZHRoICk7XHJcbiAgICAgICAgY29uc3Qgc3RydXRXaWR0aDMgPSAoIGxhYmVsV2lkdGggLyAyIC0gbGFiZWxOb2RlUGFpclsgMSBdLndpZHRoICk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgSFN0cnV0KCBzdHJ1dFdpZHRoMSApLFxyXG4gICAgICAgICAgICBsYWJlbE5vZGVQYWlyWyAwIF0sXHJcbiAgICAgICAgICAgIG5ldyBIU3RydXQoIHN0cnV0V2lkdGgyICsgOSArIFJBRElPX0JVVFRPTl9SQURJVVMgKSxcclxuICAgICAgICAgICAgbGFiZWxOb2RlUGFpclsgMSBdLFxyXG4gICAgICAgICAgICBuZXcgSFN0cnV0KCBzdHJ1dFdpZHRoMyArIDEwIClcclxuICAgICAgICAgIF1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH07XHJcbiAgICAgIHRpdGxlTm9kZSA9IGNyZWF0ZVRpdGxlKCBsYWJlbE5vZGVzICk7XHJcblxyXG4gICAgICAvLyBwdXQgdGhlIHRpdGxlIGFuZCByYWRpbyBidXR0b24gZ3JvdXAgdG9nZXRoZXIgaW50byBhIHNpbmdsZSBub2RlXHJcbiAgICAgIGF0b21QYWlyU2VsZWN0b3IgPSBuZXcgVkJveCgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbIHRpdGxlTm9kZSwgcmFkaW9CdXR0b25Hcm91cCBdLFxyXG4gICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgc3BhY2luZzogNVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aXRsZU5vZGUuYWxpZ24gPSAnY2VudGVyJztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gYWxsb3dzIHRoZSB1c2VyIHRvIGNob29zZSB0aGUgdHlwZSBvZiBhdG9tLCBib3RoIGF0b21zIHdpbGwgYmUgdGhlIHNhbWUgdHlwZVxyXG4gICAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVGV4dCggYXRvbXNTdHJpbmcsIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0ICksXHJcbiAgICAgICAgZmlsbDogb3B0aW9ucy5wYW5lbFRleHRGaWxsLFxyXG4gICAgICAgIG1heFdpZHRoOiBUSVRMRV9URVhUX1dJRFRILFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGl0bGVUZXh0JyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFNldCB1cCBvYmplY3RzIHRoYXQgZGVzY3JpYmUgdGhlIHBpZWNlcyB0aGF0IG1ha2UgdXAgYSBzZWxlY3RvciBpdGVtIGluIHRoZSBjb250cm9sIHBhbmVsLCBjb25mb3JtcyB0byB0aGVcclxuICAgICAgLy8gY29udHJhY3Q6IHsgbGFiZWw6IHtOb2RlfSwgaWNvbjoge05vZGV9IH1cclxuICAgICAgY29uc3QgbmVvbiA9IHtcclxuICAgICAgICBsYWJlbDogbmV3IFRleHQoIG5lb25TdHJpbmcsIGxhYmVsVGV4dE9wdGlvbnMgKSxcclxuICAgICAgICBpY29uOiBBdG9tQW5kTW9sZWN1bGVJY29uRmFjdG9yeS5jcmVhdGVJY29uKCBTdWJzdGFuY2VUeXBlLk5FT04gKVxyXG4gICAgICB9O1xyXG4gICAgICBjb25zdCBhcmdvbiA9IHtcclxuICAgICAgICBsYWJlbDogbmV3IFRleHQoIGFyZ29uU3RyaW5nLCBsYWJlbFRleHRPcHRpb25zICksXHJcbiAgICAgICAgaWNvbjogQXRvbUFuZE1vbGVjdWxlSWNvbkZhY3RvcnkuY3JlYXRlSWNvbiggU3Vic3RhbmNlVHlwZS5BUkdPTiApXHJcbiAgICAgIH07XHJcbiAgICAgIGFkanVzdGFibGVBdHRyYWN0aW9uID0ge1xyXG4gICAgICAgIGxhYmVsOiBuZXcgVGV4dCggYWRqdXN0YWJsZUF0dHJhY3Rpb25TdHJpbmcsIHtcclxuICAgICAgICAgIGZvbnQ6IE5PUk1BTF9URVhUX0ZPTlQsXHJcbiAgICAgICAgICBmaWxsOiBvcHRpb25zLmJ1dHRvblRleHRGaWxsLFxyXG4gICAgICAgICAgbWF4V2lkdGg6IE5PUk1BTF9URVhUX01BWF9XSURUSFxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBpY29uOiBBdG9tQW5kTW9sZWN1bGVJY29uRmFjdG9yeS5jcmVhdGVJY29uKCBTdWJzdGFuY2VUeXBlLkFESlVTVEFCTEVfQVRPTSApXHJcbiAgICAgIH07XHJcbiAgICAgIGxhYmVsTm9kZXMgPSB7XHJcbiAgICAgICAgbGFiZWw6IHRpdGxlVGV4dFxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gY29tcHV0ZSB0aGUgbWF4aW11bSBpdGVtIHdpZHRoXHJcbiAgICAgIGNvbnN0IHdpZGVzdExhYmVsQW5kSWNvblNwZWMgPSBfLm1heEJ5KFxyXG4gICAgICAgIFsgbmVvbiwgYXJnb24sIGFkanVzdGFibGVBdHRyYWN0aW9uLCBsYWJlbE5vZGVzIF0sXHJcbiAgICAgICAgaXRlbSA9PiBpdGVtLmxhYmVsLndpZHRoICsgKCAoIGl0ZW0uaWNvbiApID8gaXRlbS5pY29uLndpZHRoIDogMCApXHJcbiAgICAgICk7XHJcbiAgICAgIGxhYmVsV2lkdGggPSB3aWRlc3RMYWJlbEFuZEljb25TcGVjLmxhYmVsLndpZHRoICsgKCAoIHdpZGVzdExhYmVsQW5kSWNvblNwZWMuaWNvbiApID8gd2lkZXN0TGFiZWxBbmRJY29uU3BlYy5pY29uLndpZHRoIDogMCApO1xyXG4gICAgICBsYWJlbFdpZHRoID0gTWF0aC5tYXgoXHJcbiAgICAgICAgbGFiZWxXaWR0aCxcclxuICAgICAgICBzbGlkZXJUcmFja1dpZHRoLFxyXG4gICAgICAgIG9wdGlvbnMubWluV2lkdGggLSAyICogUEFORUxfWF9NQVJHSU4gKTtcclxuXHJcbiAgICAgIC8vIHBhZCBpbnNlcnRzIGEgc3BhY2luZyBub2RlIChIU3RydXQpIHNvIHRoYXQgdGhlIHRleHQsIHNwYWNlIGFuZCBpbWFnZSB0b2dldGhlciBvY2N1cHkgYSBjZXJ0YWluIGZpeGVkIHdpZHRoLlxyXG4gICAgICBjcmVhdGVMYWJlbE5vZGUgPSBhdG9tU2VsZWN0b3JMYWJlbFNwZWMgPT4ge1xyXG4gICAgICAgIGlmICggYXRvbVNlbGVjdG9yTGFiZWxTcGVjLmljb24gKSB7XHJcbiAgICAgICAgICBjb25zdCBzdHJ1dFdpZHRoID0gbGFiZWxXaWR0aCAtIGF0b21TZWxlY3RvckxhYmVsU3BlYy5sYWJlbC53aWR0aCAtIGF0b21TZWxlY3RvckxhYmVsU3BlYy5pY29uLndpZHRoO1xyXG4gICAgICAgICAgcmV0dXJuIG5ldyBIQm94KCB7IGNoaWxkcmVuOiBbIGF0b21TZWxlY3RvckxhYmVsU3BlYy5sYWJlbCwgbmV3IEhTdHJ1dCggc3RydXRXaWR0aCApLCBhdG9tU2VsZWN0b3JMYWJlbFNwZWMuaWNvbiBdIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gbmV3IEhCb3goIHsgY2hpbGRyZW46IFsgYXRvbVNlbGVjdG9yTGFiZWxTcGVjLmxhYmVsIF0gfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IHJhZGlvQnV0dG9uQ29udGVudCA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICB2YWx1ZTogQXRvbVBhaXIuTkVPTl9ORU9OLFxyXG4gICAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gY3JlYXRlTGFiZWxOb2RlKCBuZW9uICksXHJcbiAgICAgICAgICB0YW5kZW1OYW1lOiAnbmVvblJhZGlvQnV0dG9uJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdmFsdWU6IEF0b21QYWlyLkFSR09OX0FSR09OLFxyXG4gICAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gY3JlYXRlTGFiZWxOb2RlKCBhcmdvbiApLFxyXG4gICAgICAgICAgdGFuZGVtTmFtZTogJ2FyZ29uUmFkaW9CdXR0b24nXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB2YWx1ZTogQXRvbVBhaXIuQURKVVNUQUJMRSxcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsTm9kZSggYWRqdXN0YWJsZUF0dHJhY3Rpb24gKSxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdhZGp1c3RhYmxlQXR0cmFjdGlvblJhZGlvQnV0dG9uJ1xyXG4gICAgICAgIH1cclxuICAgICAgXTtcclxuICAgICAgY29uc3QgcmFkaW9CdXR0b25Hcm91cCA9IG5ldyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAoIGR1YWxBdG9tTW9kZWwuYXRvbVBhaXJQcm9wZXJ0eSwgcmFkaW9CdXR0b25Db250ZW50LCB7XHJcbiAgICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXHJcbiAgICAgICAgcmFkaW9CdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICBjb3JuZXJSYWRpdXM6IDUsXHJcbiAgICAgICAgICBiYXNlQ29sb3I6ICdibGFjaycsXHJcbiAgICAgICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkTGluZVdpZHRoOiAxLFxyXG4gICAgICAgICAgICBzZWxlY3RlZFN0cm9rZTogJ3doaXRlJyxcclxuICAgICAgICAgICAgZGVzZWxlY3RlZExpbmVXaWR0aDogMCxcclxuICAgICAgICAgICAgZGVzZWxlY3RlZENvbnRlbnRPcGFjaXR5OiAxXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JhZGlvQnV0dG9uR3JvdXAnIClcclxuICAgICAgfSApO1xyXG4gICAgICBhdG9tUGFpclNlbGVjdG9yID0gcmFkaW9CdXR0b25Hcm91cDtcclxuXHJcbiAgICAgIHRpdGxlTm9kZSA9IG5ldyBCYWNrZ3JvdW5kTm9kZSggbGFiZWxOb2Rlcy5sYWJlbCwge1xyXG4gICAgICAgIHlNYXJnaW46IDEsXHJcbiAgICAgICAgcmVjdGFuZ2xlT3B0aW9uczoge1xyXG4gICAgICAgICAgZmlsbDogU09NQ29sb3JzLmJhY2tncm91bmRQcm9wZXJ0eSxcclxuICAgICAgICAgIG9wYWNpdHk6IDFcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb21tb25TbGlkZXJPcHRpb25zID0gbWVyZ2UoIHt9LCBTT01Db25zdGFudHMuQURKVVNUQUJMRV9BVFRSQUNUSU9OX1NMSURFUl9DT01NT05fT1BUSU9OUywge1xyXG4gICAgICB0cmFja1NpemU6IG5ldyBEaW1lbnNpb24yKCBzbGlkZXJUcmFja1dpZHRoLCA1ICksXHJcbiAgICAgIG1ham9yVGlja1N0cm9rZTogb3B0aW9ucy5wYW5lbFRleHRGaWxsLFxyXG4gICAgICB0cmFja1N0cm9rZTogb3B0aW9ucy5wYW5lbFRleHRGaWxsLFxyXG4gICAgICBjb25zdHJhaW5WYWx1ZTogdmFsdWUgPT4gVXRpbHMucm91bmRUb0ludGVydmFsKCB2YWx1ZSwgNSApLFxyXG4gICAgICBzdGFydERyYWc6ICgpID0+IHtcclxuICAgICAgICBkdWFsQXRvbU1vZGVsLnNldE1vdGlvblBhdXNlZCggdHJ1ZSApO1xyXG4gICAgICB9LFxyXG4gICAgICBlbmREcmFnOiAoKSA9PiB7XHJcbiAgICAgICAgZHVhbEF0b21Nb2RlbC5zZXRNb3Rpb25QYXVzZWQoIGZhbHNlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBtYXhUaWNrVGV4dFdpZHRoID0gZW5hYmxlSGV0ZXJvZ2VuZW91c0F0b21zID8gODUgOiAzNTtcclxuICAgIGNvbnN0IHRpY2tUZXh0T3B0aW9ucyA9IHtcclxuICAgICAgZm9udDogU09NQ29uc3RhbnRzLlNMSURFUl9USUNLX1RFWFRfRk9OVCxcclxuICAgICAgZmlsbDogb3B0aW9ucy5wYW5lbFRleHRGaWxsLFxyXG4gICAgICBtYXhXaWR0aDogbWF4VGlja1RleHRXaWR0aFxyXG4gICAgfTtcclxuICAgIGNvbnN0IHNtYWxsVGV4dCA9IG5ldyBUZXh0KCBzbWFsbFN0cmluZywgdGlja1RleHRPcHRpb25zICk7XHJcbiAgICBjb25zdCBsYXJnZVRleHQgPSBuZXcgVGV4dCggbGFyZ2VTdHJpbmcsIHRpY2tUZXh0T3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGF0b21EaWFtZXRlclNsaWRlciA9IG5ldyBUaXRsZWRTbGlkZXIoXHJcbiAgICAgIGR1YWxBdG9tTW9kZWwuYWRqdXN0YWJsZUF0b21EaWFtZXRlclByb3BlcnR5LFxyXG4gICAgICBuZXcgUmFuZ2UoIFNPTUNvbnN0YW50cy5NSU5fU0lHTUEsIFNPTUNvbnN0YW50cy5NQVhfU0lHTUEgKSxcclxuICAgICAgYXRvbURpYW1ldGVyU3RyaW5nLFxyXG4gICAgICBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdhdG9tRGlhbWV0ZXJTbGlkZXInICksXHJcbiAgICAgIHtcclxuICAgICAgICB0aXRsZU9wdGlvbnM6IHtcclxuICAgICAgICAgIGZpbGw6IG9wdGlvbnMucGFuZWxUZXh0RmlsbCxcclxuICAgICAgICAgIG1heFdpZHRoOiBTTElERVJfVElUTEVfTUFYX1dJRFRIXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzbGlkZXJPcHRpb25zOiBjb21tb25TbGlkZXJPcHRpb25zLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdVc2VkIGZvciBcXCdBZGp1c3RhYmxlIEF0dHJhY3Rpb25cXCcgb25seSdcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcyApIHtcclxuICAgICAgYXRvbURpYW1ldGVyU2xpZGVyLnNsaWRlci5hZGRNYWpvclRpY2soIFNPTUNvbnN0YW50cy5NSU5fU0lHTUEgKTtcclxuICAgICAgYXRvbURpYW1ldGVyU2xpZGVyLnNsaWRlci5hZGRNYWpvclRpY2soIFNPTUNvbnN0YW50cy5NQVhfU0lHTUEgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhdG9tRGlhbWV0ZXJTbGlkZXIuc2xpZGVyLmFkZE1ham9yVGljayggU09NQ29uc3RhbnRzLk1JTl9TSUdNQSwgc21hbGxUZXh0ICk7XHJcbiAgICAgIGF0b21EaWFtZXRlclNsaWRlci5zbGlkZXIuYWRkTWFqb3JUaWNrKCBTT01Db25zdGFudHMuTUFYX1NJR01BLCBsYXJnZVRleHQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgaW50ZXJhY3Rpb24gc3RyZW5ndGggc2xpZGVyXHJcbiAgICBjb25zdCBpbnRlcmFjdGlvblN0cmVuZ3RoU2xpZGVyID0gbmV3IFRpdGxlZFNsaWRlcihcclxuICAgICAgZHVhbEF0b21Nb2RlbC5hZGp1c3RhYmxlQXRvbUludGVyYWN0aW9uU3RyZW5ndGhQcm9wZXJ0eSxcclxuICAgICAgbmV3IFJhbmdlKCBTT01Db25zdGFudHMuTUlOX0VQU0lMT04sIFNPTUNvbnN0YW50cy5NQVhfRVBTSUxPTiApLFxyXG4gICAgICBpbnRlcmFjdGlvblN0cmVuZ3RoU3RyaW5nLFxyXG4gICAgICBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbnRlcmFjdGlvblN0cmVuZ3RoU2xpZGVyJyApLFxyXG4gICAgICB7XHJcbiAgICAgICAgc2xpZGVyT3B0aW9uczogY29tbW9uU2xpZGVyT3B0aW9ucyxcclxuICAgICAgICB0aXRsZU9wdGlvbnM6IHtcclxuICAgICAgICAgIGZpbGw6IG9wdGlvbnMucGFuZWxUZXh0RmlsbCxcclxuICAgICAgICAgIG1heFdpZHRoOiBTTElERVJfVElUTEVfTUFYX1dJRFRIXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVXNlZCBmb3IgXFwnQWRqdXN0YWJsZSBBdHRyYWN0aW9uXFwnIG9ubHknXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBjb25zdCB3ZWFrVGV4dCA9IG5ldyBUZXh0KCB3ZWFrU3RyaW5nLCB0aWNrVGV4dE9wdGlvbnMgKTtcclxuICAgIGludGVyYWN0aW9uU3RyZW5ndGhTbGlkZXIuc2xpZGVyLmFkZE1ham9yVGljayggU09NQ29uc3RhbnRzLk1JTl9FUFNJTE9OLCB3ZWFrVGV4dCApO1xyXG4gICAgY29uc3Qgc3Ryb25nVGV4dCA9IG5ldyBUZXh0KCBzdHJvbmdTdHJpbmcsIHRpY2tUZXh0T3B0aW9ucyApO1xyXG4gICAgaW50ZXJhY3Rpb25TdHJlbmd0aFNsaWRlci5zbGlkZXIuYWRkTWFqb3JUaWNrKCBTT01Db25zdGFudHMuTUFYX0VQU0lMT04sIHN0cm9uZ1RleHQgKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgYWxpZ246ICdjZW50ZXInLCBjaGlsZHJlbjogWyBhdG9tUGFpclNlbGVjdG9yIF0sXHJcbiAgICAgIHNwYWNpbmc6IDVcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByYWRpb0J1dHRvblBhbmVsID0gbmV3IFBhbmVsKCBjb250ZW50LCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXHJcbiAgICAgIGNvcm5lclJhZGl1czogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXHJcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGgsXHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuZmlsbCxcclxuICAgICAgeE1hcmdpbjogUEFORUxfWF9NQVJHSU4sXHJcbiAgICAgIG1pbldpZHRoOiBvcHRpb25zLm1pbldpZHRoLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCByYWRpb0J1dHRvblBhbmVsICk7XHJcblxyXG4gICAgLy8gaGlkZSBvciBzaG93IHRoZSBjb250cm9scyBmb3IgaGFuZGxpbmcgdGhlIGFkanVzdGFibGUgYXRvbSBiYXNlZCBvbiB0aGUgYXRvbSBwYWlyIHNldHRpbmdcclxuICAgIGR1YWxBdG9tTW9kZWwuYXRvbVBhaXJQcm9wZXJ0eS5saW5rKCBhdG9tUGFpciA9PiB7XHJcbiAgICAgIGlmICggYXRvbVBhaXIgPT09IEF0b21QYWlyLkFESlVTVEFCTEUgKSB7XHJcbiAgICAgICAgY29udGVudC5hZGRDaGlsZCggYXRvbURpYW1ldGVyU2xpZGVyICk7XHJcbiAgICAgICAgY29udGVudC5hZGRDaGlsZCggaW50ZXJhY3Rpb25TdHJlbmd0aFNsaWRlciApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggY29udGVudC5oYXNDaGlsZCggYXRvbURpYW1ldGVyU2xpZGVyICkgKSB7XHJcbiAgICAgICAgICBjb250ZW50LnJlbW92ZUNoaWxkKCBhdG9tRGlhbWV0ZXJTbGlkZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBjb250ZW50Lmhhc0NoaWxkKCBpbnRlcmFjdGlvblN0cmVuZ3RoU2xpZGVyICkgKSB7XHJcbiAgICAgICAgICBjb250ZW50LnJlbW92ZUNoaWxkKCBpbnRlcmFjdGlvblN0cmVuZ3RoU2xpZGVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSB0aXRsZSBub2RlIGFmdGVyIHJhZGlvIGJ1dHRvbiBwYW5lbCBpcyBhZGRlZCBpbiB0aGUgU09NIGZ1bGwgdmVyc2lvbi4gIFRoaXMgdGl0bGUgaXMgYXQgdGhlIHRvcCBjZW50ZXIgb2ZcclxuICAgIC8vIHRoZSBwYW5lbC5cclxuICAgIGlmICggIWVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcyApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggdGl0bGVOb2RlICk7XHJcblxyXG4gICAgICAvLyBLZWVwIHRoZSB0aXRsZSBub2RlIGNlbnRlcmVkIGlmIGl0cyBib3VuZHMgY2hhbmdlICh3aGljaCBjYW4gb25seSBiZSBkb25lIHRocm91Z2ggcGhldC1pbykuXHJcbiAgICAgIHRpdGxlTm9kZS5sb2NhbEJvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgICB0aXRsZU5vZGUuY2VudGVyWCA9IHJhZGlvQnV0dG9uUGFuZWwuY2VudGVyWDtcclxuICAgICAgICB0aXRsZU5vZGUuYm90dG9tID0gcmFkaW9CdXR0b25QYW5lbC50b3AgKyA1OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIG92ZXJsYXAgcmVhc29uYWJseSB3ZWxsXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIEhpZGUgdGhlIHRpdGxlIGlmIGFsbCBpdGVtcyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSByYWRpbyBidXR0b24gZ3JvdXAgKHdoaWNoIGNhbiBvbmx5IGJlIGRvbmUgdGhyb3VnaCBwaGV0LWlvKS5cclxuICAgICAgYXRvbVBhaXJTZWxlY3Rvci5sb2NhbEJvdW5kc1Byb3BlcnR5LmxpbmsoIGxvY2FsQm91bmRzID0+IHtcclxuICAgICAgICB0aXRsZU5vZGUudmlzaWJsZSA9ICFsb2NhbEJvdW5kcy5lcXVhbHMoIEJvdW5kczIuTk9USElORyApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc3RhdGVzT2ZNYXR0ZXIucmVnaXN0ZXIoICdBdG9taWNJbnRlcmFjdGlvbnNDb250cm9sUGFuZWwnLCBBdG9taWNJbnRlcmFjdGlvbnNDb250cm9sUGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgQXRvbWljSW50ZXJhY3Rpb25zQ29udHJvbFBhbmVsO1xyXG5cclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxjQUFjLE1BQU0sK0NBQStDO0FBQzFFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDekYsT0FBT0Msb0JBQW9CLE1BQU0sNENBQTRDO0FBQzdFLE9BQU9DLDJCQUEyQixNQUFNLDJEQUEyRDtBQUNuRyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FB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