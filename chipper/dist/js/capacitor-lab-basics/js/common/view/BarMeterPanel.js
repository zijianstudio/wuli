// Copyright 2015-2022, University of Colorado Boulder

/**
 * Panel which holds the bar meters and associated checkboxes which control bar meter visibility.
 *
 * This panel uses several layout boxes to achieve the desired alignment.  The meter value nodes are aligned to the
 * right while the bar meters are aligned to the left.  The checkboxes are also aligned to the left.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import capacitorLabBasics from '../../capacitorLabBasics.js';
import CapacitorLabBasicsStrings from '../../CapacitorLabBasicsStrings.js';
import CLBConstants from '../CLBConstants.js';
import BarMeterNode from './meters/BarMeterNode.js';
import PlateChargeBarMeterNode from './meters/PlateChargeBarMeterNode.js';

// constants
const CHECKBOX_VERTICAL_SPACING = 28;
const VALUE_FONT = new PhetFont(16);
const VALUE_COLOR = 'black';
const capacitanceString = CapacitorLabBasicsStrings.capacitance;
const picoCoulombsPatternString = CapacitorLabBasicsStrings.picoCoulombsPattern;
const picoFaradsPatternString = CapacitorLabBasicsStrings.picoFaradsPattern;
const picoJoulesPatternString = CapacitorLabBasicsStrings.picoJoulesPattern;
const storedEnergyString = CapacitorLabBasicsStrings.storedEnergy;
const topPlateChargeString = CapacitorLabBasicsStrings.topPlateCharge;
class BarMeterPanel extends Panel {
  /**
   * @param {CLBLightBulbModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    const minWidth = 580;
    const parentNode = new Node(); // node that will contain all checkboxes and bar meter nodes

    // create the bar meter nodes with their text values.
    const meterNodes = new Node();
    const capacitanceMeterNode = new BarMeterNode(model.capacitanceMeter, CLBConstants.CAPACITANCE_COLOR, CLBConstants.CAPACITANCE_METER_MAX_VALUE, picoFaradsPatternString, capacitanceString, tandem.createTandem('capacitanceMeterNode'));
    const plateChargeMeterNode = new PlateChargeBarMeterNode(model.plateChargeMeter, CLBConstants.POSITIVE_CHARGE_COLOR, CLBConstants.PLATE_CHARGE_METER_MAX_VALUE, picoCoulombsPatternString, topPlateChargeString, tandem.createTandem('plateChargeMeterNode'));
    const storedEnergyMeterNode = new BarMeterNode(model.storedEnergyMeter, CLBConstants.STORED_ENERGY_COLOR, CLBConstants.STORED_ENERGY_METER_MAX_VALUE, picoJoulesPatternString, storedEnergyString, tandem.createTandem('storedEnergyMeterNode'));
    meterNodes.children = [capacitanceMeterNode, plateChargeMeterNode, storedEnergyMeterNode];

    // create checkboxes for each meter node
    const checkboxNodes = new Node();

    // Settings for title strings
    const fontOptions = {
      font: VALUE_FONT,
      fill: VALUE_COLOR,
      maxWidth: 120
    };
    const capacitanceLabel = new Text(capacitanceString, fontOptions);
    const capacitanceCheckbox = new Checkbox(model.capacitanceMeterVisibleProperty, capacitanceLabel, {
      tandem: tandem.createTandem('capacitanceCheckbox')
    });
    const topPlateChargeLabel = new Text(topPlateChargeString, fontOptions);
    const topPlateChargeCheckbox = new Checkbox(model.topPlateChargeMeterVisibleProperty, topPlateChargeLabel, {
      tandem: tandem.createTandem('topPlateChargeCheckbox')
    });
    const storedEnergyLabel = new Text(storedEnergyString, fontOptions);
    const storedEnergyCheckbox = new Checkbox(model.storedEnergyMeterVisibleProperty, storedEnergyLabel, {
      tandem: tandem.createTandem('storedEnergyCheckbox')
    });
    checkboxNodes.children = [capacitanceCheckbox, topPlateChargeCheckbox, storedEnergyCheckbox];
    parentNode.children = [checkboxNodes, meterNodes];

    // layout
    // checkboxes aligned vertically, centered left
    capacitanceCheckbox.translation = new Vector2(0, 0);
    topPlateChargeCheckbox.translation = new Vector2(0, CHECKBOX_VERTICAL_SPACING);
    storedEnergyCheckbox.translation = new Vector2(0, 2 * CHECKBOX_VERTICAL_SPACING);

    // The BarMeterNodes have a common x-coordinate
    const x = 0.44 * minWidth;
    let y = capacitanceCheckbox.centerY;
    capacitanceMeterNode.axisLine.translation = new Vector2(x, y);
    y = topPlateChargeCheckbox.centerY;
    plateChargeMeterNode.axisLine.translation = new Vector2(x, y);
    y = storedEnergyCheckbox.centerY;
    storedEnergyMeterNode.axisLine.translation = new Vector2(x, y);
    super(parentNode, {
      fill: CLBConstants.METER_PANEL_FILL,
      minWidth: minWidth,
      align: 'left',
      xMargin: 10,
      yMargin: 10,
      resize: false,
      tandem: tandem
    });

    // link visibility to the model property
    model.barGraphsVisibleProperty.link(barGraphsPanelVisible => {
      this.visible = barGraphsPanelVisible;
    });
  }
}
capacitorLabBasics.register('BarMeterPanel', BarMeterPanel);
export default BarMeterPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiUGhldEZvbnQiLCJOb2RlIiwiVGV4dCIsIkNoZWNrYm94IiwiUGFuZWwiLCJjYXBhY2l0b3JMYWJCYXNpY3MiLCJDYXBhY2l0b3JMYWJCYXNpY3NTdHJpbmdzIiwiQ0xCQ29uc3RhbnRzIiwiQmFyTWV0ZXJOb2RlIiwiUGxhdGVDaGFyZ2VCYXJNZXRlck5vZGUiLCJDSEVDS0JPWF9WRVJUSUNBTF9TUEFDSU5HIiwiVkFMVUVfRk9OVCIsIlZBTFVFX0NPTE9SIiwiY2FwYWNpdGFuY2VTdHJpbmciLCJjYXBhY2l0YW5jZSIsInBpY29Db3Vsb21ic1BhdHRlcm5TdHJpbmciLCJwaWNvQ291bG9tYnNQYXR0ZXJuIiwicGljb0ZhcmFkc1BhdHRlcm5TdHJpbmciLCJwaWNvRmFyYWRzUGF0dGVybiIsInBpY29Kb3VsZXNQYXR0ZXJuU3RyaW5nIiwicGljb0pvdWxlc1BhdHRlcm4iLCJzdG9yZWRFbmVyZ3lTdHJpbmciLCJzdG9yZWRFbmVyZ3kiLCJ0b3BQbGF0ZUNoYXJnZVN0cmluZyIsInRvcFBsYXRlQ2hhcmdlIiwiQmFyTWV0ZXJQYW5lbCIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJtaW5XaWR0aCIsInBhcmVudE5vZGUiLCJtZXRlck5vZGVzIiwiY2FwYWNpdGFuY2VNZXRlck5vZGUiLCJjYXBhY2l0YW5jZU1ldGVyIiwiQ0FQQUNJVEFOQ0VfQ09MT1IiLCJDQVBBQ0lUQU5DRV9NRVRFUl9NQVhfVkFMVUUiLCJjcmVhdGVUYW5kZW0iLCJwbGF0ZUNoYXJnZU1ldGVyTm9kZSIsInBsYXRlQ2hhcmdlTWV0ZXIiLCJQT1NJVElWRV9DSEFSR0VfQ09MT1IiLCJQTEFURV9DSEFSR0VfTUVURVJfTUFYX1ZBTFVFIiwic3RvcmVkRW5lcmd5TWV0ZXJOb2RlIiwic3RvcmVkRW5lcmd5TWV0ZXIiLCJTVE9SRURfRU5FUkdZX0NPTE9SIiwiU1RPUkVEX0VORVJHWV9NRVRFUl9NQVhfVkFMVUUiLCJjaGlsZHJlbiIsImNoZWNrYm94Tm9kZXMiLCJmb250T3B0aW9ucyIsImZvbnQiLCJmaWxsIiwibWF4V2lkdGgiLCJjYXBhY2l0YW5jZUxhYmVsIiwiY2FwYWNpdGFuY2VDaGVja2JveCIsImNhcGFjaXRhbmNlTWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJ0b3BQbGF0ZUNoYXJnZUxhYmVsIiwidG9wUGxhdGVDaGFyZ2VDaGVja2JveCIsInRvcFBsYXRlQ2hhcmdlTWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJzdG9yZWRFbmVyZ3lMYWJlbCIsInN0b3JlZEVuZXJneUNoZWNrYm94Iiwic3RvcmVkRW5lcmd5TWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJ0cmFuc2xhdGlvbiIsIngiLCJ5IiwiY2VudGVyWSIsImF4aXNMaW5lIiwiTUVURVJfUEFORUxfRklMTCIsImFsaWduIiwieE1hcmdpbiIsInlNYXJnaW4iLCJyZXNpemUiLCJiYXJHcmFwaHNWaXNpYmxlUHJvcGVydHkiLCJsaW5rIiwiYmFyR3JhcGhzUGFuZWxWaXNpYmxlIiwidmlzaWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFyTWV0ZXJQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQYW5lbCB3aGljaCBob2xkcyB0aGUgYmFyIG1ldGVycyBhbmQgYXNzb2NpYXRlZCBjaGVja2JveGVzIHdoaWNoIGNvbnRyb2wgYmFyIG1ldGVyIHZpc2liaWxpdHkuXHJcbiAqXHJcbiAqIFRoaXMgcGFuZWwgdXNlcyBzZXZlcmFsIGxheW91dCBib3hlcyB0byBhY2hpZXZlIHRoZSBkZXNpcmVkIGFsaWdubWVudC4gIFRoZSBtZXRlciB2YWx1ZSBub2RlcyBhcmUgYWxpZ25lZCB0byB0aGVcclxuICogcmlnaHQgd2hpbGUgdGhlIGJhciBtZXRlcnMgYXJlIGFsaWduZWQgdG8gdGhlIGxlZnQuICBUaGUgY2hlY2tib3hlcyBhcmUgYWxzbyBhbGlnbmVkIHRvIHRoZSBsZWZ0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmUgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IGNhcGFjaXRvckxhYkJhc2ljcyBmcm9tICcuLi8uLi9jYXBhY2l0b3JMYWJCYXNpY3MuanMnO1xyXG5pbXBvcnQgQ2FwYWNpdG9yTGFiQmFzaWNzU3RyaW5ncyBmcm9tICcuLi8uLi9DYXBhY2l0b3JMYWJCYXNpY3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IENMQkNvbnN0YW50cyBmcm9tICcuLi9DTEJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQmFyTWV0ZXJOb2RlIGZyb20gJy4vbWV0ZXJzL0Jhck1ldGVyTm9kZS5qcyc7XHJcbmltcG9ydCBQbGF0ZUNoYXJnZUJhck1ldGVyTm9kZSBmcm9tICcuL21ldGVycy9QbGF0ZUNoYXJnZUJhck1ldGVyTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ0hFQ0tCT1hfVkVSVElDQUxfU1BBQ0lORyA9IDI4O1xyXG5jb25zdCBWQUxVRV9GT05UID0gbmV3IFBoZXRGb250KCAxNiApO1xyXG5jb25zdCBWQUxVRV9DT0xPUiA9ICdibGFjayc7XHJcblxyXG5jb25zdCBjYXBhY2l0YW5jZVN0cmluZyA9IENhcGFjaXRvckxhYkJhc2ljc1N0cmluZ3MuY2FwYWNpdGFuY2U7XHJcbmNvbnN0IHBpY29Db3Vsb21ic1BhdHRlcm5TdHJpbmcgPSBDYXBhY2l0b3JMYWJCYXNpY3NTdHJpbmdzLnBpY29Db3Vsb21ic1BhdHRlcm47XHJcbmNvbnN0IHBpY29GYXJhZHNQYXR0ZXJuU3RyaW5nID0gQ2FwYWNpdG9yTGFiQmFzaWNzU3RyaW5ncy5waWNvRmFyYWRzUGF0dGVybjtcclxuY29uc3QgcGljb0pvdWxlc1BhdHRlcm5TdHJpbmcgPSBDYXBhY2l0b3JMYWJCYXNpY3NTdHJpbmdzLnBpY29Kb3VsZXNQYXR0ZXJuO1xyXG5jb25zdCBzdG9yZWRFbmVyZ3lTdHJpbmcgPSBDYXBhY2l0b3JMYWJCYXNpY3NTdHJpbmdzLnN0b3JlZEVuZXJneTtcclxuY29uc3QgdG9wUGxhdGVDaGFyZ2VTdHJpbmcgPSBDYXBhY2l0b3JMYWJCYXNpY3NTdHJpbmdzLnRvcFBsYXRlQ2hhcmdlO1xyXG5cclxuY2xhc3MgQmFyTWV0ZXJQYW5lbCBleHRlbmRzIFBhbmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDTEJMaWdodEJ1bGJNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3QgbWluV2lkdGggPSA1ODA7XHJcblxyXG4gICAgY29uc3QgcGFyZW50Tm9kZSA9IG5ldyBOb2RlKCk7IC8vIG5vZGUgdGhhdCB3aWxsIGNvbnRhaW4gYWxsIGNoZWNrYm94ZXMgYW5kIGJhciBtZXRlciBub2Rlc1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgYmFyIG1ldGVyIG5vZGVzIHdpdGggdGhlaXIgdGV4dCB2YWx1ZXMuXHJcbiAgICBjb25zdCBtZXRlck5vZGVzID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICBjb25zdCBjYXBhY2l0YW5jZU1ldGVyTm9kZSA9IG5ldyBCYXJNZXRlck5vZGUoXHJcbiAgICAgIG1vZGVsLmNhcGFjaXRhbmNlTWV0ZXIsXHJcbiAgICAgIENMQkNvbnN0YW50cy5DQVBBQ0lUQU5DRV9DT0xPUixcclxuICAgICAgQ0xCQ29uc3RhbnRzLkNBUEFDSVRBTkNFX01FVEVSX01BWF9WQUxVRSxcclxuICAgICAgcGljb0ZhcmFkc1BhdHRlcm5TdHJpbmcsXHJcbiAgICAgIGNhcGFjaXRhbmNlU3RyaW5nLFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2FwYWNpdGFuY2VNZXRlck5vZGUnICkgKTtcclxuXHJcbiAgICBjb25zdCBwbGF0ZUNoYXJnZU1ldGVyTm9kZSA9IG5ldyBQbGF0ZUNoYXJnZUJhck1ldGVyTm9kZShcclxuICAgICAgbW9kZWwucGxhdGVDaGFyZ2VNZXRlcixcclxuICAgICAgQ0xCQ29uc3RhbnRzLlBPU0lUSVZFX0NIQVJHRV9DT0xPUixcclxuICAgICAgQ0xCQ29uc3RhbnRzLlBMQVRFX0NIQVJHRV9NRVRFUl9NQVhfVkFMVUUsXHJcbiAgICAgIHBpY29Db3Vsb21ic1BhdHRlcm5TdHJpbmcsXHJcbiAgICAgIHRvcFBsYXRlQ2hhcmdlU3RyaW5nLFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGxhdGVDaGFyZ2VNZXRlck5vZGUnICkgKTtcclxuXHJcbiAgICBjb25zdCBzdG9yZWRFbmVyZ3lNZXRlck5vZGUgPSBuZXcgQmFyTWV0ZXJOb2RlKFxyXG4gICAgICBtb2RlbC5zdG9yZWRFbmVyZ3lNZXRlcixcclxuICAgICAgQ0xCQ29uc3RhbnRzLlNUT1JFRF9FTkVSR1lfQ09MT1IsXHJcbiAgICAgIENMQkNvbnN0YW50cy5TVE9SRURfRU5FUkdZX01FVEVSX01BWF9WQUxVRSxcclxuICAgICAgcGljb0pvdWxlc1BhdHRlcm5TdHJpbmcsXHJcbiAgICAgIHN0b3JlZEVuZXJneVN0cmluZyxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0b3JlZEVuZXJneU1ldGVyTm9kZScgKSApO1xyXG5cclxuICAgIG1ldGVyTm9kZXMuY2hpbGRyZW4gPSBbIGNhcGFjaXRhbmNlTWV0ZXJOb2RlLCBwbGF0ZUNoYXJnZU1ldGVyTm9kZSwgc3RvcmVkRW5lcmd5TWV0ZXJOb2RlIF07XHJcblxyXG4gICAgLy8gY3JlYXRlIGNoZWNrYm94ZXMgZm9yIGVhY2ggbWV0ZXIgbm9kZVxyXG4gICAgY29uc3QgY2hlY2tib3hOb2RlcyA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gU2V0dGluZ3MgZm9yIHRpdGxlIHN0cmluZ3NcclxuICAgIGNvbnN0IGZvbnRPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBWQUxVRV9GT05ULFxyXG4gICAgICBmaWxsOiBWQUxVRV9DT0xPUixcclxuICAgICAgbWF4V2lkdGg6IDEyMFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBjYXBhY2l0YW5jZUxhYmVsID0gbmV3IFRleHQoIGNhcGFjaXRhbmNlU3RyaW5nLCBmb250T3B0aW9ucyApO1xyXG4gICAgY29uc3QgY2FwYWNpdGFuY2VDaGVja2JveCA9IG5ldyBDaGVja2JveCggbW9kZWwuY2FwYWNpdGFuY2VNZXRlclZpc2libGVQcm9wZXJ0eSwgY2FwYWNpdGFuY2VMYWJlbCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjYXBhY2l0YW5jZUNoZWNrYm94JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdG9wUGxhdGVDaGFyZ2VMYWJlbCA9IG5ldyBUZXh0KCB0b3BQbGF0ZUNoYXJnZVN0cmluZywgZm9udE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHRvcFBsYXRlQ2hhcmdlQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIG1vZGVsLnRvcFBsYXRlQ2hhcmdlTWV0ZXJWaXNpYmxlUHJvcGVydHksIHRvcFBsYXRlQ2hhcmdlTGFiZWwsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG9wUGxhdGVDaGFyZ2VDaGVja2JveCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHN0b3JlZEVuZXJneUxhYmVsID0gbmV3IFRleHQoIHN0b3JlZEVuZXJneVN0cmluZywgZm9udE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHN0b3JlZEVuZXJneUNoZWNrYm94ID0gbmV3IENoZWNrYm94KCBtb2RlbC5zdG9yZWRFbmVyZ3lNZXRlclZpc2libGVQcm9wZXJ0eSwgc3RvcmVkRW5lcmd5TGFiZWwsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RvcmVkRW5lcmd5Q2hlY2tib3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjaGVja2JveE5vZGVzLmNoaWxkcmVuID0gWyBjYXBhY2l0YW5jZUNoZWNrYm94LCB0b3BQbGF0ZUNoYXJnZUNoZWNrYm94LCBzdG9yZWRFbmVyZ3lDaGVja2JveCBdO1xyXG5cclxuICAgIHBhcmVudE5vZGUuY2hpbGRyZW4gPSBbIGNoZWNrYm94Tm9kZXMsIG1ldGVyTm9kZXMgXTtcclxuXHJcbiAgICAvLyBsYXlvdXRcclxuICAgIC8vIGNoZWNrYm94ZXMgYWxpZ25lZCB2ZXJ0aWNhbGx5LCBjZW50ZXJlZCBsZWZ0XHJcbiAgICBjYXBhY2l0YW5jZUNoZWNrYm94LnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRvcFBsYXRlQ2hhcmdlQ2hlY2tib3gudHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMiggMCwgQ0hFQ0tCT1hfVkVSVElDQUxfU1BBQ0lORyApO1xyXG4gICAgc3RvcmVkRW5lcmd5Q2hlY2tib3gudHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMiggMCwgMiAqIENIRUNLQk9YX1ZFUlRJQ0FMX1NQQUNJTkcgKTtcclxuXHJcbiAgICAvLyBUaGUgQmFyTWV0ZXJOb2RlcyBoYXZlIGEgY29tbW9uIHgtY29vcmRpbmF0ZVxyXG4gICAgY29uc3QgeCA9IDAuNDQgKiBtaW5XaWR0aDtcclxuXHJcbiAgICBsZXQgeSA9IGNhcGFjaXRhbmNlQ2hlY2tib3guY2VudGVyWTtcclxuICAgIGNhcGFjaXRhbmNlTWV0ZXJOb2RlLmF4aXNMaW5lLnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjIoIHgsIHkgKTtcclxuXHJcbiAgICB5ID0gdG9wUGxhdGVDaGFyZ2VDaGVja2JveC5jZW50ZXJZO1xyXG4gICAgcGxhdGVDaGFyZ2VNZXRlck5vZGUuYXhpc0xpbmUudHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMiggeCwgeSApO1xyXG5cclxuICAgIHkgPSBzdG9yZWRFbmVyZ3lDaGVja2JveC5jZW50ZXJZO1xyXG4gICAgc3RvcmVkRW5lcmd5TWV0ZXJOb2RlLmF4aXNMaW5lLnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjIoIHgsIHkgKTtcclxuXHJcbiAgICBzdXBlciggcGFyZW50Tm9kZSwge1xyXG4gICAgICBmaWxsOiBDTEJDb25zdGFudHMuTUVURVJfUEFORUxfRklMTCxcclxuICAgICAgbWluV2lkdGg6IG1pbldpZHRoLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICB4TWFyZ2luOiAxMCxcclxuICAgICAgeU1hcmdpbjogMTAsXHJcbiAgICAgIHJlc2l6ZTogZmFsc2UsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbGluayB2aXNpYmlsaXR5IHRvIHRoZSBtb2RlbCBwcm9wZXJ0eVxyXG4gICAgbW9kZWwuYmFyR3JhcGhzVmlzaWJsZVByb3BlcnR5LmxpbmsoIGJhckdyYXBoc1BhbmVsVmlzaWJsZSA9PiB7XHJcbiAgICAgIHRoaXMudmlzaWJsZSA9IGJhckdyYXBoc1BhbmVsVmlzaWJsZTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNhcGFjaXRvckxhYkJhc2ljcy5yZWdpc3RlciggJ0Jhck1ldGVyUGFuZWwnLCBCYXJNZXRlclBhbmVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJhck1ldGVyUGFuZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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