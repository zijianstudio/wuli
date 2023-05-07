// Copyright 2016-2023, University of Colorado Boulder

/**
 * Creates the first row for the ReadoutNode of Trig Tour.
 *
 * @author Michael Dubson (PhET developer) on 6/10/2015
 * @author Jesse Greenberg
 */

import Utils from '../../../../../dot/js/Utils.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Text } from '../../../../../scenery/js/imports.js';
import trigTour from '../../../trigTour.js';
import TrigTourStrings from '../../../TrigTourStrings.js';
import SpecialAngles from '../../SpecialAngles.js';
import TrigTourMathStrings from '../../TrigTourMathStrings.js';
import TrigTourColors from '../TrigTourColors.js';
import FractionNode from './FractionNode.js';
const xString = TrigTourStrings.x;
const yString = TrigTourStrings.y;

// non translatable string
const equalString = TrigTourMathStrings.EQUALS_STRING;

//constants
const DISPLAY_FONT = new PhetFont(20);
const DISPLAY_FONT_LARGE = new PhetFont(30);
const TEXT_COLOR = TrigTourColors.TEXT_COLOR;
const SPECIAL_COS_FRACTIONS = SpecialAngles.SPECIAL_COS_FRACTIONS;
const SPECIAL_SIN_FRACTIONS = SpecialAngles.SPECIAL_SIN_FRACTIONS;
class CoordinatesRow extends Node {
  /**
   * Constructor.
   *
   * @param {TrigTourModel} trigTourModel
   * @param {ViewProperties} viewProperties
   * @param {Object} [options]
   * @constructor
   */
  constructor(trigTourModel, viewProperties, options) {
    super(options);
    this.trigTourModel = trigTourModel; // @private
    this.viewProperties = viewProperties; // @private

    // initialize fonts for this row
    const fontInfo = {
      font: DISPLAY_FONT,
      fill: TEXT_COLOR
    };
    const largeFontInfo = {
      font: DISPLAY_FONT_LARGE,
      fill: TEXT_COLOR
    };
    const fontBoldInfo = {
      font: DISPLAY_FONT,
      fill: TEXT_COLOR,
      fontWeight: 'bold'
    };

    // string pattern for the axis readout
    const xyEqualString = `(${xString},${yString})${equalString}`;
    const coordinatesLabel = new Text(xyEqualString, fontBoldInfo);

    // fraction values set below
    this.sinReadoutFraction = new FractionNode('', '', fontInfo);
    this.cosReadoutFraction = new FractionNode('', '', fontInfo);
    this.coordinatesReadout = new Text('', fontInfo); // text provided by model.fullAngleProperty.link, below

    // create the text for the parentheses.  Comma uses different font options, so a pattern cannot be used.
    const leftParensText = new Text('( ', largeFontInfo);
    const commaText = new Text(' ,  ', fontInfo);
    const rightParensText = new Text(' )', largeFontInfo);

    // Assemble pieces into '( cos fraction value, sin fraction value )'
    this.coordinatesHBox = new HBox({
      children: [leftParensText, this.cosReadoutFraction, commaText, this.sinReadoutFraction, rightParensText],
      align: 'center',
      spacing: 0
    });

    // coordinatesHBox is visible in Special Angles mode, coordinatesReadout visible otherwise
    this.children = [coordinatesLabel, this.coordinatesReadout, this.coordinatesHBox];

    // set the row layout.  Needs to be called every update so that pieces of the row do not wander.
    const setRowLayout = () => {
      const spacing = 4;
      this.coordinatesReadout.left = coordinatesLabel.right + spacing;
      this.coordinatesHBox.left = coordinatesLabel.right + spacing;
      this.coordinatesHBox.centerY = coordinatesLabel.centerY;
    };

    // Register for synchronization with model.
    trigTourModel.fullAngleProperty.link(fullAngle => {
      const sinText = Utils.toFixed(trigTourModel.sin(), 3);
      const cosText = Utils.toFixed(trigTourModel.cos(), 3);
      this.coordinatesReadout.string = `(${cosText}, ${sinText})`;
      this.setSpecialAngleTrigReadout(this.sinReadoutFraction, SPECIAL_SIN_FRACTIONS);
      this.setSpecialAngleTrigReadout(this.cosReadoutFraction, SPECIAL_COS_FRACTIONS);

      // update the layout accordingly
      setRowLayout();
    });
    viewProperties.specialAnglesVisibleProperty.link(specialAnglesVisible => {
      this.coordinatesHBox.visible = specialAnglesVisible;
      this.coordinatesReadout.visible = !specialAnglesVisible;
    });
  }

