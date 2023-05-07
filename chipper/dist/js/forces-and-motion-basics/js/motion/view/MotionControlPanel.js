// Copyright 2013-2023, University of Colorado Boulder

/**
 * Scenery node that shows the control panel for the Motion, Friction and Acceleration screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import GaugeNode from '../../../../scenery-phet/js/GaugeNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Node, Text, VBox, VStrut } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import Slider from '../../../../sun/js/Slider.js';
import VerticalCheckboxGroup from '../../../../sun/js/VerticalCheckboxGroup.js';
import SliderKnob from '../../common/view/SliderKnob.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
import ForcesAndMotionBasicsStrings from '../../ForcesAndMotionBasicsStrings.js';
import MotionConstants from '../MotionConstants.js';
import AccelerometerNode from './AccelerometerNode.js';
const accelerationString = ForcesAndMotionBasicsStrings.acceleration;
const forcesString = ForcesAndMotionBasicsStrings.forces;
const forceString = ForcesAndMotionBasicsStrings.force;
const frictionString = ForcesAndMotionBasicsStrings.friction;
const lotsString = ForcesAndMotionBasicsStrings.lots;
const massesString = ForcesAndMotionBasicsStrings.masses;
const noneString = ForcesAndMotionBasicsStrings.none;
const speedStringProperty = ForcesAndMotionBasicsStrings.speedStringProperty;
const sumOfForcesString = ForcesAndMotionBasicsStrings.sumOfForces;
const valuesString = ForcesAndMotionBasicsStrings.values;
class MotionControlPanel extends Node {
  /**
   * @param {MotionModel} model the model for the entire 'motion', 'friction' or 'acceleration' screen
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tandem: tandem
    });
    const fontSize = 18;
    const maxTextWidth = 120;

    /**
     * Create a label node with options icon
     * @param {string} text - the label string
     * @param {Object} [options]
     */
    const createLabel = (text, tandemName, options) => {
      options = merge({
        indent: 0,
        icon: new Node()
      }, options);

      // create the label for the checkbox
      const labelText = new Text(text, {
        font: new PhetFont(fontSize),
        maxWidth: maxTextWidth,
        // this is a bit of a hack to support backwards tandem API
        tandem: tandem.createTandem(tandemName).createTandem('labelText')
      });

      // optional icon needs spacing next to text
      let iconSpacer = new HStrut(0);
      if (options.icon) {
        // create a horizontal spacer for the icon
        iconSpacer = new HStrut(10);
      }
      return new HBox({
        spacing: 0,
        children: [labelText, iconSpacer, options.icon]
      });
    };

    //Icon for the forces in the control panel
    const createArrowIcon = phetioID => new ArrowNode(0, 0, 40, 0, {
      headHeight: 20,
      headWidth: 20,
      tailWidth: 10,
      fill: '#e66e23',
      stroke: 'black',
      tandem: tandem.createTandem(phetioID)
    });
    const speedometerIcon = () => {
      const speedometerIconValueProperty = new Property(0);
      return new GaugeNode(speedometerIconValueProperty, speedStringProperty, new Range(0, MotionConstants.MAX_SPEED), {
        radius: 67,
        scale: 0.2,
        tandem: tandem.createTandem('speedometerIconNode')
      });
    };
    const accelerometerIcon = () => {
      const accelerometerIconValueProperty = new Property(5); // the acclerometer icon looks best with ~5 m/s^2 filled in
      return new AccelerometerNode(accelerometerIconValueProperty, tandem.createTandem('accelerometerIcon')).mutate({
        scale: 0.3
      });
    };
    const createFrictionSlider = () => {
      //Create the friction slider and its labels.
      // Add invisible symmetric ticks + labels so the slider will be perfectly centered.  A better way to do this would be just to line things up based on the track of the slider,
      // but this makes it work with VBox/HBox
      const frictionSliderTandem = tandem.createTandem('frictionSlider');
      const frictionSlider = new HSlider(model.frictionProperty, new Range(0, MotionConstants.MAX_FRICTION), {
        trackSize: new Dimension2(150, 6),
        thumbNode: new SliderKnob(frictionSliderTandem.createTandem(Slider.THUMB_NODE_TANDEM_NAME)),
        majorTickLength: 18,
        tickLabelSpacing: 3,
        tandem: frictionSliderTandem
      });
      const sliderTickOptions = {
        font: new PhetFont(15),
        maxWidth: 125
      };
      const invisibleSliderTickOptions = merge({
        visible: false
      }, sliderTickOptions);
      frictionSlider.addMajorTick(0, new Text(noneString, merge({
        tandem: tandem.createTandem('zeroTickText')
      }, sliderTickOptions)));
      frictionSlider.addMajorTick(0, new Text(lotsString, merge({
        tandem: tandem.createTandem('invisibleZeroTickText')
      }, invisibleSliderTickOptions)));
      frictionSlider.addMajorTick(MotionConstants.MAX_FRICTION, new Text(lotsString, merge({
        tandem: tandem.createTandem('maxTickText')
      }, sliderTickOptions)));
      frictionSlider.addMajorTick(MotionConstants.MAX_FRICTION, new Text(noneString, merge({
        tandem: tandem.createTandem('invisibleMaxTickText')
      }, invisibleSliderTickOptions)));
      const frictionText = new Text(frictionString, {
        font: new PhetFont({
          size: fontSize,
          weight: 'bold'
        }),
        maxWidth: maxTextWidth,
        tandem: tandem.createTandem('frictionText')
      });
      return new VBox({
        children: [frictionText, frictionSlider],
        resize: false
      });
    };

    // Create controls for the 'motion' screen
    const createMotionControls = () => {
      // container node for checkboxes and an hstrut which makes the panel just a little wider to match the
      // other screens
      const containerNode = new Node({
        tandem: tandem.createTandem('containerNode')
      });
      const items = [{
        createNode: () => createLabel(forceString, 'showForceCheckbox', {
          icon: createArrowIcon('showForceArrowIcon')
        }),
        property: model.showForceProperty,
        tandemName: 'showForceCheckbox'
      }, {
        createNode: () => createLabel(valuesString, 'showValuesCheckbox'),
        property: model.showValuesProperty,
        tandemName: 'showValuesCheckbox'
      }, {
        createNode: () => createLabel(massesString, 'showMassesCheckbox'),
        property: model.showMassesProperty,
        tandemName: 'showMassesCheckbox'
      }, {
        createNode: () => createLabel(speedStringProperty, 'showSpeedCheckbox', {
          icon: speedometerIcon()
        }),
        property: model.showSpeedProperty,
        tandemName: 'showSpeedCheckbox'
      }];

      // create the checkboxes
      const checkboxes = new VerticalCheckboxGroup(items, {
        tandem: tandem.createTandem('checkboxGroup')
      });
      containerNode.addChild(checkboxes);

      // create an hStrut to increase the width of the controls to the right
      const hStrut = new HStrut(16, {
        leftCenter: checkboxes.rightCenter
      });
      containerNode.addChild(hStrut);
      return containerNode;
    };

    // if the slider is wider than the group of checkboxes, align the checkboxes to the left of the slider
    // otherwise, center with the checkboxes
    const layoutFrictionSlider = (checkboxes, frictionSlider) => {
      if (frictionSlider.width > checkboxes.width) {
        checkboxes.left = frictionSlider.left;
      } else {
        frictionSlider.centerX = checkboxes.centerX;
      }
    };

    // Create controls for the 'friction' screen, including a set of checkboxes and a slider
    // The slider is centered under the checkboxes, which are aligned to the left
    const createFrictionControls = () => {
      // container for all controls
      const containerNode = new Node({
        tandem: tandem.createTandem('containerNode')
      });
      const items = [{
        createNode: () => createLabel(forcesString, 'showForceCheckbox', {
          icon: createArrowIcon('showForceArrowIcon')
        }),
        property: model.showForceProperty,
        tandemName: 'showForceCheckbox'
      }, {
        createNode: () => createLabel(sumOfForcesString, 'showSumOfForcesCheckbox'),
        property: model.showSumOfForcesProperty,
        tandemName: 'showSumOfForcesCheckbox'
      }, {
        createNode: () => createLabel(valuesString, 'showValuesCheckbox'),
        property: model.showValuesProperty,
        tandemName: 'showValuesCheckbox'
      }, {
        createNode: () => createLabel(massesString, 'showMassesCheckbox'),
        property: model.showMassesProperty,
        tandemName: 'showMassesCheckbox'
      }, {
        createNode: () => createLabel(speedStringProperty, 'showSpeedCheckbox', {
          icon: speedometerIcon()
        }),
        property: model.showSpeedProperty,
        tandemName: 'showSpeedCheckbox'
      }];

      // create the checkboxes
      const checkboxes = new VerticalCheckboxGroup(items, {
        tandem: tandem.createTandem('checkboxGroup')
      });
      containerNode.addChild(checkboxes);

      // create a spacer for the checkboxes and the slider
      const strut = new VStrut(12, {
        centerTop: checkboxes.centerBottom
      });
      containerNode.addChild(strut);

      // create the slider
      const frictionSlider = createFrictionSlider();
      frictionSlider.top = strut.bottom;
      layoutFrictionSlider(checkboxes, frictionSlider);
      containerNode.addChild(frictionSlider);
      return containerNode;
    };

    // Create controls for the 'acceleration' screen
    // The slider is centered under the checkboxes, which are aligned to the left
    const createAccelerationControls = () => {
      // node containing checkboxes, spacing, and slider
      const containerNode = new Node({
        tandem: tandem.createTandem('containerNode')
      });
      const items = [{
        createNode: () => createLabel(forcesString, 'showForceCheckbox', {
          icon: createArrowIcon('showForceArrowIcon')
        }),
        property: model.showForceProperty,
        tandemName: 'showForceCheckbox'
      }, {
        createNode: () => createLabel(sumOfForcesString, 'showSumOfForcesCheckbox'),
        property: model.showSumOfForcesProperty,
        tandemName: 'showSumOfForcesCheckbox'
      }, {
        createNode: () => createLabel(valuesString, 'showValuesCheckbox'),
        property: model.showValuesProperty,
        tandemName: 'showValuesCheckbox'
      }, {
        createNode: () => createLabel(massesString, 'showMassesCheckbox'),
        property: model.showMassesProperty,
        tandemName: 'showMassesCheckbox'
      }, {
        createNode: () => createLabel(speedStringProperty, 'showSpeedCheckbox', {
          icon: speedometerIcon()
        }),
        property: model.showSpeedProperty,
        tandemName: 'showSpeedCheckbox'
      }, {
        createNode: () => createLabel(accelerationString, 'showAccelerationCheckbox', {
          icon: accelerometerIcon()
        }),
        property: model.showAccelerationProperty,
        tandemName: 'showAccelerationCheckbox'
      }];
      const checkboxes = new VerticalCheckboxGroup(items, {
        tandem: tandem.createTandem('checkboxGroup')
      });
      containerNode.addChild(checkboxes);

      // create the spacing strut
      const strut = new VStrut(12, {
        centerTop: checkboxes.centerBottom
      });
      containerNode.addChild(strut);

      // add the slider friction slider under the checkboxes
      const frictionSlider = createFrictionSlider();
      frictionSlider.top = strut.bottom;
      layoutFrictionSlider(checkboxes, frictionSlider);
      containerNode.addChild(frictionSlider);
      return containerNode;
    };

    // collect contents for the panel
    const contents = model.screen === 'motion' ? createMotionControls() : model.screen === 'friction' ? createFrictionControls() : createAccelerationControls();
    const panelNode = new Panel(contents, {
      xMargin: 12,
      yMargin: 7,
      fill: '#e3e980',
      resize: false,
      tandem: tandem.createTandem('panel')
    });
    this.addChild(panelNode.mutate({
      left: 981 - panelNode.width - 5,
      top: 5
    }));
  }
}
forcesAndMotionBasics.register('MotionControlPanel', MotionControlPanel);
export default MotionControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIm1lcmdlIiwiQXJyb3dOb2RlIiwiR2F1Z2VOb2RlIiwiUGhldEZvbnQiLCJIQm94IiwiSFN0cnV0IiwiTm9kZSIsIlRleHQiLCJWQm94IiwiVlN0cnV0IiwiSFNsaWRlciIsIlBhbmVsIiwiU2xpZGVyIiwiVmVydGljYWxDaGVja2JveEdyb3VwIiwiU2xpZGVyS25vYiIsImZvcmNlc0FuZE1vdGlvbkJhc2ljcyIsIkZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MiLCJNb3Rpb25Db25zdGFudHMiLCJBY2NlbGVyb21ldGVyTm9kZSIsImFjY2VsZXJhdGlvblN0cmluZyIsImFjY2VsZXJhdGlvbiIsImZvcmNlc1N0cmluZyIsImZvcmNlcyIsImZvcmNlU3RyaW5nIiwiZm9yY2UiLCJmcmljdGlvblN0cmluZyIsImZyaWN0aW9uIiwibG90c1N0cmluZyIsImxvdHMiLCJtYXNzZXNTdHJpbmciLCJtYXNzZXMiLCJub25lU3RyaW5nIiwibm9uZSIsInNwZWVkU3RyaW5nUHJvcGVydHkiLCJzdW1PZkZvcmNlc1N0cmluZyIsInN1bU9mRm9yY2VzIiwidmFsdWVzU3RyaW5nIiwidmFsdWVzIiwiTW90aW9uQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImZvbnRTaXplIiwibWF4VGV4dFdpZHRoIiwiY3JlYXRlTGFiZWwiLCJ0ZXh0IiwidGFuZGVtTmFtZSIsIm9wdGlvbnMiLCJpbmRlbnQiLCJpY29uIiwibGFiZWxUZXh0IiwiZm9udCIsIm1heFdpZHRoIiwiY3JlYXRlVGFuZGVtIiwiaWNvblNwYWNlciIsInNwYWNpbmciLCJjaGlsZHJlbiIsImNyZWF0ZUFycm93SWNvbiIsInBoZXRpb0lEIiwiaGVhZEhlaWdodCIsImhlYWRXaWR0aCIsInRhaWxXaWR0aCIsImZpbGwiLCJzdHJva2UiLCJzcGVlZG9tZXRlckljb24iLCJzcGVlZG9tZXRlckljb25WYWx1ZVByb3BlcnR5IiwiTUFYX1NQRUVEIiwicmFkaXVzIiwic2NhbGUiLCJhY2NlbGVyb21ldGVySWNvbiIsImFjY2VsZXJvbWV0ZXJJY29uVmFsdWVQcm9wZXJ0eSIsIm11dGF0ZSIsImNyZWF0ZUZyaWN0aW9uU2xpZGVyIiwiZnJpY3Rpb25TbGlkZXJUYW5kZW0iLCJmcmljdGlvblNsaWRlciIsImZyaWN0aW9uUHJvcGVydHkiLCJNQVhfRlJJQ1RJT04iLCJ0cmFja1NpemUiLCJ0aHVtYk5vZGUiLCJUSFVNQl9OT0RFX1RBTkRFTV9OQU1FIiwibWFqb3JUaWNrTGVuZ3RoIiwidGlja0xhYmVsU3BhY2luZyIsInNsaWRlclRpY2tPcHRpb25zIiwiaW52aXNpYmxlU2xpZGVyVGlja09wdGlvbnMiLCJ2aXNpYmxlIiwiYWRkTWFqb3JUaWNrIiwiZnJpY3Rpb25UZXh0Iiwic2l6ZSIsIndlaWdodCIsInJlc2l6ZSIsImNyZWF0ZU1vdGlvbkNvbnRyb2xzIiwiY29udGFpbmVyTm9kZSIsIml0ZW1zIiwiY3JlYXRlTm9kZSIsInByb3BlcnR5Iiwic2hvd0ZvcmNlUHJvcGVydHkiLCJzaG93VmFsdWVzUHJvcGVydHkiLCJzaG93TWFzc2VzUHJvcGVydHkiLCJzaG93U3BlZWRQcm9wZXJ0eSIsImNoZWNrYm94ZXMiLCJhZGRDaGlsZCIsImhTdHJ1dCIsImxlZnRDZW50ZXIiLCJyaWdodENlbnRlciIsImxheW91dEZyaWN0aW9uU2xpZGVyIiwid2lkdGgiLCJsZWZ0IiwiY2VudGVyWCIsImNyZWF0ZUZyaWN0aW9uQ29udHJvbHMiLCJzaG93U3VtT2ZGb3JjZXNQcm9wZXJ0eSIsInN0cnV0IiwiY2VudGVyVG9wIiwiY2VudGVyQm90dG9tIiwidG9wIiwiYm90dG9tIiwiY3JlYXRlQWNjZWxlcmF0aW9uQ29udHJvbHMiLCJzaG93QWNjZWxlcmF0aW9uUHJvcGVydHkiLCJjb250ZW50cyIsInNjcmVlbiIsInBhbmVsTm9kZSIsInhNYXJnaW4iLCJ5TWFyZ2luIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb3Rpb25Db250cm9sUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2NlbmVyeSBub2RlIHRoYXQgc2hvd3MgdGhlIGNvbnRyb2wgcGFuZWwgZm9yIHRoZSBNb3Rpb24sIEZyaWN0aW9uIGFuZCBBY2NlbGVyYXRpb24gc2NyZWVucy5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXJyb3dOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgR2F1Z2VOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9HYXVnZU5vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgSEJveCwgSFN0cnV0LCBOb2RlLCBUZXh0LCBWQm94LCBWU3RydXQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSFNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvSFNsaWRlci5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9TbGlkZXIuanMnO1xyXG5pbXBvcnQgVmVydGljYWxDaGVja2JveEdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9WZXJ0aWNhbENoZWNrYm94R3JvdXAuanMnO1xyXG5pbXBvcnQgU2xpZGVyS25vYiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TbGlkZXJLbm9iLmpzJztcclxuaW1wb3J0IGZvcmNlc0FuZE1vdGlvbkJhc2ljcyBmcm9tICcuLi8uLi9mb3JjZXNBbmRNb3Rpb25CYXNpY3MuanMnO1xyXG5pbXBvcnQgRm9yY2VzQW5kTW90aW9uQmFzaWNzU3RyaW5ncyBmcm9tICcuLi8uLi9Gb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IE1vdGlvbkNvbnN0YW50cyBmcm9tICcuLi9Nb3Rpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQWNjZWxlcm9tZXRlck5vZGUgZnJvbSAnLi9BY2NlbGVyb21ldGVyTm9kZS5qcyc7XHJcblxyXG5jb25zdCBhY2NlbGVyYXRpb25TdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLmFjY2VsZXJhdGlvbjtcclxuY29uc3QgZm9yY2VzU3RyaW5nID0gRm9yY2VzQW5kTW90aW9uQmFzaWNzU3RyaW5ncy5mb3JjZXM7XHJcbmNvbnN0IGZvcmNlU3RyaW5nID0gRm9yY2VzQW5kTW90aW9uQmFzaWNzU3RyaW5ncy5mb3JjZTtcclxuY29uc3QgZnJpY3Rpb25TdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLmZyaWN0aW9uO1xyXG5jb25zdCBsb3RzU3RyaW5nID0gRm9yY2VzQW5kTW90aW9uQmFzaWNzU3RyaW5ncy5sb3RzO1xyXG5jb25zdCBtYXNzZXNTdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLm1hc3NlcztcclxuY29uc3Qgbm9uZVN0cmluZyA9IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3Mubm9uZTtcclxuY29uc3Qgc3BlZWRTdHJpbmdQcm9wZXJ0eSA9IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3Muc3BlZWRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3VtT2ZGb3JjZXNTdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLnN1bU9mRm9yY2VzO1xyXG5jb25zdCB2YWx1ZXNTdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLnZhbHVlcztcclxuXHJcbmNsYXNzIE1vdGlvbkNvbnRyb2xQYW5lbCBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TW90aW9uTW9kZWx9IG1vZGVsIHRoZSBtb2RlbCBmb3IgdGhlIGVudGlyZSAnbW90aW9uJywgJ2ZyaWN0aW9uJyBvciAnYWNjZWxlcmF0aW9uJyBzY3JlZW5cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcbiAgICBzdXBlciggeyB0YW5kZW06IHRhbmRlbSB9ICk7XHJcblxyXG4gICAgY29uc3QgZm9udFNpemUgPSAxODtcclxuICAgIGNvbnN0IG1heFRleHRXaWR0aCA9IDEyMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIGxhYmVsIG5vZGUgd2l0aCBvcHRpb25zIGljb25cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gdGhlIGxhYmVsIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICovXHJcbiAgICBjb25zdCBjcmVhdGVMYWJlbCA9ICggdGV4dCwgdGFuZGVtTmFtZSwgb3B0aW9ucyApID0+IHtcclxuICAgICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgICAgaW5kZW50OiAwLFxyXG4gICAgICAgIGljb246IG5ldyBOb2RlKClcclxuICAgICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgICAgLy8gY3JlYXRlIHRoZSBsYWJlbCBmb3IgdGhlIGNoZWNrYm94XHJcbiAgICAgIGNvbnN0IGxhYmVsVGV4dCA9IG5ldyBUZXh0KCB0ZXh0LCB7XHJcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCBmb250U2l6ZSApLFxyXG4gICAgICAgIG1heFdpZHRoOiBtYXhUZXh0V2lkdGgsXHJcblxyXG4gICAgICAgIC8vIHRoaXMgaXMgYSBiaXQgb2YgYSBoYWNrIHRvIHN1cHBvcnQgYmFja3dhcmRzIHRhbmRlbSBBUElcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oIHRhbmRlbU5hbWUgKS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnIClcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gb3B0aW9uYWwgaWNvbiBuZWVkcyBzcGFjaW5nIG5leHQgdG8gdGV4dFxyXG4gICAgICBsZXQgaWNvblNwYWNlciA9IG5ldyBIU3RydXQoIDAgKTtcclxuICAgICAgaWYgKCBvcHRpb25zLmljb24gKSB7XHJcbiAgICAgICAgLy8gY3JlYXRlIGEgaG9yaXpvbnRhbCBzcGFjZXIgZm9yIHRoZSBpY29uXHJcbiAgICAgICAgaWNvblNwYWNlciA9IG5ldyBIU3RydXQoIDEwICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBuZXcgSEJveCggeyBzcGFjaW5nOiAwLCBjaGlsZHJlbjogWyBsYWJlbFRleHQsIGljb25TcGFjZXIsIG9wdGlvbnMuaWNvbiBdIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9JY29uIGZvciB0aGUgZm9yY2VzIGluIHRoZSBjb250cm9sIHBhbmVsXHJcbiAgICBjb25zdCBjcmVhdGVBcnJvd0ljb24gPSBwaGV0aW9JRCA9PiBuZXcgQXJyb3dOb2RlKCAwLCAwLCA0MCwgMCwge1xyXG4gICAgICBoZWFkSGVpZ2h0OiAyMCxcclxuICAgICAgaGVhZFdpZHRoOiAyMCxcclxuICAgICAgdGFpbFdpZHRoOiAxMCxcclxuICAgICAgZmlsbDogJyNlNjZlMjMnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggcGhldGlvSUQgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3BlZWRvbWV0ZXJJY29uID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBzcGVlZG9tZXRlckljb25WYWx1ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XHJcbiAgICAgIHJldHVybiBuZXcgR2F1Z2VOb2RlKCBzcGVlZG9tZXRlckljb25WYWx1ZVByb3BlcnR5LCBzcGVlZFN0cmluZ1Byb3BlcnR5LCBuZXcgUmFuZ2UoIDAsIE1vdGlvbkNvbnN0YW50cy5NQVhfU1BFRUQgKSxcclxuICAgICAgICB7IHJhZGl1czogNjcsIHNjYWxlOiAwLjIsIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwZWVkb21ldGVySWNvbk5vZGUnICkgfSApO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGFjY2VsZXJvbWV0ZXJJY29uID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBhY2NlbGVyb21ldGVySWNvblZhbHVlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDUgKTsgLy8gdGhlIGFjY2xlcm9tZXRlciBpY29uIGxvb2tzIGJlc3Qgd2l0aCB+NSBtL3NeMiBmaWxsZWQgaW5cclxuICAgICAgcmV0dXJuIG5ldyBBY2NlbGVyb21ldGVyTm9kZSggYWNjZWxlcm9tZXRlckljb25WYWx1ZVByb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhY2NlbGVyb21ldGVySWNvbicgKSApLm11dGF0ZSggeyBzY2FsZTogMC4zIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgY3JlYXRlRnJpY3Rpb25TbGlkZXIgPSAoKSA9PiB7XHJcblxyXG4gICAgICAvL0NyZWF0ZSB0aGUgZnJpY3Rpb24gc2xpZGVyIGFuZCBpdHMgbGFiZWxzLlxyXG4gICAgICAvLyBBZGQgaW52aXNpYmxlIHN5bW1ldHJpYyB0aWNrcyArIGxhYmVscyBzbyB0aGUgc2xpZGVyIHdpbGwgYmUgcGVyZmVjdGx5IGNlbnRlcmVkLiAgQSBiZXR0ZXIgd2F5IHRvIGRvIHRoaXMgd291bGQgYmUganVzdCB0byBsaW5lIHRoaW5ncyB1cCBiYXNlZCBvbiB0aGUgdHJhY2sgb2YgdGhlIHNsaWRlcixcclxuICAgICAgLy8gYnV0IHRoaXMgbWFrZXMgaXQgd29yayB3aXRoIFZCb3gvSEJveFxyXG4gICAgICBjb25zdCBmcmljdGlvblNsaWRlclRhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmcmljdGlvblNsaWRlcicgKTtcclxuICAgICAgY29uc3QgZnJpY3Rpb25TbGlkZXIgPSBuZXcgSFNsaWRlciggbW9kZWwuZnJpY3Rpb25Qcm9wZXJ0eSwgbmV3IFJhbmdlKCAwLCBNb3Rpb25Db25zdGFudHMuTUFYX0ZSSUNUSU9OICksIHtcclxuICAgICAgICB0cmFja1NpemU6IG5ldyBEaW1lbnNpb24yKCAxNTAsIDYgKSxcclxuICAgICAgICB0aHVtYk5vZGU6IG5ldyBTbGlkZXJLbm9iKCBmcmljdGlvblNsaWRlclRhbmRlbS5jcmVhdGVUYW5kZW0oIFNsaWRlci5USFVNQl9OT0RFX1RBTkRFTV9OQU1FICkgKSxcclxuICAgICAgICBtYWpvclRpY2tMZW5ndGg6IDE4LFxyXG4gICAgICAgIHRpY2tMYWJlbFNwYWNpbmc6IDMsXHJcbiAgICAgICAgdGFuZGVtOiBmcmljdGlvblNsaWRlclRhbmRlbVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IHNsaWRlclRpY2tPcHRpb25zID0geyBmb250OiBuZXcgUGhldEZvbnQoIDE1ICksIG1heFdpZHRoOiAxMjUgfTtcclxuICAgICAgY29uc3QgaW52aXNpYmxlU2xpZGVyVGlja09wdGlvbnMgPSBtZXJnZSggeyB2aXNpYmxlOiBmYWxzZSB9LCBzbGlkZXJUaWNrT3B0aW9ucyApO1xyXG5cclxuICAgICAgZnJpY3Rpb25TbGlkZXIuYWRkTWFqb3JUaWNrKCAwLCBuZXcgVGV4dCggbm9uZVN0cmluZywgbWVyZ2UoIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnemVyb1RpY2tUZXh0JyApIH0sIHNsaWRlclRpY2tPcHRpb25zICkgKSApO1xyXG4gICAgICBmcmljdGlvblNsaWRlci5hZGRNYWpvclRpY2soIDAsIG5ldyBUZXh0KCBsb3RzU3RyaW5nLCBtZXJnZSggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbnZpc2libGVaZXJvVGlja1RleHQnICkgfSwgaW52aXNpYmxlU2xpZGVyVGlja09wdGlvbnMgKSApICk7XHJcblxyXG4gICAgICBmcmljdGlvblNsaWRlci5hZGRNYWpvclRpY2soIE1vdGlvbkNvbnN0YW50cy5NQVhfRlJJQ1RJT04sIG5ldyBUZXh0KCBsb3RzU3RyaW5nLCBtZXJnZSggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXhUaWNrVGV4dCcgKSB9LCBzbGlkZXJUaWNrT3B0aW9ucyApICkgKTtcclxuICAgICAgZnJpY3Rpb25TbGlkZXIuYWRkTWFqb3JUaWNrKCBNb3Rpb25Db25zdGFudHMuTUFYX0ZSSUNUSU9OLCBuZXcgVGV4dCggbm9uZVN0cmluZywgbWVyZ2UoIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW52aXNpYmxlTWF4VGlja1RleHQnICkgfSwgaW52aXNpYmxlU2xpZGVyVGlja09wdGlvbnMgKSApICk7XHJcblxyXG4gICAgICBjb25zdCBmcmljdGlvblRleHQgPSBuZXcgVGV4dCggZnJpY3Rpb25TdHJpbmcsIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogZm9udFNpemUsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgICBtYXhXaWR0aDogbWF4VGV4dFdpZHRoLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZyaWN0aW9uVGV4dCcgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3IFZCb3goIHsgY2hpbGRyZW46IFsgZnJpY3Rpb25UZXh0LCBmcmljdGlvblNsaWRlciBdLCByZXNpemU6IGZhbHNlIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNvbnRyb2xzIGZvciB0aGUgJ21vdGlvbicgc2NyZWVuXHJcbiAgICBjb25zdCBjcmVhdGVNb3Rpb25Db250cm9scyA9ICgpID0+IHtcclxuXHJcbiAgICAgIC8vIGNvbnRhaW5lciBub2RlIGZvciBjaGVja2JveGVzIGFuZCBhbiBoc3RydXQgd2hpY2ggbWFrZXMgdGhlIHBhbmVsIGp1c3QgYSBsaXR0bGUgd2lkZXIgdG8gbWF0Y2ggdGhlXHJcbiAgICAgIC8vIG90aGVyIHNjcmVlbnNcclxuICAgICAgY29uc3QgY29udGFpbmVyTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29udGFpbmVyTm9kZScgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb25zdCBpdGVtcyA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBjcmVhdGVMYWJlbCggZm9yY2VTdHJpbmcsICdzaG93Rm9yY2VDaGVja2JveCcsIHsgaWNvbjogY3JlYXRlQXJyb3dJY29uKCAnc2hvd0ZvcmNlQXJyb3dJY29uJyApIH0gKSxcclxuICAgICAgICAgIHByb3BlcnR5OiBtb2RlbC5zaG93Rm9yY2VQcm9wZXJ0eSxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdzaG93Rm9yY2VDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCB2YWx1ZXNTdHJpbmcsICdzaG93VmFsdWVzQ2hlY2tib3gnICksXHJcbiAgICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd1ZhbHVlc1Byb3BlcnR5LFxyXG4gICAgICAgICAgdGFuZGVtTmFtZTogJ3Nob3dWYWx1ZXNDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCBtYXNzZXNTdHJpbmcsICdzaG93TWFzc2VzQ2hlY2tib3gnICksXHJcbiAgICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd01hc3Nlc1Byb3BlcnR5LFxyXG4gICAgICAgICAgdGFuZGVtTmFtZTogJ3Nob3dNYXNzZXNDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCBzcGVlZFN0cmluZ1Byb3BlcnR5LCAnc2hvd1NwZWVkQ2hlY2tib3gnLCB7IGljb246IHNwZWVkb21ldGVySWNvbigpIH0gKSxcclxuICAgICAgICAgIHByb3BlcnR5OiBtb2RlbC5zaG93U3BlZWRQcm9wZXJ0eSxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdzaG93U3BlZWRDaGVja2JveCdcclxuICAgICAgICB9XHJcbiAgICAgIF07XHJcblxyXG4gICAgICAvLyBjcmVhdGUgdGhlIGNoZWNrYm94ZXNcclxuICAgICAgY29uc3QgY2hlY2tib3hlcyA9IG5ldyBWZXJ0aWNhbENoZWNrYm94R3JvdXAoIGl0ZW1zLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hlY2tib3hHcm91cCcgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnRhaW5lck5vZGUuYWRkQ2hpbGQoIGNoZWNrYm94ZXMgKTtcclxuXHJcblxyXG4gICAgICAvLyBjcmVhdGUgYW4gaFN0cnV0IHRvIGluY3JlYXNlIHRoZSB3aWR0aCBvZiB0aGUgY29udHJvbHMgdG8gdGhlIHJpZ2h0XHJcbiAgICAgIGNvbnN0IGhTdHJ1dCA9IG5ldyBIU3RydXQoIDE2LCB7IGxlZnRDZW50ZXI6IGNoZWNrYm94ZXMucmlnaHRDZW50ZXIgfSApO1xyXG4gICAgICBjb250YWluZXJOb2RlLmFkZENoaWxkKCBoU3RydXQgKTtcclxuXHJcbiAgICAgIHJldHVybiBjb250YWluZXJOb2RlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBpZiB0aGUgc2xpZGVyIGlzIHdpZGVyIHRoYW4gdGhlIGdyb3VwIG9mIGNoZWNrYm94ZXMsIGFsaWduIHRoZSBjaGVja2JveGVzIHRvIHRoZSBsZWZ0IG9mIHRoZSBzbGlkZXJcclxuICAgIC8vIG90aGVyd2lzZSwgY2VudGVyIHdpdGggdGhlIGNoZWNrYm94ZXNcclxuICAgIGNvbnN0IGxheW91dEZyaWN0aW9uU2xpZGVyID0gKCBjaGVja2JveGVzLCBmcmljdGlvblNsaWRlciApID0+IHtcclxuICAgICAgaWYgKCBmcmljdGlvblNsaWRlci53aWR0aCA+IGNoZWNrYm94ZXMud2lkdGggKSB7XHJcbiAgICAgICAgY2hlY2tib3hlcy5sZWZ0ID0gZnJpY3Rpb25TbGlkZXIubGVmdDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBmcmljdGlvblNsaWRlci5jZW50ZXJYID0gY2hlY2tib3hlcy5jZW50ZXJYO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSBjb250cm9scyBmb3IgdGhlICdmcmljdGlvbicgc2NyZWVuLCBpbmNsdWRpbmcgYSBzZXQgb2YgY2hlY2tib3hlcyBhbmQgYSBzbGlkZXJcclxuICAgIC8vIFRoZSBzbGlkZXIgaXMgY2VudGVyZWQgdW5kZXIgdGhlIGNoZWNrYm94ZXMsIHdoaWNoIGFyZSBhbGlnbmVkIHRvIHRoZSBsZWZ0XHJcbiAgICBjb25zdCBjcmVhdGVGcmljdGlvbkNvbnRyb2xzID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gY29udGFpbmVyIGZvciBhbGwgY29udHJvbHNcclxuICAgICAgY29uc3QgY29udGFpbmVyTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29udGFpbmVyTm9kZScgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb25zdCBpdGVtcyA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBjcmVhdGVMYWJlbCggZm9yY2VzU3RyaW5nLCAnc2hvd0ZvcmNlQ2hlY2tib3gnLCB7IGljb246IGNyZWF0ZUFycm93SWNvbiggJ3Nob3dGb3JjZUFycm93SWNvbicgKSB9ICksXHJcbiAgICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd0ZvcmNlUHJvcGVydHksXHJcbiAgICAgICAgICB0YW5kZW1OYW1lOiAnc2hvd0ZvcmNlQ2hlY2tib3gnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBjcmVhdGVMYWJlbCggc3VtT2ZGb3JjZXNTdHJpbmcsICdzaG93U3VtT2ZGb3JjZXNDaGVja2JveCcgKSxcclxuICAgICAgICAgIHByb3BlcnR5OiBtb2RlbC5zaG93U3VtT2ZGb3JjZXNQcm9wZXJ0eSxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdzaG93U3VtT2ZGb3JjZXNDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCB2YWx1ZXNTdHJpbmcsICdzaG93VmFsdWVzQ2hlY2tib3gnICksXHJcbiAgICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd1ZhbHVlc1Byb3BlcnR5LFxyXG4gICAgICAgICAgdGFuZGVtTmFtZTogJ3Nob3dWYWx1ZXNDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCBtYXNzZXNTdHJpbmcsICdzaG93TWFzc2VzQ2hlY2tib3gnICksXHJcbiAgICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd01hc3Nlc1Byb3BlcnR5LFxyXG4gICAgICAgICAgdGFuZGVtTmFtZTogJ3Nob3dNYXNzZXNDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCBzcGVlZFN0cmluZ1Byb3BlcnR5LCAnc2hvd1NwZWVkQ2hlY2tib3gnLCB7IGljb246IHNwZWVkb21ldGVySWNvbigpIH0gKSxcclxuICAgICAgICAgIHByb3BlcnR5OiBtb2RlbC5zaG93U3BlZWRQcm9wZXJ0eSxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdzaG93U3BlZWRDaGVja2JveCdcclxuICAgICAgICB9XHJcbiAgICAgIF07XHJcblxyXG4gICAgICAvLyBjcmVhdGUgdGhlIGNoZWNrYm94ZXNcclxuICAgICAgY29uc3QgY2hlY2tib3hlcyA9IG5ldyBWZXJ0aWNhbENoZWNrYm94R3JvdXAoIGl0ZW1zLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hlY2tib3hHcm91cCcgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnRhaW5lck5vZGUuYWRkQ2hpbGQoIGNoZWNrYm94ZXMgKTtcclxuXHJcbiAgICAgIC8vIGNyZWF0ZSBhIHNwYWNlciBmb3IgdGhlIGNoZWNrYm94ZXMgYW5kIHRoZSBzbGlkZXJcclxuICAgICAgY29uc3Qgc3RydXQgPSBuZXcgVlN0cnV0KCAxMiwgeyBjZW50ZXJUb3A6IGNoZWNrYm94ZXMuY2VudGVyQm90dG9tIH0gKTtcclxuICAgICAgY29udGFpbmVyTm9kZS5hZGRDaGlsZCggc3RydXQgKTtcclxuXHJcbiAgICAgIC8vIGNyZWF0ZSB0aGUgc2xpZGVyXHJcbiAgICAgIGNvbnN0IGZyaWN0aW9uU2xpZGVyID0gY3JlYXRlRnJpY3Rpb25TbGlkZXIoKTtcclxuICAgICAgZnJpY3Rpb25TbGlkZXIudG9wID0gc3RydXQuYm90dG9tO1xyXG5cclxuICAgICAgbGF5b3V0RnJpY3Rpb25TbGlkZXIoIGNoZWNrYm94ZXMsIGZyaWN0aW9uU2xpZGVyICk7XHJcblxyXG4gICAgICBjb250YWluZXJOb2RlLmFkZENoaWxkKCBmcmljdGlvblNsaWRlciApO1xyXG5cclxuICAgICAgcmV0dXJuIGNvbnRhaW5lck5vZGU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSBjb250cm9scyBmb3IgdGhlICdhY2NlbGVyYXRpb24nIHNjcmVlblxyXG4gICAgLy8gVGhlIHNsaWRlciBpcyBjZW50ZXJlZCB1bmRlciB0aGUgY2hlY2tib3hlcywgd2hpY2ggYXJlIGFsaWduZWQgdG8gdGhlIGxlZnRcclxuICAgIGNvbnN0IGNyZWF0ZUFjY2VsZXJhdGlvbkNvbnRyb2xzID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gbm9kZSBjb250YWluaW5nIGNoZWNrYm94ZXMsIHNwYWNpbmcsIGFuZCBzbGlkZXJcclxuICAgICAgY29uc3QgY29udGFpbmVyTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29udGFpbmVyTm9kZScgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb25zdCBpdGVtcyA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBjcmVhdGVMYWJlbCggZm9yY2VzU3RyaW5nLCAnc2hvd0ZvcmNlQ2hlY2tib3gnLCB7IGljb246IGNyZWF0ZUFycm93SWNvbiggJ3Nob3dGb3JjZUFycm93SWNvbicgKSB9ICksXHJcbiAgICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd0ZvcmNlUHJvcGVydHksXHJcbiAgICAgICAgICB0YW5kZW1OYW1lOiAnc2hvd0ZvcmNlQ2hlY2tib3gnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBjcmVhdGVMYWJlbCggc3VtT2ZGb3JjZXNTdHJpbmcsICdzaG93U3VtT2ZGb3JjZXNDaGVja2JveCcgKSxcclxuICAgICAgICAgIHByb3BlcnR5OiBtb2RlbC5zaG93U3VtT2ZGb3JjZXNQcm9wZXJ0eSxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdzaG93U3VtT2ZGb3JjZXNDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCB2YWx1ZXNTdHJpbmcsICdzaG93VmFsdWVzQ2hlY2tib3gnICksXHJcbiAgICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd1ZhbHVlc1Byb3BlcnR5LFxyXG4gICAgICAgICAgdGFuZGVtTmFtZTogJ3Nob3dWYWx1ZXNDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCBtYXNzZXNTdHJpbmcsICdzaG93TWFzc2VzQ2hlY2tib3gnICksXHJcbiAgICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd01hc3Nlc1Byb3BlcnR5LFxyXG4gICAgICAgICAgdGFuZGVtTmFtZTogJ3Nob3dNYXNzZXNDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCBzcGVlZFN0cmluZ1Byb3BlcnR5LCAnc2hvd1NwZWVkQ2hlY2tib3gnLCB7IGljb246IHNwZWVkb21ldGVySWNvbigpIH0gKSxcclxuICAgICAgICAgIHByb3BlcnR5OiBtb2RlbC5zaG93U3BlZWRQcm9wZXJ0eSxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdzaG93U3BlZWRDaGVja2JveCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGNyZWF0ZUxhYmVsKCBhY2NlbGVyYXRpb25TdHJpbmcsICdzaG93QWNjZWxlcmF0aW9uQ2hlY2tib3gnLCB7IGljb246IGFjY2VsZXJvbWV0ZXJJY29uKCkgfSApLFxyXG4gICAgICAgICAgcHJvcGVydHk6IG1vZGVsLnNob3dBY2NlbGVyYXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6ICdzaG93QWNjZWxlcmF0aW9uQ2hlY2tib3gnXHJcbiAgICAgICAgfVxyXG4gICAgICBdO1xyXG5cclxuICAgICAgY29uc3QgY2hlY2tib3hlcyA9IG5ldyBWZXJ0aWNhbENoZWNrYm94R3JvdXAoIGl0ZW1zLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hlY2tib3hHcm91cCcgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnRhaW5lck5vZGUuYWRkQ2hpbGQoIGNoZWNrYm94ZXMgKTtcclxuXHJcbiAgICAgIC8vIGNyZWF0ZSB0aGUgc3BhY2luZyBzdHJ1dFxyXG4gICAgICBjb25zdCBzdHJ1dCA9IG5ldyBWU3RydXQoIDEyLCB7IGNlbnRlclRvcDogY2hlY2tib3hlcy5jZW50ZXJCb3R0b20gfSApO1xyXG4gICAgICBjb250YWluZXJOb2RlLmFkZENoaWxkKCBzdHJ1dCApO1xyXG5cclxuICAgICAgLy8gYWRkIHRoZSBzbGlkZXIgZnJpY3Rpb24gc2xpZGVyIHVuZGVyIHRoZSBjaGVja2JveGVzXHJcbiAgICAgIGNvbnN0IGZyaWN0aW9uU2xpZGVyID0gY3JlYXRlRnJpY3Rpb25TbGlkZXIoKTtcclxuICAgICAgZnJpY3Rpb25TbGlkZXIudG9wID0gc3RydXQuYm90dG9tO1xyXG5cclxuICAgICAgbGF5b3V0RnJpY3Rpb25TbGlkZXIoIGNoZWNrYm94ZXMsIGZyaWN0aW9uU2xpZGVyICk7XHJcblxyXG4gICAgICBjb250YWluZXJOb2RlLmFkZENoaWxkKCBmcmljdGlvblNsaWRlciApO1xyXG5cclxuICAgICAgcmV0dXJuIGNvbnRhaW5lck5vZGU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGNvbGxlY3QgY29udGVudHMgZm9yIHRoZSBwYW5lbFxyXG4gICAgY29uc3QgY29udGVudHMgPSBtb2RlbC5zY3JlZW4gPT09ICdtb3Rpb24nID8gY3JlYXRlTW90aW9uQ29udHJvbHMoKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnNjcmVlbiA9PT0gJ2ZyaWN0aW9uJyA/IGNyZWF0ZUZyaWN0aW9uQ29udHJvbHMoKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUFjY2VsZXJhdGlvbkNvbnRyb2xzKCk7XHJcblxyXG4gICAgY29uc3QgcGFuZWxOb2RlID0gbmV3IFBhbmVsKCBjb250ZW50cywge1xyXG4gICAgICB4TWFyZ2luOiAxMixcclxuICAgICAgeU1hcmdpbjogNyxcclxuICAgICAgZmlsbDogJyNlM2U5ODAnLFxyXG4gICAgICByZXNpemU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwYW5lbCcgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGFuZWxOb2RlLm11dGF0ZSggeyBsZWZ0OiA5ODEgLSBwYW5lbE5vZGUud2lkdGggLSA1LCB0b3A6IDUgfSApICk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3JjZXNBbmRNb3Rpb25CYXNpY3MucmVnaXN0ZXIoICdNb3Rpb25Db250cm9sUGFuZWwnLCBNb3Rpb25Db250cm9sUGFuZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vdGlvbkNvbnRyb2xQYW5lbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsTUFBTSxRQUFRLG1DQUFtQztBQUMxRixPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsTUFB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