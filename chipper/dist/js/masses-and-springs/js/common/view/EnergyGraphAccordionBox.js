// Copyright 2017-2022, University of Colorado Boulder

/**
 * Bar graph that represents the kinetic, potential, elastic potential, thermal, and total energy of the mass attached
 * to our spring system. This is a qualitative graph with x-axis labels, a legend, and zoom in/out functionality.
 * When a bar exceeds the y-axis an arrow is shown to indicate continuous growth.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import BarChartNode from '../../../../griddle/js/BarChartNode.js';
import merge from '../../../../phet-core/js/merge.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import MoveToTrashLegendButton from '../../../../scenery-phet/js/buttons/MoveToTrashLegendButton.js';
import ZoomButton from '../../../../scenery-phet/js/buttons/ZoomButton.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, AlignGroup, Color, HBox, HStrut, Node, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import ColorConstants from '../../../../sun/js/ColorConstants.js';
import Dialog from '../../../../sun/js/Dialog.js';
import massesAndSprings from '../../massesAndSprings.js';
import MassesAndSpringsStrings from '../../MassesAndSpringsStrings.js';
import MassesAndSpringsConstants from '../MassesAndSpringsConstants.js';

// constants
const LEGEND_DESCRIPTION_MAX_WIDTH = 500;
const MAX_WIDTH = 100;
const ORANGE_COLOR = '#ee6f3e';
const elasticPotentialEnergyString = MassesAndSpringsStrings.elasticPotentialEnergy;
const energyGraphString = MassesAndSpringsStrings.energyGraph;
const energyLegendString = MassesAndSpringsStrings.energyLegend;
const eThermString = MassesAndSpringsStrings.eTherm;
const eTotString = MassesAndSpringsStrings.eTot;
const gravitationalPotentialEnergyString = MassesAndSpringsStrings.gravitationalPotentialEnergy;
const keString = MassesAndSpringsStrings.ke;
const kineticEnergyString = MassesAndSpringsStrings.kineticEnergy;
const peElasString = MassesAndSpringsStrings.peElas;
const peGravString = MassesAndSpringsStrings.peGrav;
const thermalEnergyString = MassesAndSpringsStrings.thermalEnergy;
const totalEnergyString = MassesAndSpringsStrings.totalEnergy;
class EnergyGraphAccordionBox extends AccordionBox {
  /**
   * @param {MassesAndSpringsModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    // Responsible for the zoom level in the bar graph.
    // This is adjusted by the zoom buttons and used for the scaling Property of the barNodes.
    const zoomLevelProperty = new NumberProperty(3);

    // Creation of zoom in/out buttons
    const zoomButtonOptions = {
      baseColor: ColorConstants.LIGHT_BLUE,
      xMargin: 8,
      yMargin: 4,
      magnifyingGlassOptions: {
        glassRadius: 7
      },
      touchAreaXDilation: 5,
      touchAreaYDilation: 5
    };
    const zoomInButton = new ZoomButton(merge({
      in: true
    }, zoomButtonOptions));
    const zoomOutButton = new ZoomButton(merge({
      in: false
    }, zoomButtonOptions));

    // Zooming out means bars and zoom level gets smaller.
    zoomOutButton.addListener(() => {
      zoomLevelProperty.value -= 1;
    });

    // Zooming in means bars and zoom level gets larger.
    zoomInButton.addListener(() => {
      zoomLevelProperty.value += 1;
    });

    // {Property.<number>} Responsible for adjusting the scaling of the barNode heights.
    const scaleFactorProperty = new DerivedProperty([zoomLevelProperty], zoomLevel => Math.pow(2, zoomLevel) * 20);
    const clearThermalButton = new MoveToTrashLegendButton({
      arrowColor: ORANGE_COLOR,
      listener: () => {
        // We are setting a new initial total energy here because the thermal energy bar acts as if the system has
        // been reset. Thermal energy is the only value that is dependent on initial total energy.
        const mass = model.firstSpring.massAttachedProperty.get();
        if (mass) {
          mass.initialTotalEnergyProperty.set(mass.kineticEnergyProperty.get() + mass.gravitationalPotentialEnergyProperty.get() + mass.elasticPotentialEnergyProperty.get());
        }
      },
      scale: 0.7
    });

    // Link exists for sim duration. No need to unlink.
    model.firstSpring.thermalEnergyProperty.link(value => {
      clearThermalButton.enabled = value > 0;
      clearThermalButton.pickable = value > 0;
    });
    const aEntry = {
      property: model.firstSpring.kineticEnergyProperty,
      color: PhetColorScheme.KINETIC_ENERGY
    };
    const bEntry = {
      property: model.firstSpring.gravitationalPotentialEnergyProperty,
      color: PhetColorScheme.GRAVITATIONAL_POTENTIAL_ENERGY
    };
    const cEntry = {
      property: model.firstSpring.elasticPotentialEnergyProperty,
      color: PhetColorScheme.ELASTIC_POTENTIAL_ENERGY
    };
    const dEntry = {
      property: model.firstSpring.thermalEnergyProperty,
      color: PhetColorScheme.HEAT_THERMAL_ENERGY
    };
    const barChartNode = new BarChartNode([{
      entries: [aEntry],
      labelString: keString
    }, {
      entries: [bEntry],
      labelString: peGravString
    }, {
      entries: [cEntry],
      labelString: peElasString
    }, {
      entries: [dEntry],
      labelString: eThermString,
      labelNode: clearThermalButton
    }, {
      entries: [aEntry, bEntry, cEntry, dEntry],
      labelString: eTotString
    }], new Property(new Range(-75, 435)), {
      barOptions: {
        totalRange: new Range(0, 380),
        scaleProperty: scaleFactorProperty,
        xAxisOptions: {
          stroke: 'black',
          minPadding: 3,
          maxExtension: 4
        },
        barWidth: 18
      },
      labelBackgroundColor: new Color(255, 255, 255, 0.7),
      barSpacing: 5
    });
    const abbreviationGroup = new AlignGroup();
    const descriptionGroup = new AlignGroup();
    const dialogContent = new VBox({
      spacing: 15,
      children: [{
        abbreviation: keString,
        description: kineticEnergyString,
        color: PhetColorScheme.KINETIC_ENERGY
      }, {
        abbreviation: peGravString,
        description: gravitationalPotentialEnergyString,
        color: PhetColorScheme.GRAVITATIONAL_POTENTIAL_ENERGY
      }, {
        abbreviation: peElasString,
        description: elasticPotentialEnergyString,
        color: PhetColorScheme.ELASTIC_POTENTIAL_ENERGY
      }, {
        abbreviation: eThermString,
        description: thermalEnergyString,
        color: PhetColorScheme.HEAT_THERMAL_ENERGY
      }, {
        abbreviation: eTotString,
        description: totalEnergyString,
        color: 'black'
      }].map(itemData => {
        return new HBox({
          spacing: 20,
          children: [new AlignBox(new HBox({
            children: [new Rectangle(0, 0, 13, 13, 0, 0, {
              fill: itemData.color,
              stroke: 'black'
            }), new RichText(itemData.abbreviation, {
              font: MassesAndSpringsConstants.LEGEND_ABBREVIATION_FONT,
              maxWidth: MAX_WIDTH
            })],
            spacing: 14
          }), {
            group: abbreviationGroup,
            xAlign: 'left'
          }), new AlignBox(new Text(itemData.description, {
            font: MassesAndSpringsConstants.LEGEND_DESCRIPTION_FONT
          }), {
            group: descriptionGroup,
            xAlign: 'left',
            maxWidth: LEGEND_DESCRIPTION_MAX_WIDTH
          })]
        });
      })
    });

    // a placeholder for the dialog - constructed lazily so that Dialog has access to
    // sim bounds
    let dialog = null;

    // Button that pops up dialog box for the graph's legend
    const infoButton = new InfoButton({
      maxHeight: 1.1 * zoomInButton.height,
      centerY: zoomOutButton.centerY,
      iconFill: 'rgb( 41, 106, 163 )',
      listener: () => {
        if (!dialog) {
          dialog = new Dialog(dialogContent, {
            ySpacing: 20,
            bottomMargin: 20,
            title: new Text(energyLegendString, {
              font: new PhetFont(28),
              maxWidth: MAX_WIDTH * 2
            })
          });
        }
        dialog.show();
      }
    });

    // Display buttons at the bottom of the graph
    const displayButtons = new HBox({
      spacing: 12,
      children: [infoButton, new HStrut(18), zoomOutButton, zoomInButton]
    });
    displayButtons.left = barChartNode.left;

    // Background for bar graph
    const background = new Rectangle(0, 0, 160, 520, {
      fill: 'white',
      stroke: 'gray',
      lineWidth: 0.8,
      // Empirically determined
      cornerRadius: 7
    });
    barChartNode.center = background.center.plusXY(0, 5);
    const chartNode = new Node({
      children: [background, barChartNode]
    });
    const accordionBoxContent = new VBox({
      children: [chartNode, displayButtons],
      spacing: 4
    });
    super(accordionBoxContent, {
      buttonYMargin: 4,
      cornerRadius: MassesAndSpringsConstants.PANEL_CORNER_RADIUS,
      titleNode: new Text(energyGraphString, {
        font: MassesAndSpringsConstants.TITLE_FONT,
        maxWidth: MAX_WIDTH + 40
      })
    });
    this.maxHeight = 720;

    // @private
    this.zoomLevelProperty = zoomLevelProperty;
    this.barChartNode = barChartNode;
  }

  /**
   * @public
   */
  reset() {
    this.zoomLevelProperty.reset();
    super.reset();
  }

  /**
   * @public
   */
  update() {
    this.barChartNode.update();
  }
}
massesAndSprings.register('EnergyGraphAccordionBox', EnergyGraphAccordionBox);
export default EnergyGraphAccordionBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiUmFuZ2UiLCJCYXJDaGFydE5vZGUiLCJtZXJnZSIsIkluZm9CdXR0b24iLCJNb3ZlVG9UcmFzaExlZ2VuZEJ1dHRvbiIsIlpvb21CdXR0b24iLCJQaGV0Q29sb3JTY2hlbWUiLCJQaGV0Rm9udCIsIkFsaWduQm94IiwiQWxpZ25Hcm91cCIsIkNvbG9yIiwiSEJveCIsIkhTdHJ1dCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlRleHQiLCJWQm94IiwiQWNjb3JkaW9uQm94IiwiQ29sb3JDb25zdGFudHMiLCJEaWFsb2ciLCJtYXNzZXNBbmRTcHJpbmdzIiwiTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MiLCJNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzIiwiTEVHRU5EX0RFU0NSSVBUSU9OX01BWF9XSURUSCIsIk1BWF9XSURUSCIsIk9SQU5HRV9DT0xPUiIsImVsYXN0aWNQb3RlbnRpYWxFbmVyZ3lTdHJpbmciLCJlbGFzdGljUG90ZW50aWFsRW5lcmd5IiwiZW5lcmd5R3JhcGhTdHJpbmciLCJlbmVyZ3lHcmFwaCIsImVuZXJneUxlZ2VuZFN0cmluZyIsImVuZXJneUxlZ2VuZCIsImVUaGVybVN0cmluZyIsImVUaGVybSIsImVUb3RTdHJpbmciLCJlVG90IiwiZ3Jhdml0YXRpb25hbFBvdGVudGlhbEVuZXJneVN0cmluZyIsImdyYXZpdGF0aW9uYWxQb3RlbnRpYWxFbmVyZ3kiLCJrZVN0cmluZyIsImtlIiwia2luZXRpY0VuZXJneVN0cmluZyIsImtpbmV0aWNFbmVyZ3kiLCJwZUVsYXNTdHJpbmciLCJwZUVsYXMiLCJwZUdyYXZTdHJpbmciLCJwZUdyYXYiLCJ0aGVybWFsRW5lcmd5U3RyaW5nIiwidGhlcm1hbEVuZXJneSIsInRvdGFsRW5lcmd5U3RyaW5nIiwidG90YWxFbmVyZ3kiLCJFbmVyZ3lHcmFwaEFjY29yZGlvbkJveCIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJ6b29tTGV2ZWxQcm9wZXJ0eSIsInpvb21CdXR0b25PcHRpb25zIiwiYmFzZUNvbG9yIiwiTElHSFRfQkxVRSIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibWFnbmlmeWluZ0dsYXNzT3B0aW9ucyIsImdsYXNzUmFkaXVzIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwiem9vbUluQnV0dG9uIiwiaW4iLCJ6b29tT3V0QnV0dG9uIiwiYWRkTGlzdGVuZXIiLCJ2YWx1ZSIsInNjYWxlRmFjdG9yUHJvcGVydHkiLCJ6b29tTGV2ZWwiLCJNYXRoIiwicG93IiwiY2xlYXJUaGVybWFsQnV0dG9uIiwiYXJyb3dDb2xvciIsImxpc3RlbmVyIiwibWFzcyIsImZpcnN0U3ByaW5nIiwibWFzc0F0dGFjaGVkUHJvcGVydHkiLCJnZXQiLCJpbml0aWFsVG90YWxFbmVyZ3lQcm9wZXJ0eSIsInNldCIsImtpbmV0aWNFbmVyZ3lQcm9wZXJ0eSIsImdyYXZpdGF0aW9uYWxQb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eSIsImVsYXN0aWNQb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eSIsInNjYWxlIiwidGhlcm1hbEVuZXJneVByb3BlcnR5IiwibGluayIsImVuYWJsZWQiLCJwaWNrYWJsZSIsImFFbnRyeSIsInByb3BlcnR5IiwiY29sb3IiLCJLSU5FVElDX0VORVJHWSIsImJFbnRyeSIsIkdSQVZJVEFUSU9OQUxfUE9URU5USUFMX0VORVJHWSIsImNFbnRyeSIsIkVMQVNUSUNfUE9URU5USUFMX0VORVJHWSIsImRFbnRyeSIsIkhFQVRfVEhFUk1BTF9FTkVSR1kiLCJiYXJDaGFydE5vZGUiLCJlbnRyaWVzIiwibGFiZWxTdHJpbmciLCJsYWJlbE5vZGUiLCJiYXJPcHRpb25zIiwidG90YWxSYW5nZSIsInNjYWxlUHJvcGVydHkiLCJ4QXhpc09wdGlvbnMiLCJzdHJva2UiLCJtaW5QYWRkaW5nIiwibWF4RXh0ZW5zaW9uIiwiYmFyV2lkdGgiLCJsYWJlbEJhY2tncm91bmRDb2xvciIsImJhclNwYWNpbmciLCJhYmJyZXZpYXRpb25Hcm91cCIsImRlc2NyaXB0aW9uR3JvdXAiLCJkaWFsb2dDb250ZW50Iiwic3BhY2luZyIsImNoaWxkcmVuIiwiYWJicmV2aWF0aW9uIiwiZGVzY3JpcHRpb24iLCJtYXAiLCJpdGVtRGF0YSIsImZpbGwiLCJmb250IiwiTEVHRU5EX0FCQlJFVklBVElPTl9GT05UIiwibWF4V2lkdGgiLCJncm91cCIsInhBbGlnbiIsIkxFR0VORF9ERVNDUklQVElPTl9GT05UIiwiZGlhbG9nIiwiaW5mb0J1dHRvbiIsIm1heEhlaWdodCIsImhlaWdodCIsImNlbnRlclkiLCJpY29uRmlsbCIsInlTcGFjaW5nIiwiYm90dG9tTWFyZ2luIiwidGl0bGUiLCJzaG93IiwiZGlzcGxheUJ1dHRvbnMiLCJsZWZ0IiwiYmFja2dyb3VuZCIsImxpbmVXaWR0aCIsImNvcm5lclJhZGl1cyIsImNlbnRlciIsInBsdXNYWSIsImNoYXJ0Tm9kZSIsImFjY29yZGlvbkJveENvbnRlbnQiLCJidXR0b25ZTWFyZ2luIiwiUEFORUxfQ09STkVSX1JBRElVUyIsInRpdGxlTm9kZSIsIlRJVExFX0ZPTlQiLCJyZXNldCIsInVwZGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW5lcmd5R3JhcGhBY2NvcmRpb25Cb3guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFyIGdyYXBoIHRoYXQgcmVwcmVzZW50cyB0aGUga2luZXRpYywgcG90ZW50aWFsLCBlbGFzdGljIHBvdGVudGlhbCwgdGhlcm1hbCwgYW5kIHRvdGFsIGVuZXJneSBvZiB0aGUgbWFzcyBhdHRhY2hlZFxyXG4gKiB0byBvdXIgc3ByaW5nIHN5c3RlbS4gVGhpcyBpcyBhIHF1YWxpdGF0aXZlIGdyYXBoIHdpdGggeC1heGlzIGxhYmVscywgYSBsZWdlbmQsIGFuZCB6b29tIGluL291dCBmdW5jdGlvbmFsaXR5LlxyXG4gKiBXaGVuIGEgYmFyIGV4Y2VlZHMgdGhlIHktYXhpcyBhbiBhcnJvdyBpcyBzaG93biB0byBpbmRpY2F0ZSBjb250aW51b3VzIGdyb3d0aC5cclxuICpcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IEJhckNoYXJ0Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9ncmlkZGxlL2pzL0JhckNoYXJ0Tm9kZS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgSW5mb0J1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9JbmZvQnV0dG9uLmpzJztcclxuaW1wb3J0IE1vdmVUb1RyYXNoTGVnZW5kQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL01vdmVUb1RyYXNoTGVnZW5kQnV0dG9uLmpzJztcclxuaW1wb3J0IFpvb21CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvWm9vbUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgQWxpZ25Hcm91cCwgQ29sb3IsIEhCb3gsIEhTdHJ1dCwgTm9kZSwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBDb2xvckNvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ29sb3JDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRGlhbG9nIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9EaWFsb2cuanMnO1xyXG5pbXBvcnQgbWFzc2VzQW5kU3ByaW5ncyBmcm9tICcuLi8uLi9tYXNzZXNBbmRTcHJpbmdzLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzIGZyb20gJy4uLy4uL01hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMgZnJvbSAnLi4vTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTEVHRU5EX0RFU0NSSVBUSU9OX01BWF9XSURUSCA9IDUwMDtcclxuY29uc3QgTUFYX1dJRFRIID0gMTAwO1xyXG5jb25zdCBPUkFOR0VfQ09MT1IgPSAnI2VlNmYzZSc7XHJcblxyXG5jb25zdCBlbGFzdGljUG90ZW50aWFsRW5lcmd5U3RyaW5nID0gTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MuZWxhc3RpY1BvdGVudGlhbEVuZXJneTtcclxuY29uc3QgZW5lcmd5R3JhcGhTdHJpbmcgPSBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5lbmVyZ3lHcmFwaDtcclxuY29uc3QgZW5lcmd5TGVnZW5kU3RyaW5nID0gTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MuZW5lcmd5TGVnZW5kO1xyXG5jb25zdCBlVGhlcm1TdHJpbmcgPSBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5lVGhlcm07XHJcbmNvbnN0IGVUb3RTdHJpbmcgPSBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5lVG90O1xyXG5jb25zdCBncmF2aXRhdGlvbmFsUG90ZW50aWFsRW5lcmd5U3RyaW5nID0gTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MuZ3Jhdml0YXRpb25hbFBvdGVudGlhbEVuZXJneTtcclxuY29uc3Qga2VTdHJpbmcgPSBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5rZTtcclxuY29uc3Qga2luZXRpY0VuZXJneVN0cmluZyA9IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLmtpbmV0aWNFbmVyZ3k7XHJcbmNvbnN0IHBlRWxhc1N0cmluZyA9IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLnBlRWxhcztcclxuY29uc3QgcGVHcmF2U3RyaW5nID0gTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MucGVHcmF2O1xyXG5jb25zdCB0aGVybWFsRW5lcmd5U3RyaW5nID0gTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MudGhlcm1hbEVuZXJneTtcclxuY29uc3QgdG90YWxFbmVyZ3lTdHJpbmcgPSBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy50b3RhbEVuZXJneTtcclxuXHJcbmNsYXNzIEVuZXJneUdyYXBoQWNjb3JkaW9uQm94IGV4dGVuZHMgQWNjb3JkaW9uQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYXNzZXNBbmRTcHJpbmdzTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIC8vIFJlc3BvbnNpYmxlIGZvciB0aGUgem9vbSBsZXZlbCBpbiB0aGUgYmFyIGdyYXBoLlxyXG4gICAgLy8gVGhpcyBpcyBhZGp1c3RlZCBieSB0aGUgem9vbSBidXR0b25zIGFuZCB1c2VkIGZvciB0aGUgc2NhbGluZyBQcm9wZXJ0eSBvZiB0aGUgYmFyTm9kZXMuXHJcbiAgICBjb25zdCB6b29tTGV2ZWxQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMyApO1xyXG5cclxuICAgIC8vIENyZWF0aW9uIG9mIHpvb20gaW4vb3V0IGJ1dHRvbnNcclxuICAgIGNvbnN0IHpvb21CdXR0b25PcHRpb25zID0ge1xyXG4gICAgICBiYXNlQ29sb3I6IENvbG9yQ29uc3RhbnRzLkxJR0hUX0JMVUUsXHJcbiAgICAgIHhNYXJnaW46IDgsXHJcbiAgICAgIHlNYXJnaW46IDQsXHJcbiAgICAgIG1hZ25pZnlpbmdHbGFzc09wdGlvbnM6IHtcclxuICAgICAgICBnbGFzc1JhZGl1czogN1xyXG4gICAgICB9LFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDUsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNVxyXG4gICAgfTtcclxuICAgIGNvbnN0IHpvb21JbkJ1dHRvbiA9IG5ldyBab29tQnV0dG9uKCBtZXJnZSggeyBpbjogdHJ1ZSB9LCB6b29tQnV0dG9uT3B0aW9ucyApICk7XHJcbiAgICBjb25zdCB6b29tT3V0QnV0dG9uID0gbmV3IFpvb21CdXR0b24oIG1lcmdlKCB7IGluOiBmYWxzZSB9LCB6b29tQnV0dG9uT3B0aW9ucyApICk7XHJcblxyXG4gICAgLy8gWm9vbWluZyBvdXQgbWVhbnMgYmFycyBhbmQgem9vbSBsZXZlbCBnZXRzIHNtYWxsZXIuXHJcbiAgICB6b29tT3V0QnV0dG9uLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHpvb21MZXZlbFByb3BlcnR5LnZhbHVlIC09IDE7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gWm9vbWluZyBpbiBtZWFucyBiYXJzIGFuZCB6b29tIGxldmVsIGdldHMgbGFyZ2VyLlxyXG4gICAgem9vbUluQnV0dG9uLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHpvb21MZXZlbFByb3BlcnR5LnZhbHVlICs9IDE7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8ge1Byb3BlcnR5LjxudW1iZXI+fSBSZXNwb25zaWJsZSBmb3IgYWRqdXN0aW5nIHRoZSBzY2FsaW5nIG9mIHRoZSBiYXJOb2RlIGhlaWdodHMuXHJcbiAgICBjb25zdCBzY2FsZUZhY3RvclByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB6b29tTGV2ZWxQcm9wZXJ0eSBdLFxyXG4gICAgICB6b29tTGV2ZWwgPT4gTWF0aC5wb3coIDIsIHpvb21MZXZlbCApICogMjAgKTtcclxuXHJcbiAgICBjb25zdCBjbGVhclRoZXJtYWxCdXR0b24gPSBuZXcgTW92ZVRvVHJhc2hMZWdlbmRCdXR0b24oIHtcclxuICAgICAgYXJyb3dDb2xvcjogT1JBTkdFX0NPTE9SLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBXZSBhcmUgc2V0dGluZyBhIG5ldyBpbml0aWFsIHRvdGFsIGVuZXJneSBoZXJlIGJlY2F1c2UgdGhlIHRoZXJtYWwgZW5lcmd5IGJhciBhY3RzIGFzIGlmIHRoZSBzeXN0ZW0gaGFzXHJcbiAgICAgICAgLy8gYmVlbiByZXNldC4gVGhlcm1hbCBlbmVyZ3kgaXMgdGhlIG9ubHkgdmFsdWUgdGhhdCBpcyBkZXBlbmRlbnQgb24gaW5pdGlhbCB0b3RhbCBlbmVyZ3kuXHJcbiAgICAgICAgY29uc3QgbWFzcyA9IG1vZGVsLmZpcnN0U3ByaW5nLm1hc3NBdHRhY2hlZFByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIGlmICggbWFzcyApIHtcclxuICAgICAgICAgIG1hc3MuaW5pdGlhbFRvdGFsRW5lcmd5UHJvcGVydHkuc2V0KCBtYXNzLmtpbmV0aWNFbmVyZ3lQcm9wZXJ0eS5nZXQoKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzcy5ncmF2aXRhdGlvbmFsUG90ZW50aWFsRW5lcmd5UHJvcGVydHkuZ2V0KCkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc3MuZWxhc3RpY1BvdGVudGlhbEVuZXJneVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBzY2FsZTogMC43XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTGluayBleGlzdHMgZm9yIHNpbSBkdXJhdGlvbi4gTm8gbmVlZCB0byB1bmxpbmsuXHJcbiAgICBtb2RlbC5maXJzdFNwcmluZy50aGVybWFsRW5lcmd5UHJvcGVydHkubGluayggdmFsdWUgPT4ge1xyXG4gICAgICBjbGVhclRoZXJtYWxCdXR0b24uZW5hYmxlZCA9ICggdmFsdWUgPiAwICk7XHJcbiAgICAgIGNsZWFyVGhlcm1hbEJ1dHRvbi5waWNrYWJsZSA9ICggdmFsdWUgPiAwICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYUVudHJ5ID0ge1xyXG4gICAgICBwcm9wZXJ0eTogbW9kZWwuZmlyc3RTcHJpbmcua2luZXRpY0VuZXJneVByb3BlcnR5LFxyXG4gICAgICBjb2xvcjogUGhldENvbG9yU2NoZW1lLktJTkVUSUNfRU5FUkdZXHJcbiAgICB9O1xyXG4gICAgY29uc3QgYkVudHJ5ID0ge1xyXG4gICAgICBwcm9wZXJ0eTogbW9kZWwuZmlyc3RTcHJpbmcuZ3Jhdml0YXRpb25hbFBvdGVudGlhbEVuZXJneVByb3BlcnR5LFxyXG4gICAgICBjb2xvcjogUGhldENvbG9yU2NoZW1lLkdSQVZJVEFUSU9OQUxfUE9URU5USUFMX0VORVJHWVxyXG4gICAgfTtcclxuICAgIGNvbnN0IGNFbnRyeSA9IHtcclxuICAgICAgcHJvcGVydHk6IG1vZGVsLmZpcnN0U3ByaW5nLmVsYXN0aWNQb3RlbnRpYWxFbmVyZ3lQcm9wZXJ0eSxcclxuICAgICAgY29sb3I6IFBoZXRDb2xvclNjaGVtZS5FTEFTVElDX1BPVEVOVElBTF9FTkVSR1lcclxuICAgIH07XHJcbiAgICBjb25zdCBkRW50cnkgPSB7XHJcbiAgICAgIHByb3BlcnR5OiBtb2RlbC5maXJzdFNwcmluZy50aGVybWFsRW5lcmd5UHJvcGVydHksXHJcbiAgICAgIGNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuSEVBVF9USEVSTUFMX0VORVJHWVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBiYXJDaGFydE5vZGUgPSBuZXcgQmFyQ2hhcnROb2RlKCBbXHJcbiAgICAgIHtcclxuICAgICAgICBlbnRyaWVzOiBbIGFFbnRyeSBdLFxyXG4gICAgICAgIGxhYmVsU3RyaW5nOiBrZVN0cmluZ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZW50cmllczogWyBiRW50cnkgXSxcclxuICAgICAgICBsYWJlbFN0cmluZzogcGVHcmF2U3RyaW5nXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBlbnRyaWVzOiBbIGNFbnRyeSBdLFxyXG4gICAgICAgIGxhYmVsU3RyaW5nOiBwZUVsYXNTdHJpbmdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGVudHJpZXM6IFsgZEVudHJ5IF0sXHJcbiAgICAgICAgbGFiZWxTdHJpbmc6IGVUaGVybVN0cmluZyxcclxuICAgICAgICBsYWJlbE5vZGU6IGNsZWFyVGhlcm1hbEJ1dHRvblxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZW50cmllczogWyBhRW50cnksIGJFbnRyeSwgY0VudHJ5LCBkRW50cnkgXSxcclxuICAgICAgICBsYWJlbFN0cmluZzogZVRvdFN0cmluZ1xyXG4gICAgICB9XHJcbiAgICBdLCBuZXcgUHJvcGVydHkoIG5ldyBSYW5nZSggLTc1LCA0MzUgKSApLCB7XHJcbiAgICAgIGJhck9wdGlvbnM6IHtcclxuICAgICAgICB0b3RhbFJhbmdlOiBuZXcgUmFuZ2UoIDAsIDM4MCApLFxyXG4gICAgICAgIHNjYWxlUHJvcGVydHk6IHNjYWxlRmFjdG9yUHJvcGVydHksXHJcbiAgICAgICAgeEF4aXNPcHRpb25zOiB7XHJcbiAgICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgICBtaW5QYWRkaW5nOiAzLFxyXG4gICAgICAgICAgbWF4RXh0ZW5zaW9uOiA0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiYXJXaWR0aDogMThcclxuICAgICAgfSxcclxuICAgICAgbGFiZWxCYWNrZ3JvdW5kQ29sb3I6IG5ldyBDb2xvciggMjU1LCAyNTUsIDI1NSwgMC43ICksXHJcbiAgICAgIGJhclNwYWNpbmc6IDVcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBhYmJyZXZpYXRpb25Hcm91cCA9IG5ldyBBbGlnbkdyb3VwKCk7XHJcbiAgICBjb25zdCBkZXNjcmlwdGlvbkdyb3VwID0gbmV3IEFsaWduR3JvdXAoKTtcclxuXHJcbiAgICBjb25zdCBkaWFsb2dDb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogMTUsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgYWJicmV2aWF0aW9uOiBrZVN0cmluZyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBraW5ldGljRW5lcmd5U3RyaW5nLFxyXG4gICAgICAgICAgY29sb3I6IFBoZXRDb2xvclNjaGVtZS5LSU5FVElDX0VORVJHWVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgYWJicmV2aWF0aW9uOiBwZUdyYXZTdHJpbmcsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZ3Jhdml0YXRpb25hbFBvdGVudGlhbEVuZXJneVN0cmluZyxcclxuICAgICAgICAgIGNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuR1JBVklUQVRJT05BTF9QT1RFTlRJQUxfRU5FUkdZXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgYWJicmV2aWF0aW9uOiBwZUVsYXNTdHJpbmcsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZWxhc3RpY1BvdGVudGlhbEVuZXJneVN0cmluZyxcclxuICAgICAgICAgIGNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuRUxBU1RJQ19QT1RFTlRJQUxfRU5FUkdZXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgYWJicmV2aWF0aW9uOiBlVGhlcm1TdHJpbmcsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogdGhlcm1hbEVuZXJneVN0cmluZyxcclxuICAgICAgICAgIGNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuSEVBVF9USEVSTUFMX0VORVJHWVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIGFiYnJldmlhdGlvbjogZVRvdFN0cmluZyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiB0b3RhbEVuZXJneVN0cmluZyxcclxuICAgICAgICAgIGNvbG9yOiAnYmxhY2snXHJcbiAgICAgICAgfVxyXG4gICAgICBdLm1hcCggaXRlbURhdGEgPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgSEJveCgge1xyXG4gICAgICAgICAgc3BhY2luZzogMjAsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgQWxpZ25Cb3goIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgICAgIG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEzLCAxMywgMCwgMCwge1xyXG4gICAgICAgICAgICAgICAgICBmaWxsOiBpdGVtRGF0YS5jb2xvcixcclxuICAgICAgICAgICAgICAgICAgc3Ryb2tlOiAnYmxhY2snXHJcbiAgICAgICAgICAgICAgICB9ICksXHJcbiAgICAgICAgICAgICAgICBuZXcgUmljaFRleHQoIGl0ZW1EYXRhLmFiYnJldmlhdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgICBmb250OiBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLkxFR0VORF9BQkJSRVZJQVRJT05fRk9OVCxcclxuICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6IE1BWF9XSURUSFxyXG4gICAgICAgICAgICAgICAgfSApXHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICBzcGFjaW5nOiAxNFxyXG4gICAgICAgICAgICB9ICksIHtcclxuICAgICAgICAgICAgICBncm91cDogYWJicmV2aWF0aW9uR3JvdXAsXHJcbiAgICAgICAgICAgICAgeEFsaWduOiAnbGVmdCdcclxuICAgICAgICAgICAgfSApLFxyXG4gICAgICAgICAgICBuZXcgQWxpZ25Cb3goIG5ldyBUZXh0KCBpdGVtRGF0YS5kZXNjcmlwdGlvbiwge1xyXG4gICAgICAgICAgICAgIGZvbnQ6IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuTEVHRU5EX0RFU0NSSVBUSU9OX0ZPTlRcclxuICAgICAgICAgICAgfSApLCB7XHJcbiAgICAgICAgICAgICAgZ3JvdXA6IGRlc2NyaXB0aW9uR3JvdXAsXHJcbiAgICAgICAgICAgICAgeEFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgICAgICAgbWF4V2lkdGg6IExFR0VORF9ERVNDUklQVElPTl9NQVhfV0lEVEhcclxuICAgICAgICAgICAgfSApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9IClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhIHBsYWNlaG9sZGVyIGZvciB0aGUgZGlhbG9nIC0gY29uc3RydWN0ZWQgbGF6aWx5IHNvIHRoYXQgRGlhbG9nIGhhcyBhY2Nlc3MgdG9cclxuICAgIC8vIHNpbSBib3VuZHNcclxuICAgIGxldCBkaWFsb2cgPSBudWxsO1xyXG5cclxuICAgIC8vIEJ1dHRvbiB0aGF0IHBvcHMgdXAgZGlhbG9nIGJveCBmb3IgdGhlIGdyYXBoJ3MgbGVnZW5kXHJcbiAgICBjb25zdCBpbmZvQnV0dG9uID0gbmV3IEluZm9CdXR0b24oIHtcclxuICAgICAgbWF4SGVpZ2h0OiAxLjEgKiB6b29tSW5CdXR0b24uaGVpZ2h0LFxyXG4gICAgICBjZW50ZXJZOiB6b29tT3V0QnV0dG9uLmNlbnRlclksXHJcbiAgICAgIGljb25GaWxsOiAncmdiKCA0MSwgMTA2LCAxNjMgKScsXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCAhZGlhbG9nICkge1xyXG4gICAgICAgICAgZGlhbG9nID0gbmV3IERpYWxvZyggZGlhbG9nQ29udGVudCwge1xyXG4gICAgICAgICAgICB5U3BhY2luZzogMjAsXHJcbiAgICAgICAgICAgIGJvdHRvbU1hcmdpbjogMjAsXHJcbiAgICAgICAgICAgIHRpdGxlOiBuZXcgVGV4dCggZW5lcmd5TGVnZW5kU3RyaW5nLCB7XHJcbiAgICAgICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyOCApLFxyXG4gICAgICAgICAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEggKiAyXHJcbiAgICAgICAgICAgIH0gKVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGlhbG9nLnNob3coKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERpc3BsYXkgYnV0dG9ucyBhdCB0aGUgYm90dG9tIG9mIHRoZSBncmFwaFxyXG4gICAgY29uc3QgZGlzcGxheUJ1dHRvbnMgPSBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxMixcclxuICAgICAgY2hpbGRyZW46IFsgaW5mb0J1dHRvbiwgbmV3IEhTdHJ1dCggMTggKSwgem9vbU91dEJ1dHRvbiwgem9vbUluQnV0dG9uIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBkaXNwbGF5QnV0dG9ucy5sZWZ0ID0gYmFyQ2hhcnROb2RlLmxlZnQ7XHJcblxyXG4gICAgLy8gQmFja2dyb3VuZCBmb3IgYmFyIGdyYXBoXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTYwLCA1MjAsIHtcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnZ3JheScsXHJcbiAgICAgIGxpbmVXaWR0aDogMC44LCAvLyBFbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgIGNvcm5lclJhZGl1czogN1xyXG4gICAgfSApO1xyXG4gICAgYmFyQ2hhcnROb2RlLmNlbnRlciA9IGJhY2tncm91bmQuY2VudGVyLnBsdXNYWSggMCwgNSApO1xyXG5cclxuICAgIGNvbnN0IGNoYXJ0Tm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGJhY2tncm91bmQsIGJhckNoYXJ0Tm9kZSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYWNjb3JkaW9uQm94Q29udGVudCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgY2hhcnROb2RlLFxyXG4gICAgICAgIGRpc3BsYXlCdXR0b25zXHJcbiAgICAgIF0sIHNwYWNpbmc6IDRcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggYWNjb3JkaW9uQm94Q29udGVudCwge1xyXG4gICAgICBidXR0b25ZTWFyZ2luOiA0LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuUEFORUxfQ09STkVSX1JBRElVUyxcclxuICAgICAgdGl0bGVOb2RlOiBuZXcgVGV4dCggZW5lcmd5R3JhcGhTdHJpbmcsIHsgZm9udDogTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5USVRMRV9GT05ULCBtYXhXaWR0aDogTUFYX1dJRFRIICsgNDAgfSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tYXhIZWlnaHQgPSA3MjA7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuem9vbUxldmVsUHJvcGVydHkgPSB6b29tTGV2ZWxQcm9wZXJ0eTtcclxuICAgIHRoaXMuYmFyQ2hhcnROb2RlID0gYmFyQ2hhcnROb2RlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy56b29tTGV2ZWxQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB1cGRhdGUoKSB7XHJcbiAgICB0aGlzLmJhckNoYXJ0Tm9kZS51cGRhdGUoKTtcclxuICB9XHJcbn1cclxuXHJcbm1hc3Nlc0FuZFNwcmluZ3MucmVnaXN0ZXIoICdFbmVyZ3lHcmFwaEFjY29yZGlvbkJveCcsIEVuZXJneUdyYXBoQWNjb3JkaW9uQm94ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEVuZXJneUdyYXBoQWNjb3JkaW9uQm94OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxZQUFZLE1BQU0sd0NBQXdDO0FBQ2pFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsVUFBVSxNQUFNLG1EQUFtRDtBQUMxRSxPQUFPQyx1QkFBdUIsTUFBTSxnRUFBZ0U7QUFDcEcsT0FBT0MsVUFBVSxNQUFNLG1EQUFtRDtBQUMxRSxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsUUFBUSxFQUFFQyxVQUFVLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNwSSxPQUFPQyxZQUFZLE1BQU0sb0NBQW9DO0FBQzdELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBQ3RFLE9BQU9DLHlCQUF5QixNQUFNLGlDQUFp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