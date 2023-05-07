// Copyright 2017-2023, University of Colorado Boulder

/**
 * Panel that manages options visibility for vectors and period trace in Basics version.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import { AlignBox, AlignGroup, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import VerticalCheckboxGroup from '../../../../sun/js/VerticalCheckboxGroup.js';
import MassesAndSpringsConstants from '../../common/MassesAndSpringsConstants.js';
import ForcesMode from '../../common/model/ForcesMode.js';
import ForceVectorArrow from '../../common/view/ForceVectorArrow.js';
import VectorArrow from '../../common/view/VectorArrow.js';
import massesAndSprings from '../../massesAndSprings.js';
import MassesAndSpringsStrings from '../../MassesAndSpringsStrings.js';
const accelerationString = MassesAndSpringsStrings.acceleration;
const forcesString = MassesAndSpringsStrings.forces;
const gravityString = MassesAndSpringsStrings.gravity;
const netForceString = MassesAndSpringsStrings.netForce;
const periodTraceString = MassesAndSpringsStrings.periodTrace;
const springString = MassesAndSpringsStrings.spring;
const velocityString = MassesAndSpringsStrings.velocity;

// constants
const MAX_WIDTH = 140;
const DEFAULT_CONTENT_SPACING = 155;
class VectorVisibilityControlNode extends Node {
  /**
   * @param {MassesAndSpringsModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(model, tandem, options) {
    options = merge({
      showForces: true,
      fill: MassesAndSpringsConstants.PANEL_FILL,
      tandem: tandem.createTandem('vectorVisibilityControlNode')
    }, options);
    super(options);
    const velocityArrow = new VectorArrow(MassesAndSpringsConstants.VELOCITY_ARROW_COLOR);
    const accelerationArrow = new VectorArrow(MassesAndSpringsConstants.ACCELERATION_ARROW_COLOR);
    const gravityArrow = new ForceVectorArrow(MassesAndSpringsConstants.GRAVITY_ARROW_COLOR);
    const springArrow = new ForceVectorArrow(MassesAndSpringsConstants.SPRING_ARROW_COLOR);
    const netForceArrow = new ForceVectorArrow('black');

    // Align group used for label align boxes
    const alignGroup = new AlignGroup({
      matchVertical: false
    });

    // Members of the attributed to the alignGroup are declared in order as they appear in the sim.
    const velocityAlignBox = new AlignBox(new Text(velocityString, {
      font: MassesAndSpringsConstants.TITLE_FONT,
      maxWidth: MAX_WIDTH,
      tandem: tandem.createTandem('velocityText')
    }), {
      group: alignGroup,
      xAlign: 'left'
    });
    const accelerationAlignBox = new AlignBox(new Text(accelerationString, {
      font: MassesAndSpringsConstants.TITLE_FONT,
      maxWidth: MAX_WIDTH,
      tandem: tandem.createTandem('accelerationText')
    }), {
      group: alignGroup,
      xAlign: 'left'
    });

    // Responsible for forces aquaRadioButton
    const forcesVisibilityRadioButton = new AquaRadioButton(model.forcesModeProperty, ForcesMode.FORCES, new Text(forcesString, {
      font: MassesAndSpringsConstants.TITLE_FONT,
      maxWidth: MAX_WIDTH,
      tandem: tandem.createTandem('forcesText')
    }), {
      radius: 7,
      spacing: 7
    });

    // Indention used for gravity and spring checkbox
    const indentation = 22;

    // Sub group of check boxes indented under forces radio button
    const gravityAlignBox = new AlignBox(new Text(gravityString, {
      font: MassesAndSpringsConstants.TITLE_FONT,
      maxWidth: MAX_WIDTH - indentation,
      tandem: tandem.createTandem('gravityText')
    }), {
      group: alignGroup,
      xAlign: 'left'
    });
    const springAlignBox = new AlignBox(new Text(springString, {
      font: MassesAndSpringsConstants.TITLE_FONT,
      maxWidth: MAX_WIDTH - indentation,
      tandem: tandem.createTandem('springText')
    }), {
      group: alignGroup,
      xAlign: 'left'
    });

    // responsible for net force aquaRadioButton
    const netForceAlignBox = new AlignBox(new Text(netForceString, {
      font: MassesAndSpringsConstants.TITLE_FONT,
      maxWidth: MAX_WIDTH,
      tandem: tandem.createTandem('netForceText')
    }), {
      group: alignGroup,
      xAlign: 'left'
    });

    // Max width must be set to the maxWidth of the alignGroup based on its content.
    const contentSpacing = DEFAULT_CONTENT_SPACING - alignGroup.getMaxWidth();
    const netForceVisibilityRadioButton = new AquaRadioButton(model.forcesModeProperty, ForcesMode.NET_FORCES, new HBox({
      children: [netForceAlignBox, netForceArrow],
      spacing: contentSpacing
    }), {
      radius: 7,
      spacing: 7
    });

    // Handle options for checkbox group
    let vectorVisibilityCheckboxGroup;
    const velocityCheckboxObject = {
      createNode: () => new HBox({
        children: [velocityAlignBox, velocityArrow],
        spacing: contentSpacing
      }),
      property: model.velocityVectorVisibilityProperty,
      label: velocityString
    };
    const accelerationCheckboxObject = {
      createNode: () => new HBox({
        children: [accelerationAlignBox, accelerationArrow],
        spacing: contentSpacing
      }),
      property: model.accelerationVectorVisibilityProperty,
      label: accelerationString
    };
    if (!model.basicsVersion) {
      vectorVisibilityCheckboxGroup = new VerticalCheckboxGroup([velocityCheckboxObject, accelerationCheckboxObject], {
        checkboxOptions: {
          boxWidth: 16,
          spacing: 8
        },
        tandem: tandem.createTandem('vectorVisibilityCheckboxGroup')
      });
    }

    // Responsible for velocity and acceleration vectors checkboxes and period trace in basics version
    else {
      vectorVisibilityCheckboxGroup = new VerticalCheckboxGroup([{
        createNode: tandem => new Text(periodTraceString, {
          font: MassesAndSpringsConstants.TITLE_FONT,
          maxWidth: MAX_WIDTH,
          tandem: tandem.createTandem('periodTraceText')
        }),
        property: model.firstSpring.periodTraceVisibilityProperty
      }, velocityCheckboxObject, accelerationCheckboxObject], {
        checkboxOptions: {
          boxWidth: 16,
          spacing: 8
        },
        tandem: tandem.createTandem('vectorVisibilityCheckboxGroup')
      });
    }

    // Property that toggles whether the gravity and spring force checkboxes are enabled
    const enabledProperty = new BooleanProperty(model.forcesModeProperty.value === ForcesMode.FORCES, {
      phetioFeatured: true
    });

    // Responsible for forces vectors checkboxes
    const forcesVisibilityCheckboxGroup = new VerticalCheckboxGroup([{
      createNode: () => new HBox({
        children: [gravityAlignBox, gravityArrow],
        spacing: contentSpacing - indentation
      }),
      property: model.gravityVectorVisibilityProperty,
      label: gravityString
    }, {
      createNode: () => new HBox({
        children: [springAlignBox, springArrow],
        spacing: contentSpacing - indentation
      }),
      property: model.springVectorVisibilityProperty,
      label: springString
    }], {
      checkboxOptions: {
        enabledProperty: enabledProperty,
        boxWidth: 16
      },
      tandem: tandem.createTandem('forcesVisibilityCheckboxGroup')
    });

    // manages the mutability of the forces checkboxes dependent on the forces and net force aquaRadioButton
    model.forcesModeProperty.link(mode => {
      enabledProperty.set(mode === ForcesMode.FORCES);
    });

    // Contains all checkboxes and radio buttons for vector visibility
    let vectorVisibilityControlsVBox;

    // groups the checkboxes and forces aquaRadioButton
    if (options.showForces) {
      vectorVisibilityControlsVBox = new VBox({
        children: [vectorVisibilityCheckboxGroup, forcesVisibilityRadioButton, new AlignBox(forcesVisibilityCheckboxGroup, {
          leftMargin: 22
        }), netForceVisibilityRadioButton],
        spacing: 8,
        align: 'left',
        tandem: tandem.createTandem('spacingUnit')
      });
    } else {
      vectorVisibilityControlsVBox = new VBox({
        children: [vectorVisibilityCheckboxGroup],
        align: 'left',
        tandem: tandem.createTandem('spacingUnit')
      });
    }
    const controlsHBox = new HBox({
      spacing: 65,
      children: [vectorVisibilityControlsVBox]
    });
    this.addChild(controlsHBox);
  }
}
massesAndSprings.register('VectorVisibilityControlNode', VectorVisibilityControlNode);
export default VectorVisibilityControlNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJtZXJnZSIsIkFsaWduQm94IiwiQWxpZ25Hcm91cCIsIkhCb3giLCJOb2RlIiwiVGV4dCIsIlZCb3giLCJBcXVhUmFkaW9CdXR0b24iLCJWZXJ0aWNhbENoZWNrYm94R3JvdXAiLCJNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzIiwiRm9yY2VzTW9kZSIsIkZvcmNlVmVjdG9yQXJyb3ciLCJWZWN0b3JBcnJvdyIsIm1hc3Nlc0FuZFNwcmluZ3MiLCJNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncyIsImFjY2VsZXJhdGlvblN0cmluZyIsImFjY2VsZXJhdGlvbiIsImZvcmNlc1N0cmluZyIsImZvcmNlcyIsImdyYXZpdHlTdHJpbmciLCJncmF2aXR5IiwibmV0Rm9yY2VTdHJpbmciLCJuZXRGb3JjZSIsInBlcmlvZFRyYWNlU3RyaW5nIiwicGVyaW9kVHJhY2UiLCJzcHJpbmdTdHJpbmciLCJzcHJpbmciLCJ2ZWxvY2l0eVN0cmluZyIsInZlbG9jaXR5IiwiTUFYX1dJRFRIIiwiREVGQVVMVF9DT05URU5UX1NQQUNJTkciLCJWZWN0b3JWaXNpYmlsaXR5Q29udHJvbE5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwib3B0aW9ucyIsInNob3dGb3JjZXMiLCJmaWxsIiwiUEFORUxfRklMTCIsImNyZWF0ZVRhbmRlbSIsInZlbG9jaXR5QXJyb3ciLCJWRUxPQ0lUWV9BUlJPV19DT0xPUiIsImFjY2VsZXJhdGlvbkFycm93IiwiQUNDRUxFUkFUSU9OX0FSUk9XX0NPTE9SIiwiZ3Jhdml0eUFycm93IiwiR1JBVklUWV9BUlJPV19DT0xPUiIsInNwcmluZ0Fycm93IiwiU1BSSU5HX0FSUk9XX0NPTE9SIiwibmV0Rm9yY2VBcnJvdyIsImFsaWduR3JvdXAiLCJtYXRjaFZlcnRpY2FsIiwidmVsb2NpdHlBbGlnbkJveCIsImZvbnQiLCJUSVRMRV9GT05UIiwibWF4V2lkdGgiLCJncm91cCIsInhBbGlnbiIsImFjY2VsZXJhdGlvbkFsaWduQm94IiwiZm9yY2VzVmlzaWJpbGl0eVJhZGlvQnV0dG9uIiwiZm9yY2VzTW9kZVByb3BlcnR5IiwiRk9SQ0VTIiwicmFkaXVzIiwic3BhY2luZyIsImluZGVudGF0aW9uIiwiZ3Jhdml0eUFsaWduQm94Iiwic3ByaW5nQWxpZ25Cb3giLCJuZXRGb3JjZUFsaWduQm94IiwiY29udGVudFNwYWNpbmciLCJnZXRNYXhXaWR0aCIsIm5ldEZvcmNlVmlzaWJpbGl0eVJhZGlvQnV0dG9uIiwiTkVUX0ZPUkNFUyIsImNoaWxkcmVuIiwidmVjdG9yVmlzaWJpbGl0eUNoZWNrYm94R3JvdXAiLCJ2ZWxvY2l0eUNoZWNrYm94T2JqZWN0IiwiY3JlYXRlTm9kZSIsInByb3BlcnR5IiwidmVsb2NpdHlWZWN0b3JWaXNpYmlsaXR5UHJvcGVydHkiLCJsYWJlbCIsImFjY2VsZXJhdGlvbkNoZWNrYm94T2JqZWN0IiwiYWNjZWxlcmF0aW9uVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5IiwiYmFzaWNzVmVyc2lvbiIsImNoZWNrYm94T3B0aW9ucyIsImJveFdpZHRoIiwiZmlyc3RTcHJpbmciLCJwZXJpb2RUcmFjZVZpc2liaWxpdHlQcm9wZXJ0eSIsImVuYWJsZWRQcm9wZXJ0eSIsInZhbHVlIiwicGhldGlvRmVhdHVyZWQiLCJmb3JjZXNWaXNpYmlsaXR5Q2hlY2tib3hHcm91cCIsImdyYXZpdHlWZWN0b3JWaXNpYmlsaXR5UHJvcGVydHkiLCJzcHJpbmdWZWN0b3JWaXNpYmlsaXR5UHJvcGVydHkiLCJsaW5rIiwibW9kZSIsInNldCIsInZlY3RvclZpc2liaWxpdHlDb250cm9sc1ZCb3giLCJsZWZ0TWFyZ2luIiwiYWxpZ24iLCJjb250cm9sc0hCb3giLCJhZGRDaGlsZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmVjdG9yVmlzaWJpbGl0eUNvbnRyb2xOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBhbmVsIHRoYXQgbWFuYWdlcyBvcHRpb25zIHZpc2liaWxpdHkgZm9yIHZlY3RvcnMgYW5kIHBlcmlvZCB0cmFjZSBpbiBCYXNpY3MgdmVyc2lvbi5cclxuICpcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgQWxpZ25Hcm91cCwgSEJveCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBcXVhUmFkaW9CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FxdWFSYWRpb0J1dHRvbi5qcyc7XHJcbmltcG9ydCBWZXJ0aWNhbENoZWNrYm94R3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1ZlcnRpY2FsQ2hlY2tib3hHcm91cC5qcyc7XHJcbmltcG9ydCBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9NYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZvcmNlc01vZGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0ZvcmNlc01vZGUuanMnO1xyXG5pbXBvcnQgRm9yY2VWZWN0b3JBcnJvdyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Gb3JjZVZlY3RvckFycm93LmpzJztcclxuaW1wb3J0IFZlY3RvckFycm93IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1ZlY3RvckFycm93LmpzJztcclxuaW1wb3J0IG1hc3Nlc0FuZFNwcmluZ3MgZnJvbSAnLi4vLi4vbWFzc2VzQW5kU3ByaW5ncy5qcyc7XHJcbmltcG9ydCBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncyBmcm9tICcuLi8uLi9NYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBhY2NlbGVyYXRpb25TdHJpbmcgPSBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5hY2NlbGVyYXRpb247XHJcbmNvbnN0IGZvcmNlc1N0cmluZyA9IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLmZvcmNlcztcclxuY29uc3QgZ3Jhdml0eVN0cmluZyA9IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLmdyYXZpdHk7XHJcbmNvbnN0IG5ldEZvcmNlU3RyaW5nID0gTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MubmV0Rm9yY2U7XHJcbmNvbnN0IHBlcmlvZFRyYWNlU3RyaW5nID0gTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MucGVyaW9kVHJhY2U7XHJcbmNvbnN0IHNwcmluZ1N0cmluZyA9IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLnNwcmluZztcclxuY29uc3QgdmVsb2NpdHlTdHJpbmcgPSBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy52ZWxvY2l0eTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVhfV0lEVEggPSAxNDA7XHJcbmNvbnN0IERFRkFVTFRfQ09OVEVOVF9TUEFDSU5HID0gMTU1O1xyXG5cclxuY2xhc3MgVmVjdG9yVmlzaWJpbGl0eUNvbnRyb2xOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYXNzZXNBbmRTcHJpbmdzTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBzaG93Rm9yY2VzOiB0cnVlLFxyXG4gICAgICBmaWxsOiBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLlBBTkVMX0ZJTEwsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlY3RvclZpc2liaWxpdHlDb250cm9sTm9kZScgKVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdmVsb2NpdHlBcnJvdyA9IG5ldyBWZWN0b3JBcnJvdyggTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5WRUxPQ0lUWV9BUlJPV19DT0xPUiApO1xyXG4gICAgY29uc3QgYWNjZWxlcmF0aW9uQXJyb3cgPSBuZXcgVmVjdG9yQXJyb3coIE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuQUNDRUxFUkFUSU9OX0FSUk9XX0NPTE9SICk7XHJcbiAgICBjb25zdCBncmF2aXR5QXJyb3cgPSBuZXcgRm9yY2VWZWN0b3JBcnJvdyggTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5HUkFWSVRZX0FSUk9XX0NPTE9SICk7XHJcbiAgICBjb25zdCBzcHJpbmdBcnJvdyA9IG5ldyBGb3JjZVZlY3RvckFycm93KCBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLlNQUklOR19BUlJPV19DT0xPUiApO1xyXG4gICAgY29uc3QgbmV0Rm9yY2VBcnJvdyA9IG5ldyBGb3JjZVZlY3RvckFycm93KCAnYmxhY2snICk7XHJcblxyXG4gICAgLy8gQWxpZ24gZ3JvdXAgdXNlZCBmb3IgbGFiZWwgYWxpZ24gYm94ZXNcclxuICAgIGNvbnN0IGFsaWduR3JvdXAgPSBuZXcgQWxpZ25Hcm91cCggeyBtYXRjaFZlcnRpY2FsOiBmYWxzZSB9ICk7XHJcblxyXG4gICAgLy8gTWVtYmVycyBvZiB0aGUgYXR0cmlidXRlZCB0byB0aGUgYWxpZ25Hcm91cCBhcmUgZGVjbGFyZWQgaW4gb3JkZXIgYXMgdGhleSBhcHBlYXIgaW4gdGhlIHNpbS5cclxuICAgIGNvbnN0IHZlbG9jaXR5QWxpZ25Cb3ggPSBuZXcgQWxpZ25Cb3goIG5ldyBUZXh0KCB2ZWxvY2l0eVN0cmluZywge1xyXG4gICAgICBmb250OiBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEgsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlbG9jaXR5VGV4dCcgKVxyXG4gICAgfSApLCB7IGdyb3VwOiBhbGlnbkdyb3VwLCB4QWxpZ246ICdsZWZ0JyB9ICk7XHJcblxyXG4gICAgY29uc3QgYWNjZWxlcmF0aW9uQWxpZ25Cb3ggPSBuZXcgQWxpZ25Cb3goIG5ldyBUZXh0KCBhY2NlbGVyYXRpb25TdHJpbmcsIHtcclxuICAgICAgZm9udDogTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogTUFYX1dJRFRILFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhY2NlbGVyYXRpb25UZXh0JyApXHJcbiAgICB9ICksIHsgZ3JvdXA6IGFsaWduR3JvdXAsIHhBbGlnbjogJ2xlZnQnIH0gKTtcclxuXHJcbiAgICAvLyBSZXNwb25zaWJsZSBmb3IgZm9yY2VzIGFxdWFSYWRpb0J1dHRvblxyXG4gICAgY29uc3QgZm9yY2VzVmlzaWJpbGl0eVJhZGlvQnV0dG9uID0gbmV3IEFxdWFSYWRpb0J1dHRvbihcclxuICAgICAgbW9kZWwuZm9yY2VzTW9kZVByb3BlcnR5LFxyXG4gICAgICBGb3JjZXNNb2RlLkZPUkNFUyxcclxuICAgICAgbmV3IFRleHQoIGZvcmNlc1N0cmluZywge1xyXG4gICAgICAgIGZvbnQ6IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgICBtYXhXaWR0aDogTUFYX1dJRFRILFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvcmNlc1RleHQnIClcclxuICAgICAgfSApLFxyXG4gICAgICB7IHJhZGl1czogNywgc3BhY2luZzogNyB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEluZGVudGlvbiB1c2VkIGZvciBncmF2aXR5IGFuZCBzcHJpbmcgY2hlY2tib3hcclxuICAgIGNvbnN0IGluZGVudGF0aW9uID0gMjI7XHJcblxyXG4gICAgLy8gU3ViIGdyb3VwIG9mIGNoZWNrIGJveGVzIGluZGVudGVkIHVuZGVyIGZvcmNlcyByYWRpbyBidXR0b25cclxuICAgIGNvbnN0IGdyYXZpdHlBbGlnbkJveCA9IG5ldyBBbGlnbkJveCggbmV3IFRleHQoIGdyYXZpdHlTdHJpbmcsIHtcclxuICAgICAgZm9udDogTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogTUFYX1dJRFRIIC0gaW5kZW50YXRpb24sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXZpdHlUZXh0JyApXHJcbiAgICB9ICksIHsgZ3JvdXA6IGFsaWduR3JvdXAsIHhBbGlnbjogJ2xlZnQnIH0gKTtcclxuICAgIGNvbnN0IHNwcmluZ0FsaWduQm94ID0gbmV3IEFsaWduQm94KCBuZXcgVGV4dCggc3ByaW5nU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IE1BWF9XSURUSCAtIGluZGVudGF0aW9uLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcHJpbmdUZXh0JyApXHJcbiAgICB9ICksIHsgZ3JvdXA6IGFsaWduR3JvdXAsIHhBbGlnbjogJ2xlZnQnIH0gKTtcclxuXHJcbiAgICAvLyByZXNwb25zaWJsZSBmb3IgbmV0IGZvcmNlIGFxdWFSYWRpb0J1dHRvblxyXG4gICAgY29uc3QgbmV0Rm9yY2VBbGlnbkJveCA9IG5ldyBBbGlnbkJveCggbmV3IFRleHQoIG5ldEZvcmNlU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IE1BWF9XSURUSCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmV0Rm9yY2VUZXh0JyApXHJcbiAgICB9ICksIHsgZ3JvdXA6IGFsaWduR3JvdXAsIHhBbGlnbjogJ2xlZnQnIH0gKTtcclxuXHJcbiAgICAvLyBNYXggd2lkdGggbXVzdCBiZSBzZXQgdG8gdGhlIG1heFdpZHRoIG9mIHRoZSBhbGlnbkdyb3VwIGJhc2VkIG9uIGl0cyBjb250ZW50LlxyXG4gICAgY29uc3QgY29udGVudFNwYWNpbmcgPSBERUZBVUxUX0NPTlRFTlRfU1BBQ0lORyAtIGFsaWduR3JvdXAuZ2V0TWF4V2lkdGgoKTtcclxuXHJcbiAgICBjb25zdCBuZXRGb3JjZVZpc2liaWxpdHlSYWRpb0J1dHRvbiA9IG5ldyBBcXVhUmFkaW9CdXR0b24oXHJcbiAgICAgIG1vZGVsLmZvcmNlc01vZGVQcm9wZXJ0eSxcclxuICAgICAgRm9yY2VzTW9kZS5ORVRfRk9SQ0VTLFxyXG4gICAgICBuZXcgSEJveCggeyBjaGlsZHJlbjogWyBuZXRGb3JjZUFsaWduQm94LCBuZXRGb3JjZUFycm93IF0sIHNwYWNpbmc6IGNvbnRlbnRTcGFjaW5nIH0gKSxcclxuICAgICAgeyByYWRpdXM6IDcsIHNwYWNpbmc6IDcgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgb3B0aW9ucyBmb3IgY2hlY2tib3ggZ3JvdXBcclxuICAgIGxldCB2ZWN0b3JWaXNpYmlsaXR5Q2hlY2tib3hHcm91cDtcclxuICAgIGNvbnN0IHZlbG9jaXR5Q2hlY2tib3hPYmplY3QgPSB7XHJcbiAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBIQm94KCB7IGNoaWxkcmVuOiBbIHZlbG9jaXR5QWxpZ25Cb3gsIHZlbG9jaXR5QXJyb3cgXSwgc3BhY2luZzogY29udGVudFNwYWNpbmcgfSApLFxyXG4gICAgICBwcm9wZXJ0eTogbW9kZWwudmVsb2NpdHlWZWN0b3JWaXNpYmlsaXR5UHJvcGVydHksXHJcbiAgICAgIGxhYmVsOiB2ZWxvY2l0eVN0cmluZ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGFjY2VsZXJhdGlvbkNoZWNrYm94T2JqZWN0ID0ge1xyXG4gICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgSEJveCggeyBjaGlsZHJlbjogWyBhY2NlbGVyYXRpb25BbGlnbkJveCwgYWNjZWxlcmF0aW9uQXJyb3cgXSwgc3BhY2luZzogY29udGVudFNwYWNpbmcgfSApLFxyXG4gICAgICBwcm9wZXJ0eTogbW9kZWwuYWNjZWxlcmF0aW9uVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5LFxyXG4gICAgICBsYWJlbDogYWNjZWxlcmF0aW9uU3RyaW5nXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICggIW1vZGVsLmJhc2ljc1ZlcnNpb24gKSB7XHJcbiAgICAgIHZlY3RvclZpc2liaWxpdHlDaGVja2JveEdyb3VwID0gbmV3IFZlcnRpY2FsQ2hlY2tib3hHcm91cCggWyB2ZWxvY2l0eUNoZWNrYm94T2JqZWN0LCBhY2NlbGVyYXRpb25DaGVja2JveE9iamVjdCBdLCB7XHJcbiAgICAgICAgY2hlY2tib3hPcHRpb25zOiB7XHJcbiAgICAgICAgICBib3hXaWR0aDogMTYsXHJcbiAgICAgICAgICBzcGFjaW5nOiA4XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2ZWN0b3JWaXNpYmlsaXR5Q2hlY2tib3hHcm91cCcgKVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzcG9uc2libGUgZm9yIHZlbG9jaXR5IGFuZCBhY2NlbGVyYXRpb24gdmVjdG9ycyBjaGVja2JveGVzIGFuZCBwZXJpb2QgdHJhY2UgaW4gYmFzaWNzIHZlcnNpb25cclxuICAgIGVsc2Uge1xyXG4gICAgICB2ZWN0b3JWaXNpYmlsaXR5Q2hlY2tib3hHcm91cCA9IG5ldyBWZXJ0aWNhbENoZWNrYm94R3JvdXAoIFsge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBuZXcgVGV4dCggcGVyaW9kVHJhY2VTdHJpbmcsIHtcclxuICAgICAgICAgIGZvbnQ6IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEgsXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwZXJpb2RUcmFjZVRleHQnIClcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgcHJvcGVydHk6IG1vZGVsLmZpcnN0U3ByaW5nLnBlcmlvZFRyYWNlVmlzaWJpbGl0eVByb3BlcnR5XHJcbiAgICAgIH0sXHJcbiAgICAgICAgdmVsb2NpdHlDaGVja2JveE9iamVjdCxcclxuICAgICAgICBhY2NlbGVyYXRpb25DaGVja2JveE9iamVjdFxyXG4gICAgICBdLCB7XHJcbiAgICAgICAgY2hlY2tib3hPcHRpb25zOiB7XHJcbiAgICAgICAgICBib3hXaWR0aDogMTYsXHJcbiAgICAgICAgICBzcGFjaW5nOiA4XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2ZWN0b3JWaXNpYmlsaXR5Q2hlY2tib3hHcm91cCcgKVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJvcGVydHkgdGhhdCB0b2dnbGVzIHdoZXRoZXIgdGhlIGdyYXZpdHkgYW5kIHNwcmluZyBmb3JjZSBjaGVja2JveGVzIGFyZSBlbmFibGVkXHJcbiAgICBjb25zdCBlbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBtb2RlbC5mb3JjZXNNb2RlUHJvcGVydHkudmFsdWUgPT09IEZvcmNlc01vZGUuRk9SQ0VTLCB7XHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUmVzcG9uc2libGUgZm9yIGZvcmNlcyB2ZWN0b3JzIGNoZWNrYm94ZXNcclxuICAgIGNvbnN0IGZvcmNlc1Zpc2liaWxpdHlDaGVja2JveEdyb3VwID0gbmV3IFZlcnRpY2FsQ2hlY2tib3hHcm91cCggWyB7XHJcbiAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBIQm94KCB7IGNoaWxkcmVuOiBbIGdyYXZpdHlBbGlnbkJveCwgZ3Jhdml0eUFycm93IF0sIHNwYWNpbmc6IGNvbnRlbnRTcGFjaW5nIC0gaW5kZW50YXRpb24gfSApLFxyXG4gICAgICBwcm9wZXJ0eTogbW9kZWwuZ3Jhdml0eVZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eSxcclxuICAgICAgbGFiZWw6IGdyYXZpdHlTdHJpbmdcclxuICAgIH0sIHtcclxuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IEhCb3goIHsgY2hpbGRyZW46IFsgc3ByaW5nQWxpZ25Cb3gsIHNwcmluZ0Fycm93IF0sIHNwYWNpbmc6IGNvbnRlbnRTcGFjaW5nIC0gaW5kZW50YXRpb24gfSApLFxyXG4gICAgICBwcm9wZXJ0eTogbW9kZWwuc3ByaW5nVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5LFxyXG4gICAgICBsYWJlbDogc3ByaW5nU3RyaW5nXHJcbiAgICB9IF0sIHtcclxuICAgICAgY2hlY2tib3hPcHRpb25zOiB7XHJcbiAgICAgICAgZW5hYmxlZFByb3BlcnR5OiBlbmFibGVkUHJvcGVydHksXHJcbiAgICAgICAgYm94V2lkdGg6IDE2XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvcmNlc1Zpc2liaWxpdHlDaGVja2JveEdyb3VwJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbWFuYWdlcyB0aGUgbXV0YWJpbGl0eSBvZiB0aGUgZm9yY2VzIGNoZWNrYm94ZXMgZGVwZW5kZW50IG9uIHRoZSBmb3JjZXMgYW5kIG5ldCBmb3JjZSBhcXVhUmFkaW9CdXR0b25cclxuICAgIG1vZGVsLmZvcmNlc01vZGVQcm9wZXJ0eS5saW5rKCBtb2RlID0+IHtcclxuICAgICAgZW5hYmxlZFByb3BlcnR5LnNldCggbW9kZSA9PT0gRm9yY2VzTW9kZS5GT1JDRVMgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb250YWlucyBhbGwgY2hlY2tib3hlcyBhbmQgcmFkaW8gYnV0dG9ucyBmb3IgdmVjdG9yIHZpc2liaWxpdHlcclxuICAgIGxldCB2ZWN0b3JWaXNpYmlsaXR5Q29udHJvbHNWQm94O1xyXG5cclxuICAgIC8vIGdyb3VwcyB0aGUgY2hlY2tib3hlcyBhbmQgZm9yY2VzIGFxdWFSYWRpb0J1dHRvblxyXG4gICAgaWYgKCBvcHRpb25zLnNob3dGb3JjZXMgKSB7XHJcbiAgICAgIHZlY3RvclZpc2liaWxpdHlDb250cm9sc1ZCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgdmVjdG9yVmlzaWJpbGl0eUNoZWNrYm94R3JvdXAsXHJcbiAgICAgICAgICAgIGZvcmNlc1Zpc2liaWxpdHlSYWRpb0J1dHRvbixcclxuICAgICAgICAgICAgbmV3IEFsaWduQm94KCBmb3JjZXNWaXNpYmlsaXR5Q2hlY2tib3hHcm91cCwgeyBsZWZ0TWFyZ2luOiAyMiB9ICksXHJcbiAgICAgICAgICAgIG5ldEZvcmNlVmlzaWJpbGl0eVJhZGlvQnV0dG9uXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgc3BhY2luZzogOCxcclxuICAgICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGFjaW5nVW5pdCcgKVxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB2ZWN0b3JWaXNpYmlsaXR5Q29udHJvbHNWQm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgdmVjdG9yVmlzaWJpbGl0eUNoZWNrYm94R3JvdXBcclxuICAgICAgICBdLFxyXG4gICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3BhY2luZ1VuaXQnIClcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY29udHJvbHNIQm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogNjUsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgdmVjdG9yVmlzaWJpbGl0eUNvbnRyb2xzVkJveFxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjb250cm9sc0hCb3ggKTtcclxuICB9XHJcbn1cclxuXHJcbm1hc3Nlc0FuZFNwcmluZ3MucmVnaXN0ZXIoICdWZWN0b3JWaXNpYmlsaXR5Q29udHJvbE5vZGUnLCBWZWN0b3JWaXNpYmlsaXR5Q29udHJvbE5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZlY3RvclZpc2liaWxpdHlDb250cm9sTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLFFBQVEsRUFBRUMsVUFBVSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ2hHLE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MscUJBQXFCLE1BQU0sNkNBQTZDO0FBQy9FLE9BQU9DLHlCQUF5QixNQUFNLDJDQUEyQztBQUNqRixPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLGdCQUFnQixNQUFNLHVDQUF1QztBQUNwRSxPQUFPQyxXQUFXLE1BQU0sa0NBQWtDO0FBQzFELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFFdEUsTUFBTUMsa0JBQWtCLEdBQUdELHVCQUF1QixDQUFDRSxZQUFZO0FBQy9ELE1BQU1DLFlBQVksR0FBR0gsdUJBQXVCLENBQUNJ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