  /**
   * Set the special angle readout display.
   *
   * @private
   */
  setSpecialAngleTrigReadout(trigValueFraction, specialFractions) {
    const smallAngleInDegrees = Utils.roundSymmetric(this.trigTourModel.getSmallAngle0To360());
    const specialFraction = specialFractions[smallAngleInDegrees];
    const setFractionValues = (readoutFraction, specialFraction) => {
      // sanity check to make sure that the special fraction is defined in the special fractions objects above
      if (specialFraction) {
        readoutFraction.setValues(specialFraction.numerator, specialFraction.denominator, specialFraction.radical, specialFraction.negative);
      }
    };
    setFractionValues(trigValueFraction, specialFraction);
  }
}
trigTour.register('CoordinatesRow', CoordinatesRow);
export default CoordinatesRow;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlBoZXRGb250IiwiSEJveCIsIk5vZGUiLCJUZXh0IiwidHJpZ1RvdXIiLCJUcmlnVG91clN0cmluZ3MiLCJTcGVjaWFsQW5nbGVzIiwiVHJpZ1RvdXJNYXRoU3RyaW5ncyIsIlRyaWdUb3VyQ29sb3JzIiwiRnJhY3Rpb25Ob2RlIiwieFN0cmluZyIsIngiLCJ5U3RyaW5nIiwieSIsImVxdWFsU3RyaW5nIiwiRVFVQUxTX1NUUklORyIsIkRJU1BMQVlfRk9OVCIsIkRJU1BMQVlfRk9OVF9MQVJHRSIsIlRFWFRfQ09MT1IiLCJTUEVDSUFMX0NPU19GUkFDVElPTlMiLCJTUEVDSUFMX1NJTl9GUkFDVElPTlMiLCJDb29yZGluYXRlc1JvdyIsImNvbnN0cnVjdG9yIiwidHJpZ1RvdXJNb2RlbCIsInZpZXdQcm9wZXJ0aWVzIiwib3B0aW9ucyIsImZvbnRJbmZvIiwiZm9udCIsImZpbGwiLCJsYXJnZUZvbnRJbmZvIiwiZm9udEJvbGRJbmZvIiwiZm9udFdlaWdodCIsInh5RXF1YWxTdHJpbmciLCJjb29yZGluYXRlc0xhYmVsIiwic2luUmVhZG91dEZyYWN0aW9uIiwiY29zUmVhZG91dEZyYWN0aW9uIiwiY29vcmRpbmF0ZXNSZWFkb3V0IiwibGVmdFBhcmVuc1RleHQiLCJjb21tYVRleHQiLCJyaWdodFBhcmVuc1RleHQiLCJjb29yZGluYXRlc0hCb3giLCJjaGlsZHJlbiIsImFsaWduIiwic3BhY2luZyIsInNldFJvd0xheW91dCIsImxlZnQiLCJyaWdodCIsImNlbnRlclkiLCJmdWxsQW5nbGVQcm9wZXJ0eSIsImxpbmsiLCJmdWxsQW5nbGUiLCJzaW5UZXh0IiwidG9GaXhlZCIsInNpbiIsImNvc1RleHQiLCJjb3MiLCJzdHJpbmciLCJzZXRTcGVjaWFsQW5nbGVUcmlnUmVhZG91dCIsInNwZWNpYWxBbmdsZXNWaXNpYmxlUHJvcGVydHkiLCJzcGVjaWFsQW5nbGVzVmlzaWJsZSIsInZpc2libGUiLCJ0cmlnVmFsdWVGcmFjdGlvbiIsInNwZWNpYWxGcmFjdGlvbnMiLCJzbWFsbEFuZ2xlSW5EZWdyZWVzIiwicm91bmRTeW1tZXRyaWMiLCJnZXRTbWFsbEFuZ2xlMFRvMzYwIiwic3BlY2lhbEZyYWN0aW9uIiwic2V0RnJhY3Rpb25WYWx1ZXMiLCJyZWFkb3V0RnJhY3Rpb24iLCJzZXRWYWx1ZXMiLCJudW1lcmF0b3IiLCJkZW5vbWluYXRvciIsInJhZGljYWwiLCJuZWdhdGl2ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29vcmRpbmF0ZXNSb3cuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyB0aGUgZmlyc3Qgcm93IGZvciB0aGUgUmVhZG91dE5vZGUgb2YgVHJpZyBUb3VyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgRHVic29uIChQaEVUIGRldmVsb3Blcikgb24gNi8xMC8yMDE1XHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHRyaWdUb3VyIGZyb20gJy4uLy4uLy4uL3RyaWdUb3VyLmpzJztcclxuaW1wb3J0IFRyaWdUb3VyU3RyaW5ncyBmcm9tICcuLi8uLi8uLi9UcmlnVG91clN0cmluZ3MuanMnO1xyXG5pbXBvcnQgU3BlY2lhbEFuZ2xlcyBmcm9tICcuLi8uLi9TcGVjaWFsQW5nbGVzLmpzJztcclxuaW1wb3J0IFRyaWdUb3VyTWF0aFN0cmluZ3MgZnJvbSAnLi4vLi4vVHJpZ1RvdXJNYXRoU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBUcmlnVG91ckNvbG9ycyBmcm9tICcuLi9UcmlnVG91ckNvbG9ycy5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbk5vZGUgZnJvbSAnLi9GcmFjdGlvbk5vZGUuanMnO1xyXG5cclxuY29uc3QgeFN0cmluZyA9IFRyaWdUb3VyU3RyaW5ncy54O1xyXG5jb25zdCB5U3RyaW5nID0gVHJpZ1RvdXJTdHJpbmdzLnk7XHJcblxyXG4vLyBub24gdHJhbnNsYXRhYmxlIHN0cmluZ1xyXG5jb25zdCBlcXVhbFN0cmluZyA9IFRyaWdUb3VyTWF0aFN0cmluZ3MuRVFVQUxTX1NUUklORztcclxuXHJcbi8vY29uc3RhbnRzXHJcbmNvbnN0IERJU1BMQVlfRk9OVCA9IG5ldyBQaGV0Rm9udCggMjAgKTtcclxuY29uc3QgRElTUExBWV9GT05UX0xBUkdFID0gbmV3IFBoZXRGb250KCAzMCApO1xyXG5jb25zdCBURVhUX0NPTE9SID0gVHJpZ1RvdXJDb2xvcnMuVEVYVF9DT0xPUjtcclxuXHJcbmNvbnN0IFNQRUNJQUxfQ09TX0ZSQUNUSU9OUyA9IFNwZWNpYWxBbmdsZXMuU1BFQ0lBTF9DT1NfRlJBQ1RJT05TO1xyXG5jb25zdCBTUEVDSUFMX1NJTl9GUkFDVElPTlMgPSBTcGVjaWFsQW5nbGVzLlNQRUNJQUxfU0lOX0ZSQUNUSU9OUztcclxuXHJcbmNsYXNzIENvb3JkaW5hdGVzUm93IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUcmlnVG91ck1vZGVsfSB0cmlnVG91ck1vZGVsXHJcbiAgICogQHBhcmFtIHtWaWV3UHJvcGVydGllc30gdmlld1Byb3BlcnRpZXNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQGNvbnN0cnVjdG9yXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRyaWdUb3VyTW9kZWwsIHZpZXdQcm9wZXJ0aWVzLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnRyaWdUb3VyTW9kZWwgPSB0cmlnVG91ck1vZGVsOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy52aWV3UHJvcGVydGllcyA9IHZpZXdQcm9wZXJ0aWVzOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIGluaXRpYWxpemUgZm9udHMgZm9yIHRoaXMgcm93XHJcbiAgICBjb25zdCBmb250SW5mbyA9IHsgZm9udDogRElTUExBWV9GT05ULCBmaWxsOiBURVhUX0NPTE9SIH07XHJcbiAgICBjb25zdCBsYXJnZUZvbnRJbmZvID0geyBmb250OiBESVNQTEFZX0ZPTlRfTEFSR0UsIGZpbGw6IFRFWFRfQ09MT1IgfTtcclxuICAgIGNvbnN0IGZvbnRCb2xkSW5mbyA9IHsgZm9udDogRElTUExBWV9GT05ULCBmaWxsOiBURVhUX0NPTE9SLCBmb250V2VpZ2h0OiAnYm9sZCcgfTtcclxuXHJcbiAgICAvLyBzdHJpbmcgcGF0dGVybiBmb3IgdGhlIGF4aXMgcmVhZG91dFxyXG4gICAgY29uc3QgeHlFcXVhbFN0cmluZyA9IGAoJHt4U3RyaW5nfSwke3lTdHJpbmd9KSR7ZXF1YWxTdHJpbmd9YDtcclxuICAgIGNvbnN0IGNvb3JkaW5hdGVzTGFiZWwgPSBuZXcgVGV4dCggeHlFcXVhbFN0cmluZywgZm9udEJvbGRJbmZvICk7XHJcblxyXG4gICAgLy8gZnJhY3Rpb24gdmFsdWVzIHNldCBiZWxvd1xyXG4gICAgdGhpcy5zaW5SZWFkb3V0RnJhY3Rpb24gPSBuZXcgRnJhY3Rpb25Ob2RlKCAnJywgJycsIGZvbnRJbmZvICk7XHJcbiAgICB0aGlzLmNvc1JlYWRvdXRGcmFjdGlvbiA9IG5ldyBGcmFjdGlvbk5vZGUoICcnLCAnJywgZm9udEluZm8gKTtcclxuICAgIHRoaXMuY29vcmRpbmF0ZXNSZWFkb3V0ID0gbmV3IFRleHQoICcnLCBmb250SW5mbyApOyAvLyB0ZXh0IHByb3ZpZGVkIGJ5IG1vZGVsLmZ1bGxBbmdsZVByb3BlcnR5LmxpbmssIGJlbG93XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSB0ZXh0IGZvciB0aGUgcGFyZW50aGVzZXMuICBDb21tYSB1c2VzIGRpZmZlcmVudCBmb250IG9wdGlvbnMsIHNvIGEgcGF0dGVybiBjYW5ub3QgYmUgdXNlZC5cclxuICAgIGNvbnN0IGxlZnRQYXJlbnNUZXh0ID0gbmV3IFRleHQoICcoICcsIGxhcmdlRm9udEluZm8gKTtcclxuICAgIGNvbnN0IGNvbW1hVGV4dCA9IG5ldyBUZXh0KCAnICwgICcsIGZvbnRJbmZvICk7XHJcbiAgICBjb25zdCByaWdodFBhcmVuc1RleHQgPSBuZXcgVGV4dCggJyApJywgbGFyZ2VGb250SW5mbyApO1xyXG5cclxuICAgIC8vIEFzc2VtYmxlIHBpZWNlcyBpbnRvICcoIGNvcyBmcmFjdGlvbiB2YWx1ZSwgc2luIGZyYWN0aW9uIHZhbHVlICknXHJcbiAgICB0aGlzLmNvb3JkaW5hdGVzSEJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbGVmdFBhcmVuc1RleHQsXHJcbiAgICAgICAgdGhpcy5jb3NSZWFkb3V0RnJhY3Rpb24sXHJcbiAgICAgICAgY29tbWFUZXh0LFxyXG4gICAgICAgIHRoaXMuc2luUmVhZG91dEZyYWN0aW9uLFxyXG4gICAgICAgIHJpZ2h0UGFyZW5zVGV4dFxyXG4gICAgICBdLFxyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHNwYWNpbmc6IDBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjb29yZGluYXRlc0hCb3ggaXMgdmlzaWJsZSBpbiBTcGVjaWFsIEFuZ2xlcyBtb2RlLCBjb29yZGluYXRlc1JlYWRvdXQgdmlzaWJsZSBvdGhlcndpc2VcclxuICAgIHRoaXMuY2hpbGRyZW4gPSBbIGNvb3JkaW5hdGVzTGFiZWwsIHRoaXMuY29vcmRpbmF0ZXNSZWFkb3V0LCB0aGlzLmNvb3JkaW5hdGVzSEJveCBdO1xyXG5cclxuICAgIC8vIHNldCB0aGUgcm93IGxheW91dC4gIE5lZWRzIHRvIGJlIGNhbGxlZCBldmVyeSB1cGRhdGUgc28gdGhhdCBwaWVjZXMgb2YgdGhlIHJvdyBkbyBub3Qgd2FuZGVyLlxyXG4gICAgY29uc3Qgc2V0Um93TGF5b3V0ID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBzcGFjaW5nID0gNDtcclxuICAgICAgdGhpcy5jb29yZGluYXRlc1JlYWRvdXQubGVmdCA9IGNvb3JkaW5hdGVzTGFiZWwucmlnaHQgKyBzcGFjaW5nO1xyXG4gICAgICB0aGlzLmNvb3JkaW5hdGVzSEJveC5sZWZ0ID0gY29vcmRpbmF0ZXNMYWJlbC5yaWdodCArIHNwYWNpbmc7XHJcbiAgICAgIHRoaXMuY29vcmRpbmF0ZXNIQm94LmNlbnRlclkgPSBjb29yZGluYXRlc0xhYmVsLmNlbnRlclk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFJlZ2lzdGVyIGZvciBzeW5jaHJvbml6YXRpb24gd2l0aCBtb2RlbC5cclxuICAgIHRyaWdUb3VyTW9kZWwuZnVsbEFuZ2xlUHJvcGVydHkubGluayggZnVsbEFuZ2xlID0+IHtcclxuICAgICAgY29uc3Qgc2luVGV4dCA9IFV0aWxzLnRvRml4ZWQoIHRyaWdUb3VyTW9kZWwuc2luKCksIDMgKTtcclxuICAgICAgY29uc3QgY29zVGV4dCA9IFV0aWxzLnRvRml4ZWQoIHRyaWdUb3VyTW9kZWwuY29zKCksIDMgKTtcclxuICAgICAgdGhpcy5jb29yZGluYXRlc1JlYWRvdXQuc3RyaW5nID0gYCgke2Nvc1RleHR9LCAke3NpblRleHR9KWA7XHJcbiAgICAgIHRoaXMuc2V0U3BlY2lhbEFuZ2xlVHJpZ1JlYWRvdXQoIHRoaXMuc2luUmVhZG91dEZyYWN0aW9uLCBTUEVDSUFMX1NJTl9GUkFDVElPTlMgKTtcclxuICAgICAgdGhpcy5zZXRTcGVjaWFsQW5nbGVUcmlnUmVhZG91dCggdGhpcy5jb3NSZWFkb3V0RnJhY3Rpb24sIFNQRUNJQUxfQ09TX0ZSQUNUSU9OUyApO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSBsYXlvdXQgYWNjb3JkaW5nbHlcclxuICAgICAgc2V0Um93TGF5b3V0KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdmlld1Byb3BlcnRpZXMuc3BlY2lhbEFuZ2xlc1Zpc2libGVQcm9wZXJ0eS5saW5rKCBzcGVjaWFsQW5nbGVzVmlzaWJsZSA9PiB7XHJcbiAgICAgIHRoaXMuY29vcmRpbmF0ZXNIQm94LnZpc2libGUgPSBzcGVjaWFsQW5nbGVzVmlzaWJsZTtcclxuICAgICAgdGhpcy5jb29yZGluYXRlc1JlYWRvdXQudmlzaWJsZSA9ICFzcGVjaWFsQW5nbGVzVmlzaWJsZTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgc3BlY2lhbCBhbmdsZSByZWFkb3V0IGRpc3BsYXkuXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHNldFNwZWNpYWxBbmdsZVRyaWdSZWFkb3V0KCB0cmlnVmFsdWVGcmFjdGlvbiwgc3BlY2lhbEZyYWN0aW9ucyApIHtcclxuICAgIGNvbnN0IHNtYWxsQW5nbGVJbkRlZ3JlZXMgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGhpcy50cmlnVG91ck1vZGVsLmdldFNtYWxsQW5nbGUwVG8zNjAoKSApO1xyXG4gICAgY29uc3Qgc3BlY2lhbEZyYWN0aW9uID0gc3BlY2lhbEZyYWN0aW9uc1sgc21hbGxBbmdsZUluRGVncmVlcyBdO1xyXG5cclxuICAgIGNvbnN0IHNldEZyYWN0aW9uVmFsdWVzID0gKCByZWFkb3V0RnJhY3Rpb24sIHNwZWNpYWxGcmFjdGlvbiApID0+IHtcclxuXHJcbiAgICAgIC8vIHNhbml0eSBjaGVjayB0byBtYWtlIHN1cmUgdGhhdCB0aGUgc3BlY2lhbCBmcmFjdGlvbiBpcyBkZWZpbmVkIGluIHRoZSBzcGVjaWFsIGZyYWN0aW9ucyBvYmplY3RzIGFib3ZlXHJcbiAgICAgIGlmICggc3BlY2lhbEZyYWN0aW9uICkge1xyXG4gICAgICAgIHJlYWRvdXRGcmFjdGlvbi5zZXRWYWx1ZXMoXHJcbiAgICAgICAgICBzcGVjaWFsRnJhY3Rpb24ubnVtZXJhdG9yLFxyXG4gICAgICAgICAgc3BlY2lhbEZyYWN0aW9uLmRlbm9taW5hdG9yLFxyXG4gICAgICAgICAgc3BlY2lhbEZyYWN0aW9uLnJhZGljYWwsXHJcbiAgICAgICAgICBzcGVjaWFsRnJhY3Rpb24ubmVnYXRpdmVcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgc2V0RnJhY3Rpb25WYWx1ZXMoIHRyaWdWYWx1ZUZyYWN0aW9uLCBzcGVjaWFsRnJhY3Rpb24gKTtcclxuICB9XHJcbn1cclxuXHJcbnRyaWdUb3VyLnJlZ2lzdGVyKCAnQ29vcmRpbmF0ZXNSb3cnLCBDb29yZGluYXRlc1JvdyApO1xyXG5leHBvcnQgZGVmYXVsdCBDb29yZGluYXRlc1JvdzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLFFBQVEsTUFBTSw0Q0FBNEM7QUFDakUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDdkUsT0FBT0MsUUFBUSxNQUFNLHNCQUFzQjtBQUMzQyxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0MsbUJBQW1CLE1BQU0sOEJBQThCO0FBQzlELE9BQU9DLGNBQWMsTUFBTSxzQkFBc0I7QUFDakQsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUU1QyxNQUFNQyxPQUFPLEdBQUdMLGVBQWUsQ0FBQ00sQ0FBQztBQUNqQyxNQUFNQyxPQUFPLEdBQUdQLGVBQWUsQ0FBQ1EsQ0FBQzs7QUFFakM7QUFDQSxNQUFNQyxXQUFXLEdBQUdQLG1CQUFtQixDQUFDUSxhQUFhOztBQUVyRDtBQUNBLE1BQU1DLFlBQVksR0FBRyxJQUFJaEIsUUFBUSxDQUFFLEVBQUcsQ0FBQztBQUN2QyxNQUFNaUIsa0JBQWtCLEdBQUcsSUFBSWpCLFFBQVEs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