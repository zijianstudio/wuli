// Copyright 2014-2023, University of Colorado Boulder

/**
 * Contains the energy plot, along with the associated controls.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Range from '../../../../dot/js/Range.js';
import BarChartNode from '../../../../griddle/js/BarChartNode.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import MoveToTrashLegendButton from '../../../../scenery-phet/js/buttons/MoveToTrashLegendButton.js';
import ZoomButton from '../../../../scenery-phet/js/buttons/ZoomButton.js';
import { AlignBox, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import ColorConstants from '../../../../sun/js/ColorConstants.js';
import Panel from '../../../../sun/js/Panel.js';
import PendulumLabConstants from '../../common/PendulumLabConstants.js';
import pendulumLab from '../../pendulumLab.js';
import PendulumLabStrings from '../../PendulumLabStrings.js';
import EnergyLegendDialog from './EnergyLegendDialog.js';
const energyGraphString = PendulumLabStrings.energyGraph;
const legendKineticEnergyAbbreviationString = PendulumLabStrings.legend.kineticEnergyAbbreviation;
const legendPotentialEnergyAbbreviationString = PendulumLabStrings.legend.potentialEnergyAbbreviation;
const legendThermalEnergyAbbreviationString = PendulumLabStrings.legend.thermalEnergyAbbreviation;
const legendTotalEnergyAbbreviationString = PendulumLabStrings.legend.totalEnergyAbbreviation;
const pendulumMassPatternString = PendulumLabStrings.pendulumMassPattern;
class EnergyGraphAccordionBox extends AccordionBox {
  /**
   * @param {EnergyModel} model
   * @param {Property.<number>} chartHeightProperty
   * @param {Object} [options]
   */
  constructor(model, chartHeightProperty, options) {
    options = merge({}, PendulumLabConstants.BOX_OPTIONS, {
      expandedProperty: model.isEnergyBoxExpandedProperty,
      buttonXMargin: 10,
      buttonYMargin: 6,
      titleNode: new Text(energyGraphString, {
        font: PendulumLabConstants.TITLE_FONT,
        maxWidth: 110
      }),
      titleAlignX: 'left',
      titleXMargin: 10,
      contentYSpacing: 0,
      resize: true
    }, options);
    const headerText = new Text('', {
      font: PendulumLabConstants.ENERGY_HEADER_FONT,
      maxWidth: 122
    });
    model.activeEnergyPendulumProperty.link(pendulum => {
      headerText.string = StringUtils.fillIn(pendulumMassPatternString, {
        pendulumNumber: `${pendulum.index + 1}`
      });
      headerText.fill = pendulum.color;
    });
    const kineticEnergyProperty = new DynamicProperty(model.activeEnergyPendulumProperty, {
      derive: 'kineticEnergyProperty'
    });
    const potentialEnergyProperty = new DynamicProperty(model.activeEnergyPendulumProperty, {
      derive: 'potentialEnergyProperty'
    });
    const thermalEnergyProperty = new DynamicProperty(model.activeEnergyPendulumProperty, {
      bidirectional: true,
      derive: 'thermalEnergyProperty'
    });
    const clearThermalButton = new MoveToTrashLegendButton({
      arrowColor: PendulumLabConstants.THERMAL_ENERGY_COLOR,
      listener: thermalEnergyProperty.reset.bind(thermalEnergyProperty),
      scale: 0.72
    });
    thermalEnergyProperty.link(thermalEnergy => {
      clearThermalButton.enabled = thermalEnergy !== 0;
    });
    const chartRangeProperty = new DerivedProperty([chartHeightProperty], chartHeight => new Range(0, chartHeight));
    const kineticBarEntry = {
      property: kineticEnergyProperty,
      color: PendulumLabConstants.KINETIC_ENERGY_COLOR
    };
    const potentialBarEntry = {
      property: potentialEnergyProperty,
      color: PendulumLabConstants.POTENTIAL_ENERGY_COLOR
    };
    const thermalBarEntry = {
      property: thermalEnergyProperty,
      color: PendulumLabConstants.THERMAL_ENERGY_COLOR
    };
    const barChartNode = new BarChartNode([{
      entries: [kineticBarEntry],
      labelString: legendKineticEnergyAbbreviationString
    }, {
      entries: [potentialBarEntry],
      labelString: legendPotentialEnergyAbbreviationString
    }, {
      entries: [thermalBarEntry],
      labelString: legendThermalEnergyAbbreviationString,
      labelNode: clearThermalButton
    }, {
      entries: [kineticBarEntry, potentialBarEntry, thermalBarEntry],
      labelString: legendTotalEnergyAbbreviationString,
      offScaleArrowFill: '#bbb'
    }], chartRangeProperty, {
      barOptions: {
        // Apply a scaling correction (so that energyZoomProperty=1 corresponds to 40 * the actual energy amount)
        scaleProperty: new DerivedProperty([model.energyZoomProperty], energyZoom => 40 * energyZoom)
      }
    });
    function barChartUpdate() {
      if (model.isEnergyBoxExpandedProperty.value) {
        barChartNode.update();
      }
    }
    kineticEnergyProperty.lazyLink(barChartUpdate);
    potentialEnergyProperty.lazyLink(barChartUpdate);
    thermalEnergyProperty.lazyLink(barChartUpdate);
    model.energyZoomProperty.lazyLink(barChartUpdate);
    chartRangeProperty.lazyLink(barChartUpdate);
    model.isEnergyBoxExpandedProperty.lazyLink(barChartUpdate);
    barChartUpdate();
    const content = new VBox({
      spacing: 4,
      children: [headerText, barChartNode]
    });
    function createRadioButton(pendulum) {
      const label = new Text(pendulum.index + 1, {
        font: PendulumLabConstants.TITLE_FONT
      });
      const button = new AquaRadioButton(model.activeEnergyPendulumProperty, pendulum, label, {
        radius: label.height / 2.2,
        xSpacing: 3
      });
      button.touchArea = button.localBounds.dilatedXY(10, 5);
      return button;
    }
    function createZoomButton(isIn) {
      return new ZoomButton(merge({
        in: isIn,
        listener: () => {
          const zoomMultiplier = 1.3;
          if (isIn) {
            model.energyZoomProperty.value *= zoomMultiplier;
          } else {
            model.energyZoomProperty.value /= zoomMultiplier;
          }
        }
      }, {
        baseColor: ColorConstants.LIGHT_BLUE,
        magnifyingGlassOptions: {
          glassRadius: 7
        },
        touchAreaXDilation: 5,
        touchAreaYDilation: 5
      }));
    }
    const radioButtonOne = createRadioButton(model.pendula[0]);
    const radioButtonTwo = createRadioButton(model.pendula[1]);

    // no need to unlink, present for the lifetime of the sim
    model.numberOfPendulaProperty.link(numberOfPendula => {
      if (numberOfPendula === 1) {
        model.activeEnergyPendulumProperty.value = model.pendula[0];
        radioButtonTwo.setEnabled(false);
      } else if (numberOfPendula === 2) {
        radioButtonTwo.setEnabled(true);
      }
    });
    const panel = new Panel(content, {
      cornerRadius: PendulumLabConstants.PANEL_CORNER_RADIUS
    });
    const zoomOutButton = createZoomButton(false);
    const zoomInButton = createZoomButton(true);
    let energyDialog; // lazily created

    const infoButton = new InfoButton({
      iconFill: 'rgb( 41, 106, 163 )',
      maxHeight: 1.1 * zoomInButton.height,
      left: panel.left,
      centerY: zoomOutButton.centerY,
      listener: () => {
        // Lazy creation.
        if (!energyDialog) {
          energyDialog = new EnergyLegendDialog();
        }
        energyDialog.show();
      },
      touchAreaXDilation: 10,
      touchAreaYDilation: 5
    });
    const radioButtonBox = new HBox({
      spacing: 20,
      children: [radioButtonOne, radioButtonTwo]
    });

    // no need to unlink, present for the lifetime of the sim
    model.numberOfPendulaProperty.link(numberOfPendula => {
      radioButtonBox.visible = numberOfPendula === 2;
    });
    const boxContent = new VBox({
      spacing: 5,
      excludeInvisibleChildrenFromBounds: false,
      children: [radioButtonBox, panel, new Node({
        children: [infoButton, new HBox({
          spacing: 10,
          children: [zoomOutButton, zoomInButton],
          right: panel.right
        })]
      })]
    });
    super(new AlignBox(boxContent, {
      group: PendulumLabConstants.LEFT_CONTENT_ALIGN_GROUP
    }), options);
  }
}
pendulumLab.register('EnergyGraphAccordionBox', EnergyGraphAccordionBox);
export default EnergyGraphAccordionBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJSYW5nZSIsIkJhckNoYXJ0Tm9kZSIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJJbmZvQnV0dG9uIiwiTW92ZVRvVHJhc2hMZWdlbmRCdXR0b24iLCJab29tQnV0dG9uIiwiQWxpZ25Cb3giLCJIQm94IiwiTm9kZSIsIlRleHQiLCJWQm94IiwiQWNjb3JkaW9uQm94IiwiQXF1YVJhZGlvQnV0dG9uIiwiQ29sb3JDb25zdGFudHMiLCJQYW5lbCIsIlBlbmR1bHVtTGFiQ29uc3RhbnRzIiwicGVuZHVsdW1MYWIiLCJQZW5kdWx1bUxhYlN0cmluZ3MiLCJFbmVyZ3lMZWdlbmREaWFsb2ciLCJlbmVyZ3lHcmFwaFN0cmluZyIsImVuZXJneUdyYXBoIiwibGVnZW5kS2luZXRpY0VuZXJneUFiYnJldmlhdGlvblN0cmluZyIsImxlZ2VuZCIsImtpbmV0aWNFbmVyZ3lBYmJyZXZpYXRpb24iLCJsZWdlbmRQb3RlbnRpYWxFbmVyZ3lBYmJyZXZpYXRpb25TdHJpbmciLCJwb3RlbnRpYWxFbmVyZ3lBYmJyZXZpYXRpb24iLCJsZWdlbmRUaGVybWFsRW5lcmd5QWJicmV2aWF0aW9uU3RyaW5nIiwidGhlcm1hbEVuZXJneUFiYnJldmlhdGlvbiIsImxlZ2VuZFRvdGFsRW5lcmd5QWJicmV2aWF0aW9uU3RyaW5nIiwidG90YWxFbmVyZ3lBYmJyZXZpYXRpb24iLCJwZW5kdWx1bU1hc3NQYXR0ZXJuU3RyaW5nIiwicGVuZHVsdW1NYXNzUGF0dGVybiIsIkVuZXJneUdyYXBoQWNjb3JkaW9uQm94IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImNoYXJ0SGVpZ2h0UHJvcGVydHkiLCJvcHRpb25zIiwiQk9YX09QVElPTlMiLCJleHBhbmRlZFByb3BlcnR5IiwiaXNFbmVyZ3lCb3hFeHBhbmRlZFByb3BlcnR5IiwiYnV0dG9uWE1hcmdpbiIsImJ1dHRvbllNYXJnaW4iLCJ0aXRsZU5vZGUiLCJmb250IiwiVElUTEVfRk9OVCIsIm1heFdpZHRoIiwidGl0bGVBbGlnblgiLCJ0aXRsZVhNYXJnaW4iLCJjb250ZW50WVNwYWNpbmciLCJyZXNpemUiLCJoZWFkZXJUZXh0IiwiRU5FUkdZX0hFQURFUl9GT05UIiwiYWN0aXZlRW5lcmd5UGVuZHVsdW1Qcm9wZXJ0eSIsImxpbmsiLCJwZW5kdWx1bSIsInN0cmluZyIsImZpbGxJbiIsInBlbmR1bHVtTnVtYmVyIiwiaW5kZXgiLCJmaWxsIiwiY29sb3IiLCJraW5ldGljRW5lcmd5UHJvcGVydHkiLCJkZXJpdmUiLCJwb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eSIsInRoZXJtYWxFbmVyZ3lQcm9wZXJ0eSIsImJpZGlyZWN0aW9uYWwiLCJjbGVhclRoZXJtYWxCdXR0b24iLCJhcnJvd0NvbG9yIiwiVEhFUk1BTF9FTkVSR1lfQ09MT1IiLCJsaXN0ZW5lciIsInJlc2V0IiwiYmluZCIsInNjYWxlIiwidGhlcm1hbEVuZXJneSIsImVuYWJsZWQiLCJjaGFydFJhbmdlUHJvcGVydHkiLCJjaGFydEhlaWdodCIsImtpbmV0aWNCYXJFbnRyeSIsInByb3BlcnR5IiwiS0lORVRJQ19FTkVSR1lfQ09MT1IiLCJwb3RlbnRpYWxCYXJFbnRyeSIsIlBPVEVOVElBTF9FTkVSR1lfQ09MT1IiLCJ0aGVybWFsQmFyRW50cnkiLCJiYXJDaGFydE5vZGUiLCJlbnRyaWVzIiwibGFiZWxTdHJpbmciLCJsYWJlbE5vZGUiLCJvZmZTY2FsZUFycm93RmlsbCIsImJhck9wdGlvbnMiLCJzY2FsZVByb3BlcnR5IiwiZW5lcmd5Wm9vbVByb3BlcnR5IiwiZW5lcmd5Wm9vbSIsImJhckNoYXJ0VXBkYXRlIiwidmFsdWUiLCJ1cGRhdGUiLCJsYXp5TGluayIsImNvbnRlbnQiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJjcmVhdGVSYWRpb0J1dHRvbiIsImxhYmVsIiwiYnV0dG9uIiwicmFkaXVzIiwiaGVpZ2h0IiwieFNwYWNpbmciLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsImNyZWF0ZVpvb21CdXR0b24iLCJpc0luIiwiaW4iLCJ6b29tTXVsdGlwbGllciIsImJhc2VDb2xvciIsIkxJR0hUX0JMVUUiLCJtYWduaWZ5aW5nR2xhc3NPcHRpb25zIiwiZ2xhc3NSYWRpdXMiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJyYWRpb0J1dHRvbk9uZSIsInBlbmR1bGEiLCJyYWRpb0J1dHRvblR3byIsIm51bWJlck9mUGVuZHVsYVByb3BlcnR5IiwibnVtYmVyT2ZQZW5kdWxhIiwic2V0RW5hYmxlZCIsInBhbmVsIiwiY29ybmVyUmFkaXVzIiwiUEFORUxfQ09STkVSX1JBRElVUyIsInpvb21PdXRCdXR0b24iLCJ6b29tSW5CdXR0b24iLCJlbmVyZ3lEaWFsb2ciLCJpbmZvQnV0dG9uIiwiaWNvbkZpbGwiLCJtYXhIZWlnaHQiLCJsZWZ0IiwiY2VudGVyWSIsInNob3ciLCJyYWRpb0J1dHRvbkJveCIsInZpc2libGUiLCJib3hDb250ZW50IiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsInJpZ2h0IiwiZ3JvdXAiLCJMRUZUX0NPTlRFTlRfQUxJR05fR1JPVVAiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneUdyYXBoQWNjb3JkaW9uQm94LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnRhaW5zIHRoZSBlbmVyZ3kgcGxvdCwgYWxvbmcgd2l0aCB0aGUgYXNzb2NpYXRlZCBjb250cm9scy5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRHluYW1pY1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRHluYW1pY1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBCYXJDaGFydE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vZ3JpZGRsZS9qcy9CYXJDaGFydE5vZGUuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBJbmZvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0luZm9CdXR0b24uanMnO1xyXG5pbXBvcnQgTW92ZVRvVHJhc2hMZWdlbmRCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvTW92ZVRvVHJhc2hMZWdlbmRCdXR0b24uanMnO1xyXG5pbXBvcnQgWm9vbUJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9ab29tQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEhCb3gsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b24uanMnO1xyXG5pbXBvcnQgQ29sb3JDb25zdGFudHMgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NvbG9yQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBQZW5kdWx1bUxhYkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vUGVuZHVsdW1MYWJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgcGVuZHVsdW1MYWIgZnJvbSAnLi4vLi4vcGVuZHVsdW1MYWIuanMnO1xyXG5pbXBvcnQgUGVuZHVsdW1MYWJTdHJpbmdzIGZyb20gJy4uLy4uL1BlbmR1bHVtTGFiU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lMZWdlbmREaWFsb2cgZnJvbSAnLi9FbmVyZ3lMZWdlbmREaWFsb2cuanMnO1xyXG5cclxuY29uc3QgZW5lcmd5R3JhcGhTdHJpbmcgPSBQZW5kdWx1bUxhYlN0cmluZ3MuZW5lcmd5R3JhcGg7XHJcbmNvbnN0IGxlZ2VuZEtpbmV0aWNFbmVyZ3lBYmJyZXZpYXRpb25TdHJpbmcgPSBQZW5kdWx1bUxhYlN0cmluZ3MubGVnZW5kLmtpbmV0aWNFbmVyZ3lBYmJyZXZpYXRpb247XHJcbmNvbnN0IGxlZ2VuZFBvdGVudGlhbEVuZXJneUFiYnJldmlhdGlvblN0cmluZyA9IFBlbmR1bHVtTGFiU3RyaW5ncy5sZWdlbmQucG90ZW50aWFsRW5lcmd5QWJicmV2aWF0aW9uO1xyXG5jb25zdCBsZWdlbmRUaGVybWFsRW5lcmd5QWJicmV2aWF0aW9uU3RyaW5nID0gUGVuZHVsdW1MYWJTdHJpbmdzLmxlZ2VuZC50aGVybWFsRW5lcmd5QWJicmV2aWF0aW9uO1xyXG5jb25zdCBsZWdlbmRUb3RhbEVuZXJneUFiYnJldmlhdGlvblN0cmluZyA9IFBlbmR1bHVtTGFiU3RyaW5ncy5sZWdlbmQudG90YWxFbmVyZ3lBYmJyZXZpYXRpb247XHJcbmNvbnN0IHBlbmR1bHVtTWFzc1BhdHRlcm5TdHJpbmcgPSBQZW5kdWx1bUxhYlN0cmluZ3MucGVuZHVsdW1NYXNzUGF0dGVybjtcclxuXHJcbmNsYXNzIEVuZXJneUdyYXBoQWNjb3JkaW9uQm94IGV4dGVuZHMgQWNjb3JkaW9uQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBjaGFydEhlaWdodFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgY2hhcnRIZWlnaHRQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHt9LCBQZW5kdWx1bUxhYkNvbnN0YW50cy5CT1hfT1BUSU9OUywge1xyXG4gICAgICBleHBhbmRlZFByb3BlcnR5OiBtb2RlbC5pc0VuZXJneUJveEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIGJ1dHRvblhNYXJnaW46IDEwLFxyXG4gICAgICBidXR0b25ZTWFyZ2luOiA2LFxyXG4gICAgICB0aXRsZU5vZGU6IG5ldyBUZXh0KCBlbmVyZ3lHcmFwaFN0cmluZywge1xyXG4gICAgICAgIGZvbnQ6IFBlbmR1bHVtTGFiQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IDExMFxyXG4gICAgICB9ICksXHJcbiAgICAgIHRpdGxlQWxpZ25YOiAnbGVmdCcsXHJcbiAgICAgIHRpdGxlWE1hcmdpbjogMTAsXHJcbiAgICAgIGNvbnRlbnRZU3BhY2luZzogMCxcclxuICAgICAgcmVzaXplOiB0cnVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgaGVhZGVyVGV4dCA9IG5ldyBUZXh0KCAnJywge1xyXG4gICAgICBmb250OiBQZW5kdWx1bUxhYkNvbnN0YW50cy5FTkVSR1lfSEVBREVSX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAxMjJcclxuICAgIH0gKTtcclxuXHJcbiAgICBtb2RlbC5hY3RpdmVFbmVyZ3lQZW5kdWx1bVByb3BlcnR5LmxpbmsoIHBlbmR1bHVtID0+IHtcclxuICAgICAgaGVhZGVyVGV4dC5zdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIHBlbmR1bHVtTWFzc1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBwZW5kdWx1bU51bWJlcjogYCR7cGVuZHVsdW0uaW5kZXggKyAxfWBcclxuICAgICAgfSApO1xyXG4gICAgICBoZWFkZXJUZXh0LmZpbGwgPSBwZW5kdWx1bS5jb2xvcjtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBraW5ldGljRW5lcmd5UHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCBtb2RlbC5hY3RpdmVFbmVyZ3lQZW5kdWx1bVByb3BlcnR5LCB7IGRlcml2ZTogJ2tpbmV0aWNFbmVyZ3lQcm9wZXJ0eScgfSApO1xyXG4gICAgY29uc3QgcG90ZW50aWFsRW5lcmd5UHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCBtb2RlbC5hY3RpdmVFbmVyZ3lQZW5kdWx1bVByb3BlcnR5LCB7IGRlcml2ZTogJ3BvdGVudGlhbEVuZXJneVByb3BlcnR5JyB9ICk7XHJcbiAgICBjb25zdCB0aGVybWFsRW5lcmd5UHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCBtb2RlbC5hY3RpdmVFbmVyZ3lQZW5kdWx1bVByb3BlcnR5LCB7XHJcbiAgICAgIGJpZGlyZWN0aW9uYWw6IHRydWUsXHJcbiAgICAgIGRlcml2ZTogJ3RoZXJtYWxFbmVyZ3lQcm9wZXJ0eSdcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjbGVhclRoZXJtYWxCdXR0b24gPSBuZXcgTW92ZVRvVHJhc2hMZWdlbmRCdXR0b24oIHtcclxuICAgICAgYXJyb3dDb2xvcjogUGVuZHVsdW1MYWJDb25zdGFudHMuVEhFUk1BTF9FTkVSR1lfQ09MT1IsXHJcbiAgICAgIGxpc3RlbmVyOiB0aGVybWFsRW5lcmd5UHJvcGVydHkucmVzZXQuYmluZCggdGhlcm1hbEVuZXJneVByb3BlcnR5ICksXHJcbiAgICAgIHNjYWxlOiAwLjcyXHJcbiAgICB9ICk7XHJcbiAgICB0aGVybWFsRW5lcmd5UHJvcGVydHkubGluayggdGhlcm1hbEVuZXJneSA9PiB7XHJcbiAgICAgIGNsZWFyVGhlcm1hbEJ1dHRvbi5lbmFibGVkID0gdGhlcm1hbEVuZXJneSAhPT0gMDtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjaGFydFJhbmdlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGNoYXJ0SGVpZ2h0UHJvcGVydHkgXSwgY2hhcnRIZWlnaHQgPT4gbmV3IFJhbmdlKCAwLCBjaGFydEhlaWdodCApICk7XHJcbiAgICBjb25zdCBraW5ldGljQmFyRW50cnkgPSB7XHJcbiAgICAgIHByb3BlcnR5OiBraW5ldGljRW5lcmd5UHJvcGVydHksXHJcbiAgICAgIGNvbG9yOiBQZW5kdWx1bUxhYkNvbnN0YW50cy5LSU5FVElDX0VORVJHWV9DT0xPUlxyXG4gICAgfTtcclxuICAgIGNvbnN0IHBvdGVudGlhbEJhckVudHJ5ID0ge1xyXG4gICAgICBwcm9wZXJ0eTogcG90ZW50aWFsRW5lcmd5UHJvcGVydHksXHJcbiAgICAgIGNvbG9yOiBQZW5kdWx1bUxhYkNvbnN0YW50cy5QT1RFTlRJQUxfRU5FUkdZX0NPTE9SXHJcbiAgICB9O1xyXG4gICAgY29uc3QgdGhlcm1hbEJhckVudHJ5ID0ge1xyXG4gICAgICBwcm9wZXJ0eTogdGhlcm1hbEVuZXJneVByb3BlcnR5LFxyXG4gICAgICBjb2xvcjogUGVuZHVsdW1MYWJDb25zdGFudHMuVEhFUk1BTF9FTkVSR1lfQ09MT1JcclxuICAgIH07XHJcbiAgICBjb25zdCBiYXJDaGFydE5vZGUgPSBuZXcgQmFyQ2hhcnROb2RlKCBbXHJcbiAgICAgIHtcclxuICAgICAgICBlbnRyaWVzOiBbIGtpbmV0aWNCYXJFbnRyeSBdLFxyXG4gICAgICAgIGxhYmVsU3RyaW5nOiBsZWdlbmRLaW5ldGljRW5lcmd5QWJicmV2aWF0aW9uU3RyaW5nXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBlbnRyaWVzOiBbIHBvdGVudGlhbEJhckVudHJ5IF0sXHJcbiAgICAgICAgbGFiZWxTdHJpbmc6IGxlZ2VuZFBvdGVudGlhbEVuZXJneUFiYnJldmlhdGlvblN0cmluZ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZW50cmllczogWyB0aGVybWFsQmFyRW50cnkgXSxcclxuICAgICAgICBsYWJlbFN0cmluZzogbGVnZW5kVGhlcm1hbEVuZXJneUFiYnJldmlhdGlvblN0cmluZyxcclxuICAgICAgICBsYWJlbE5vZGU6IGNsZWFyVGhlcm1hbEJ1dHRvblxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZW50cmllczogWyBraW5ldGljQmFyRW50cnksIHBvdGVudGlhbEJhckVudHJ5LCB0aGVybWFsQmFyRW50cnkgXSxcclxuICAgICAgICBsYWJlbFN0cmluZzogbGVnZW5kVG90YWxFbmVyZ3lBYmJyZXZpYXRpb25TdHJpbmcsXHJcbiAgICAgICAgb2ZmU2NhbGVBcnJvd0ZpbGw6ICcjYmJiJ1xyXG4gICAgICB9XHJcbiAgICBdLCBjaGFydFJhbmdlUHJvcGVydHksIHtcclxuICAgICAgYmFyT3B0aW9uczoge1xyXG4gICAgICAgIC8vIEFwcGx5IGEgc2NhbGluZyBjb3JyZWN0aW9uIChzbyB0aGF0IGVuZXJneVpvb21Qcm9wZXJ0eT0xIGNvcnJlc3BvbmRzIHRvIDQwICogdGhlIGFjdHVhbCBlbmVyZ3kgYW1vdW50KVxyXG4gICAgICAgIHNjYWxlUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbW9kZWwuZW5lcmd5Wm9vbVByb3BlcnR5IF0sIGVuZXJneVpvb20gPT4gNDAgKiBlbmVyZ3lab29tIClcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGJhckNoYXJ0VXBkYXRlKCkge1xyXG4gICAgICBpZiAoIG1vZGVsLmlzRW5lcmd5Qm94RXhwYW5kZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBiYXJDaGFydE5vZGUudXBkYXRlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBraW5ldGljRW5lcmd5UHJvcGVydHkubGF6eUxpbmsoIGJhckNoYXJ0VXBkYXRlICk7XHJcbiAgICBwb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eS5sYXp5TGluayggYmFyQ2hhcnRVcGRhdGUgKTtcclxuICAgIHRoZXJtYWxFbmVyZ3lQcm9wZXJ0eS5sYXp5TGluayggYmFyQ2hhcnRVcGRhdGUgKTtcclxuICAgIG1vZGVsLmVuZXJneVpvb21Qcm9wZXJ0eS5sYXp5TGluayggYmFyQ2hhcnRVcGRhdGUgKTtcclxuICAgIGNoYXJ0UmFuZ2VQcm9wZXJ0eS5sYXp5TGluayggYmFyQ2hhcnRVcGRhdGUgKTtcclxuICAgIG1vZGVsLmlzRW5lcmd5Qm94RXhwYW5kZWRQcm9wZXJ0eS5sYXp5TGluayggYmFyQ2hhcnRVcGRhdGUgKTtcclxuICAgIGJhckNoYXJ0VXBkYXRlKCk7XHJcblxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDQsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgaGVhZGVyVGV4dCxcclxuICAgICAgICBiYXJDaGFydE5vZGVcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVJhZGlvQnV0dG9uKCBwZW5kdWx1bSApIHtcclxuICAgICAgY29uc3QgbGFiZWwgPSBuZXcgVGV4dCggcGVuZHVsdW0uaW5kZXggKyAxLCB7XHJcbiAgICAgICAgZm9udDogUGVuZHVsdW1MYWJDb25zdGFudHMuVElUTEVfRk9OVFxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IGJ1dHRvbiA9IG5ldyBBcXVhUmFkaW9CdXR0b24oIG1vZGVsLmFjdGl2ZUVuZXJneVBlbmR1bHVtUHJvcGVydHksIHBlbmR1bHVtLCBsYWJlbCwge1xyXG4gICAgICAgIHJhZGl1czogbGFiZWwuaGVpZ2h0IC8gMi4yLFxyXG4gICAgICAgIHhTcGFjaW5nOiAzXHJcbiAgICAgIH0gKTtcclxuICAgICAgYnV0dG9uLnRvdWNoQXJlYSA9IGJ1dHRvbi5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDEwLCA1ICk7XHJcbiAgICAgIHJldHVybiBidXR0b247XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlWm9vbUJ1dHRvbiggaXNJbiApIHtcclxuICAgICAgcmV0dXJuIG5ldyBab29tQnV0dG9uKCBtZXJnZSgge1xyXG4gICAgICAgIGluOiBpc0luLFxyXG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB6b29tTXVsdGlwbGllciA9IDEuMztcclxuICAgICAgICAgIGlmICggaXNJbiApIHtcclxuICAgICAgICAgICAgbW9kZWwuZW5lcmd5Wm9vbVByb3BlcnR5LnZhbHVlICo9IHpvb21NdWx0aXBsaWVyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG1vZGVsLmVuZXJneVpvb21Qcm9wZXJ0eS52YWx1ZSAvPSB6b29tTXVsdGlwbGllcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBiYXNlQ29sb3I6IENvbG9yQ29uc3RhbnRzLkxJR0hUX0JMVUUsXHJcbiAgICAgICAgbWFnbmlmeWluZ0dsYXNzT3B0aW9uczoge1xyXG4gICAgICAgICAgZ2xhc3NSYWRpdXM6IDdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNSxcclxuICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDVcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmFkaW9CdXR0b25PbmUgPSBjcmVhdGVSYWRpb0J1dHRvbiggbW9kZWwucGVuZHVsYVsgMCBdICk7XHJcbiAgICBjb25zdCByYWRpb0J1dHRvblR3byA9IGNyZWF0ZVJhZGlvQnV0dG9uKCBtb2RlbC5wZW5kdWxhWyAxIF0gKTtcclxuXHJcbiAgICAvLyBubyBuZWVkIHRvIHVubGluaywgcHJlc2VudCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIG1vZGVsLm51bWJlck9mUGVuZHVsYVByb3BlcnR5LmxpbmsoIG51bWJlck9mUGVuZHVsYSA9PiB7XHJcbiAgICAgIGlmICggbnVtYmVyT2ZQZW5kdWxhID09PSAxICkge1xyXG4gICAgICAgIG1vZGVsLmFjdGl2ZUVuZXJneVBlbmR1bHVtUHJvcGVydHkudmFsdWUgPSBtb2RlbC5wZW5kdWxhWyAwIF07XHJcbiAgICAgICAgcmFkaW9CdXR0b25Ud28uc2V0RW5hYmxlZCggZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggbnVtYmVyT2ZQZW5kdWxhID09PSAyICkge1xyXG4gICAgICAgIHJhZGlvQnV0dG9uVHdvLnNldEVuYWJsZWQoIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBhbmVsID0gbmV3IFBhbmVsKCBjb250ZW50LCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogUGVuZHVsdW1MYWJDb25zdGFudHMuUEFORUxfQ09STkVSX1JBRElVU1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHpvb21PdXRCdXR0b24gPSBjcmVhdGVab29tQnV0dG9uKCBmYWxzZSApO1xyXG4gICAgY29uc3Qgem9vbUluQnV0dG9uID0gY3JlYXRlWm9vbUJ1dHRvbiggdHJ1ZSApO1xyXG5cclxuICAgIGxldCBlbmVyZ3lEaWFsb2c7IC8vIGxhemlseSBjcmVhdGVkXHJcblxyXG4gICAgY29uc3QgaW5mb0J1dHRvbiA9IG5ldyBJbmZvQnV0dG9uKCB7XHJcbiAgICAgIGljb25GaWxsOiAncmdiKCA0MSwgMTA2LCAxNjMgKScsXHJcbiAgICAgIG1heEhlaWdodDogMS4xICogem9vbUluQnV0dG9uLmhlaWdodCxcclxuICAgICAgbGVmdDogcGFuZWwubGVmdCxcclxuICAgICAgY2VudGVyWTogem9vbU91dEJ1dHRvbi5jZW50ZXJZLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIC8vIExhenkgY3JlYXRpb24uXHJcbiAgICAgICAgaWYgKCAhZW5lcmd5RGlhbG9nICkge1xyXG4gICAgICAgICAgZW5lcmd5RGlhbG9nID0gbmV3IEVuZXJneUxlZ2VuZERpYWxvZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbmVyZ3lEaWFsb2cuc2hvdygpO1xyXG4gICAgICB9LFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDEwLFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDVcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByYWRpb0J1dHRvbkJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDIwLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIHJhZGlvQnV0dG9uT25lLFxyXG4gICAgICAgIHJhZGlvQnV0dG9uVHdvXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBubyBuZWVkIHRvIHVubGluaywgcHJlc2VudCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIG1vZGVsLm51bWJlck9mUGVuZHVsYVByb3BlcnR5LmxpbmsoIG51bWJlck9mUGVuZHVsYSA9PiB7XHJcbiAgICAgIHJhZGlvQnV0dG9uQm94LnZpc2libGUgPSBudW1iZXJPZlBlbmR1bGEgPT09IDI7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYm94Q29udGVudCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGZhbHNlLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIHJhZGlvQnV0dG9uQm94LFxyXG4gICAgICAgIHBhbmVsLFxyXG4gICAgICAgIG5ldyBOb2RlKCB7XHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBpbmZvQnV0dG9uLFxyXG4gICAgICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgICAgICB6b29tT3V0QnV0dG9uLFxyXG4gICAgICAgICAgICAgICAgem9vbUluQnV0dG9uXHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICByaWdodDogcGFuZWwucmlnaHRcclxuICAgICAgICAgICAgfSApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggbmV3IEFsaWduQm94KCBib3hDb250ZW50LCB7IGdyb3VwOiBQZW5kdWx1bUxhYkNvbnN0YW50cy5MRUZUX0NPTlRFTlRfQUxJR05fR1JPVVAgfSApLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5wZW5kdWx1bUxhYi5yZWdpc3RlciggJ0VuZXJneUdyYXBoQWNjb3JkaW9uQm94JywgRW5lcmd5R3JhcGhBY2NvcmRpb25Cb3ggKTtcclxuZXhwb3J0IGRlZmF1bHQgRW5lcmd5R3JhcGhBY2NvcmRpb25Cb3g7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFlBQVksTUFBTSx3Q0FBd0M7QUFDakUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLFVBQVUsTUFBTSxtREFBbUQ7QUFDMUUsT0FBT0MsdUJBQXVCLE1BQU0sZ0VBQWdFO0FBQ3BHLE9BQU9DLFVBQVUsTUFBTSxtREFBbUQ7QUFDMUUsU0FBU0MsUUFBUSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3BGLE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FB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