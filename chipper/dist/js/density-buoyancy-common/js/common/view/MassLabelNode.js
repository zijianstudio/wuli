// Copyright 2019-2023, University of Colorado Boulder

/**
 * A label shown in front of a mass that shows its mass-value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { ManualConstraint, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import LabelTexture from './LabelTexture.js';

// constants
const MASS_LABEL_SIZE = 32;
const createMassLabel = (string, fill) => {
  const rectangle = new Rectangle(0, 0, MASS_LABEL_SIZE, MASS_LABEL_SIZE, {
    cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
    fill: fill
  });
  const label = new Text(string, {
    font: new PhetFont({
      size: 24,
      weight: 'bold'
    }),
    fill: 'white',
    center: rectangle.center,
    maxWidth: 30
  });
  label.localBoundsProperty.link(() => {
    label.center = rectangle.center;
  });
  rectangle.addChild(label);
  return rectangle;
};
const PRIMARY_LABEL_DEPENDENCIES = [DensityBuoyancyCommonStrings.massLabel.primaryStringProperty, DensityBuoyancyCommonColors.labelAProperty];
const SECONDARY_LABEL_DEPENDENCIES = [DensityBuoyancyCommonStrings.massLabel.secondaryStringProperty, DensityBuoyancyCommonColors.labelBProperty];
const PRIMARY_LABEL = createMassLabel(DensityBuoyancyCommonStrings.massLabel.primaryStringProperty, DensityBuoyancyCommonColors.labelAProperty);
const SECONDARY_LABEL = createMassLabel(DensityBuoyancyCommonStrings.massLabel.secondaryStringProperty, DensityBuoyancyCommonColors.labelBProperty);
export default class MassLabelNode extends Node {
  constructor(mass, showMassesProperty) {
    super({
      pickable: false
    });
    this.readoutStringProperty = new PatternStringProperty(DensityBuoyancyCommonStrings.kilogramsPatternStringProperty, {
      kilograms: mass.massProperty
    }, {
      decimalPlaces: 2
    });
    const readoutText = new Text(this.readoutStringProperty, {
      font: new PhetFont({
        size: 18
      }),
      maxWidth: 70
    });
    const readoutPanel = new Panel(readoutText, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
      xMargin: 4,
      yMargin: 4
    });
    this.addChild(readoutPanel);
    this.mass = mass;
    this.showMassesProperty = showMassesProperty;

    // Keep it centered
    ManualConstraint.create(this, [readoutPanel], readoutWrapper => {
      readoutWrapper.center = Vector2.ZERO;
    });
    this.showMassesListener = shown => {
      readoutPanel.visible = shown;
    };
    this.showMassesProperty.link(this.showMassesListener);
  }

  /**
   * Releases references.
   */
  dispose() {
    this.showMassesProperty.unlink(this.showMassesListener);
    this.readoutStringProperty.dispose();
    super.dispose();
  }

  /**
   * Returns a NodeTexture for the primary.
   */
  static getPrimaryTexture() {
    const texture = new LabelTexture(PRIMARY_LABEL);

    // @ts-expect-error
    const multilink = Multilink.multilink(PRIMARY_LABEL_DEPENDENCIES, () => texture.update());
    texture.disposedEmitter.addListener(() => multilink.dispose());
    return texture;
  }

  /**
   * Returns a NodeTexture for the secondary.
   */
  static getSecondaryTexture() {
    const texture = new LabelTexture(SECONDARY_LABEL);

    // @ts-expect-error
    const multilink = Multilink.multilink(SECONDARY_LABEL_DEPENDENCIES, () => texture.update());
    texture.disposedEmitter.addListener(() => multilink.dispose());
    return texture;
  }

  /**
   * Returns a basic texture for a given (short) string label.
   */
  static getBasicLabelTexture(string) {
    const label = new Text(string, {
      font: new PhetFont({
        size: 24,
        weight: 'bold'
      }),
      maxWidth: 100
    });
    const rectangle = new Rectangle(0, 0, label.width + 5, label.height + 3, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
      fill: 'white'
    });
    label.center = rectangle.center;
    rectangle.addChild(label);
    return new LabelTexture(rectangle);
  }
}
densityBuoyancyCommon.register('MassLabelNode', MassLabelNode);
export { PRIMARY_LABEL, SECONDARY_LABEL };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJWZWN0b3IyIiwiUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiUGhldEZvbnQiLCJNYW51YWxDb25zdHJhaW50IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJQYW5lbCIsImRlbnNpdHlCdW95YW5jeUNvbW1vbiIsIkRlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MiLCJEZW5zaXR5QnVveWFuY3lDb21tb25Db25zdGFudHMiLCJEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMiLCJMYWJlbFRleHR1cmUiLCJNQVNTX0xBQkVMX1NJWkUiLCJjcmVhdGVNYXNzTGFiZWwiLCJzdHJpbmciLCJmaWxsIiwicmVjdGFuZ2xlIiwiY29ybmVyUmFkaXVzIiwiQ09STkVSX1JBRElVUyIsImxhYmVsIiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJjZW50ZXIiLCJtYXhXaWR0aCIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJsaW5rIiwiYWRkQ2hpbGQiLCJQUklNQVJZX0xBQkVMX0RFUEVOREVOQ0lFUyIsIm1hc3NMYWJlbCIsInByaW1hcnlTdHJpbmdQcm9wZXJ0eSIsImxhYmVsQVByb3BlcnR5IiwiU0VDT05EQVJZX0xBQkVMX0RFUEVOREVOQ0lFUyIsInNlY29uZGFyeVN0cmluZ1Byb3BlcnR5IiwibGFiZWxCUHJvcGVydHkiLCJQUklNQVJZX0xBQkVMIiwiU0VDT05EQVJZX0xBQkVMIiwiTWFzc0xhYmVsTm9kZSIsImNvbnN0cnVjdG9yIiwibWFzcyIsInNob3dNYXNzZXNQcm9wZXJ0eSIsInBpY2thYmxlIiwicmVhZG91dFN0cmluZ1Byb3BlcnR5Iiwia2lsb2dyYW1zUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwia2lsb2dyYW1zIiwibWFzc1Byb3BlcnR5IiwiZGVjaW1hbFBsYWNlcyIsInJlYWRvdXRUZXh0IiwicmVhZG91dFBhbmVsIiwieE1hcmdpbiIsInlNYXJnaW4iLCJjcmVhdGUiLCJyZWFkb3V0V3JhcHBlciIsIlpFUk8iLCJzaG93TWFzc2VzTGlzdGVuZXIiLCJzaG93biIsInZpc2libGUiLCJkaXNwb3NlIiwidW5saW5rIiwiZ2V0UHJpbWFyeVRleHR1cmUiLCJ0ZXh0dXJlIiwibXVsdGlsaW5rIiwidXBkYXRlIiwiZGlzcG9zZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJnZXRTZWNvbmRhcnlUZXh0dXJlIiwiZ2V0QmFzaWNMYWJlbFRleHR1cmUiLCJ3aWR0aCIsImhlaWdodCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFzc0xhYmVsTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGxhYmVsIHNob3duIGluIGZyb250IG9mIGEgbWFzcyB0aGF0IHNob3dzIGl0cyBtYXNzLXZhbHVlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTm9kZVRleHR1cmUgZnJvbSAnLi4vLi4vLi4vLi4vbW9iaXVzL2pzL05vZGVUZXh0dXJlLmpzJztcclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBNYW51YWxDb25zdHJhaW50LCBOb2RlLCBSZWN0YW5nbGUsIFRleHQsIFRQYWludCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIGZyb20gJy4uLy4uL2RlbnNpdHlCdW95YW5jeUNvbW1vbi5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0RlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzIGZyb20gJy4uL0RlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBNYXNzIGZyb20gJy4uL21vZGVsL01hc3MuanMnO1xyXG5pbXBvcnQgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzIGZyb20gJy4vRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IExhYmVsVGV4dHVyZSBmcm9tICcuL0xhYmVsVGV4dHVyZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFTU19MQUJFTF9TSVpFID0gMzI7XHJcbmNvbnN0IGNyZWF0ZU1hc3NMYWJlbCA9ICggc3RyaW5nOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBmaWxsOiBUUGFpbnQgKSA9PiB7XHJcbiAgY29uc3QgcmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgTUFTU19MQUJFTF9TSVpFLCBNQVNTX0xBQkVMX1NJWkUsIHtcclxuICAgIGNvcm5lclJhZGl1czogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLkNPUk5FUl9SQURJVVMsXHJcbiAgICBmaWxsOiBmaWxsXHJcbiAgfSApO1xyXG4gIGNvbnN0IGxhYmVsID0gbmV3IFRleHQoIHN0cmluZywge1xyXG4gICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDI0LCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgY2VudGVyOiByZWN0YW5nbGUuY2VudGVyLFxyXG4gICAgbWF4V2lkdGg6IDMwXHJcbiAgfSApO1xyXG4gIGxhYmVsLmxvY2FsQm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgbGFiZWwuY2VudGVyID0gcmVjdGFuZ2xlLmNlbnRlcjtcclxuICB9ICk7XHJcbiAgcmVjdGFuZ2xlLmFkZENoaWxkKCBsYWJlbCApO1xyXG4gIHJldHVybiByZWN0YW5nbGU7XHJcbn07XHJcblxyXG5jb25zdCBQUklNQVJZX0xBQkVMX0RFUEVOREVOQ0lFUyA9IFsgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWwucHJpbWFyeVN0cmluZ1Byb3BlcnR5LCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMubGFiZWxBUHJvcGVydHkgXTtcclxuY29uc3QgU0VDT05EQVJZX0xBQkVMX0RFUEVOREVOQ0lFUyA9IFsgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWwuc2Vjb25kYXJ5U3RyaW5nUHJvcGVydHksIERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5sYWJlbEJQcm9wZXJ0eSBdO1xyXG5cclxuY29uc3QgUFJJTUFSWV9MQUJFTCA9IGNyZWF0ZU1hc3NMYWJlbCggRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWwucHJpbWFyeVN0cmluZ1Byb3BlcnR5LCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMubGFiZWxBUHJvcGVydHkgKTtcclxuY29uc3QgU0VDT05EQVJZX0xBQkVMID0gY3JlYXRlTWFzc0xhYmVsKCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hc3NMYWJlbC5zZWNvbmRhcnlTdHJpbmdQcm9wZXJ0eSwgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLmxhYmVsQlByb3BlcnR5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXNzTGFiZWxOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBtYXNzOiBNYXNzO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2hvd01hc3Nlc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHNob3dNYXNzZXNMaXN0ZW5lcjogKCBuOiBib29sZWFuICkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IHJlYWRvdXRTdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtYXNzOiBNYXNzLCBzaG93TWFzc2VzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ICkge1xyXG4gICAgc3VwZXIoIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yZWFkb3V0U3RyaW5nUHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLmtpbG9ncmFtc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBraWxvZ3JhbXM6IG1hc3MubWFzc1Byb3BlcnR5XHJcbiAgICB9LCB7XHJcbiAgICAgIGRlY2ltYWxQbGFjZXM6IDJcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByZWFkb3V0VGV4dCA9IG5ldyBUZXh0KCB0aGlzLnJlYWRvdXRTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHtcclxuICAgICAgICBzaXplOiAxOFxyXG4gICAgICB9ICksXHJcbiAgICAgIG1heFdpZHRoOiA3MFxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcmVhZG91dFBhbmVsID0gbmV3IFBhbmVsKCByZWFkb3V0VGV4dCwge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cy5DT1JORVJfUkFESVVTLFxyXG4gICAgICB4TWFyZ2luOiA0LFxyXG4gICAgICB5TWFyZ2luOiA0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggcmVhZG91dFBhbmVsICk7XHJcblxyXG4gICAgdGhpcy5tYXNzID0gbWFzcztcclxuICAgIHRoaXMuc2hvd01hc3Nlc1Byb3BlcnR5ID0gc2hvd01hc3Nlc1Byb3BlcnR5O1xyXG5cclxuICAgIC8vIEtlZXAgaXQgY2VudGVyZWRcclxuICAgIE1hbnVhbENvbnN0cmFpbnQuY3JlYXRlKCB0aGlzLCBbIHJlYWRvdXRQYW5lbCBdLCByZWFkb3V0V3JhcHBlciA9PiB7XHJcbiAgICAgIHJlYWRvdXRXcmFwcGVyLmNlbnRlciA9IFZlY3RvcjIuWkVSTztcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNob3dNYXNzZXNMaXN0ZW5lciA9IHNob3duID0+IHtcclxuICAgICAgcmVhZG91dFBhbmVsLnZpc2libGUgPSBzaG93bjtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zaG93TWFzc2VzUHJvcGVydHkubGluayggdGhpcy5zaG93TWFzc2VzTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXMuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNob3dNYXNzZXNQcm9wZXJ0eS51bmxpbmsoIHRoaXMuc2hvd01hc3Nlc0xpc3RlbmVyICk7XHJcbiAgICB0aGlzLnJlYWRvdXRTdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIE5vZGVUZXh0dXJlIGZvciB0aGUgcHJpbWFyeS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldFByaW1hcnlUZXh0dXJlKCk6IE5vZGVUZXh0dXJlIHtcclxuICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgTGFiZWxUZXh0dXJlKCBQUklNQVJZX0xBQkVMICk7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgY29uc3QgbXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayggUFJJTUFSWV9MQUJFTF9ERVBFTkRFTkNJRVMsICgpID0+IHRleHR1cmUudXBkYXRlKCkgKTtcclxuICAgIHRleHR1cmUuZGlzcG9zZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBtdWx0aWxpbmsuZGlzcG9zZSgpICk7XHJcblxyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgTm9kZVRleHR1cmUgZm9yIHRoZSBzZWNvbmRhcnkuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRTZWNvbmRhcnlUZXh0dXJlKCk6IE5vZGVUZXh0dXJlIHtcclxuICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgTGFiZWxUZXh0dXJlKCBTRUNPTkRBUllfTEFCRUwgKTtcclxuXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICBjb25zdCBtdWx0aWxpbmsgPSBNdWx0aWxpbmsubXVsdGlsaW5rKCBTRUNPTkRBUllfTEFCRUxfREVQRU5ERU5DSUVTLCAoKSA9PiB0ZXh0dXJlLnVwZGF0ZSgpICk7XHJcbiAgICB0ZXh0dXJlLmRpc3Bvc2VkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gbXVsdGlsaW5rLmRpc3Bvc2UoKSApO1xyXG5cclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGJhc2ljIHRleHR1cmUgZm9yIGEgZ2l2ZW4gKHNob3J0KSBzdHJpbmcgbGFiZWwuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRCYXNpY0xhYmVsVGV4dHVyZSggc3RyaW5nOiBzdHJpbmcgKTogTm9kZVRleHR1cmUge1xyXG4gICAgY29uc3QgbGFiZWwgPSBuZXcgVGV4dCggc3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyNCwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gICAgICBtYXhXaWR0aDogMTAwXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCByZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBsYWJlbC53aWR0aCArIDUsIGxhYmVsLmhlaWdodCArIDMsIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiBEZW5zaXR5QnVveWFuY3lDb21tb25Db25zdGFudHMuQ09STkVSX1JBRElVUyxcclxuICAgICAgZmlsbDogJ3doaXRlJ1xyXG4gICAgfSApO1xyXG4gICAgbGFiZWwuY2VudGVyID0gcmVjdGFuZ2xlLmNlbnRlcjtcclxuICAgIHJlY3RhbmdsZS5hZGRDaGlsZCggbGFiZWwgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IExhYmVsVGV4dHVyZSggcmVjdGFuZ2xlICk7XHJcbiAgfVxyXG59XHJcblxyXG5kZW5zaXR5QnVveWFuY3lDb21tb24ucmVnaXN0ZXIoICdNYXNzTGFiZWxOb2RlJywgTWFzc0xhYmVsTm9kZSApO1xyXG5leHBvcnQgeyBQUklNQVJZX0xBQkVMLCBTRUNPTkRBUllfTEFCRUwgfTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFFeEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxPQUFPQyxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxnQkFBZ0IsRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBZ0IsbUNBQW1DO0FBQ25HLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xF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