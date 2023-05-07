// Copyright 2017-2022, University of Colorado Boulder

/**
 * View for the resistor with scatterers that depict the level of resistivity
 * @author Vasily Shakhov (Mlearner)
 * @author Anton Ulyanov (Mlearner)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Circle, LinearGradient, Node, Path } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ohmsLaw from '../../ohmsLaw.js';
import OhmsLawA11yStrings from '../OhmsLawA11yStrings.js';
import OhmsLawConstants from '../OhmsLawConstants.js';
const tinyAmountOfImpuritiesString = OhmsLawA11yStrings.tinyAmountOfImpurities.value;
const verySmallAmountOfImpuritiesString = OhmsLawA11yStrings.verySmallAmountOfImpurities.value;
const smallAmountOfImpuritiesString = OhmsLawA11yStrings.smallAmountOfImpurities.value;
const mediumAmountOfImpuritiesString = OhmsLawA11yStrings.mediumAmountOfImpurities.value;
const largeAmountOfImpuritiesString = OhmsLawA11yStrings.largeAmountOfImpurities.value;
const veryLargeAmountOfImpuritiesString = OhmsLawA11yStrings.veryLargeAmountOfImpurities.value;
const hugeAmountOfImpuritiesString = OhmsLawA11yStrings.hugeAmountOfImpurities.value;
const resistanceDotsPatternString = OhmsLawA11yStrings.resistanceDotsPattern.value;

// constants
const RESISTOR_WIDTH = OhmsLawConstants.WIRE_WIDTH / 2.123; // empirically determined
const RESISTOR_HEIGHT = OhmsLawConstants.WIRE_HEIGHT / 2.75; // empirically determined
const PERSPECTIVE_FACTOR = 0.3; // multiplier that controls the width of the ellipses on the ends of the wire
const MAX_WIDTH_INCLUDING_ROUNDED_ENDS = RESISTOR_WIDTH + RESISTOR_HEIGHT * PERSPECTIVE_FACTOR;

// dots
const DOT_RADIUS = 2;
const AREA_PER_DOT = 40; // adjust this to control the density of the dots
const NUMBER_OF_DOTS = MAX_WIDTH_INCLUDING_ROUNDED_ENDS * RESISTOR_HEIGHT / AREA_PER_DOT;
const IMPURITIES_STRINGS = [tinyAmountOfImpuritiesString, verySmallAmountOfImpuritiesString, smallAmountOfImpuritiesString, mediumAmountOfImpuritiesString, largeAmountOfImpuritiesString, veryLargeAmountOfImpuritiesString, hugeAmountOfImpuritiesString];
const BODY_FILL_GRADIENT = new LinearGradient(0, -RESISTOR_HEIGHT / 2, 0, RESISTOR_HEIGHT / 2) // For 3D effect on the wire.
.addColorStop(0, '#F00').addColorStop(0.266, '#FFF').addColorStop(0.412, '#FCFCFC').addColorStop(1, '#F00');
const DOT_GRID_ROWS = Utils.roundSymmetric(RESISTOR_HEIGHT / Math.sqrt(AREA_PER_DOT));
const DOT_GRID_COLUMNS = Utils.roundSymmetric(RESISTOR_WIDTH / Math.sqrt(AREA_PER_DOT));
const MAX_DOTS = DOT_GRID_COLUMNS * DOT_GRID_ROWS;

// pdom - Function to map resistance to number of dots
const RESISTANCE_TO_NUM_DOTS = new LinearFunction(OhmsLawConstants.RESISTANCE_RANGE.min, OhmsLawConstants.RESISTANCE_RANGE.max, MAX_DOTS * 0.05, MAX_DOTS, true);
class ResistorNode extends Node {
  /**
   * @param {Property.<number>} resistanceProperty
   * @param {Object} [options]
   */
  constructor(resistanceProperty, options) {
    options = merge({
      tandem: Tandem.REQUIRED,
      // pdom
      tagName: 'li' // this assumes that it is a child of a 'ul'
    }, options);
    super();

    // Body of the wire
    const bodyPath = new Path(new Shape().moveTo(-RESISTOR_WIDTH / 2, RESISTOR_HEIGHT / 2).horizontalLineToRelative(RESISTOR_WIDTH).ellipticalArc(RESISTOR_WIDTH / 2, 0, PERSPECTIVE_FACTOR * RESISTOR_HEIGHT / 2, RESISTOR_HEIGHT / 2, 0, Math.PI / 2, 3 * Math.PI / 2, true).horizontalLineToRelative(-RESISTOR_WIDTH), {
      stroke: 'black',
      fill: BODY_FILL_GRADIENT
    });
    this.addChild(bodyPath);

    // Cap/end of the wire
    const endPath = new Path(Shape.ellipse(-RESISTOR_WIDTH / 2, 0, RESISTOR_HEIGHT * PERSPECTIVE_FACTOR / 2, RESISTOR_HEIGHT / 2), {
      stroke: 'black',
      fill: '#ff9f9f'
    });
    this.addChild(endPath);

    // Short stub of wire near the cap of wire
    const stubWirePath = new Path(new Shape().moveTo(5 - RESISTOR_WIDTH / 2, 0).horizontalLineToRelative(-15), {
      stroke: '#000',
      lineWidth: 10
    });
    this.addChild(stubWirePath);

    // Dots representing charge scatterers.
    const dotsNodeTandem = options.tandem.createTandem('dotsNode');
    const dotsNode = new Node({
      tandem: dotsNodeTandem
    });

    // Create the dots randomly on the resistor. Density is based on AREA_PER_DOT.
    for (let i = 0; i < NUMBER_OF_DOTS; i++) {
      const centerY = (dotRandom.nextDouble() - 0.5) * (RESISTOR_HEIGHT - DOT_RADIUS * 2);

      // for the given y coordinate, calculate the x coordinate that will put the dot completely within the
      // wire (including rounded wire ends) using the formula for an ellipse: (x^2 / a^2) + (y^2 / b^2) = 1
      // NOTE: this sim used to use a clipArea for this but that is too slow on iPad Air 2,
      // see https://github.com/phetsims/ohms-law/issues/132
      const a = PERSPECTIVE_FACTOR * RESISTOR_HEIGHT / 2; // elliptical x radius
      const b = RESISTOR_HEIGHT / 2; // elliptical y radius
      const ellipticalX = Math.sqrt((1 - centerY * centerY / (b * b)) * (a * a));
      const maxWidthIncludingEndLimit = RESISTOR_WIDTH + ellipticalX;
      const centerX = (dotRandom.nextDouble() - 0.5) * maxWidthIncludingEndLimit;
      const dot = new Circle(DOT_RADIUS, {
        fill: 'black',
        centerX: centerX,
        centerY: centerY
      });
      dotsNode.addChild(dot);
    }
    this.addChild(dotsNode);

    // Set the number of visible dots based on the resistivity. Present for the lifetime of the simulation; no need to unlink.
    resistanceProperty.link(resistance => {
      const numDotsToShow = RESISTANCE_TO_NUM_DOTS.evaluate(resistance);
      dotsNode.children.forEach((dot, index) => {
        dot.setVisible(index < numDotsToShow);
      });
      this.innerContent = this.getResistanceDescription(resistance);
    });
    this.mutate(options);
  }

  /**
   * Get a description of the resistance based on the value of the resistance.
   * @returns {string} resistance
   * @private
   */
  getResistanceDescription(resistance) {
    const range = OhmsLawConstants.RESISTANCE_RANGE;

    // map the normalied value to one of the resistance descriptions
    const index = Utils.roundSymmetric(Utils.linear(range.min, range.max, 0, IMPURITIES_STRINGS.length - 1, resistance));
    const numDotsDescription = IMPURITIES_STRINGS[index];
    return StringUtils.fillIn(resistanceDotsPatternString, {
      impurities: numDotsDescription
    });
  }
}
ohmsLaw.register('ResistorNode', ResistorNode);
export default ResistorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJMaW5lYXJGdW5jdGlvbiIsIlV0aWxzIiwiU2hhcGUiLCJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiQ2lyY2xlIiwiTGluZWFyR3JhZGllbnQiLCJOb2RlIiwiUGF0aCIsIlRhbmRlbSIsIm9obXNMYXciLCJPaG1zTGF3QTExeVN0cmluZ3MiLCJPaG1zTGF3Q29uc3RhbnRzIiwidGlueUFtb3VudE9mSW1wdXJpdGllc1N0cmluZyIsInRpbnlBbW91bnRPZkltcHVyaXRpZXMiLCJ2YWx1ZSIsInZlcnlTbWFsbEFtb3VudE9mSW1wdXJpdGllc1N0cmluZyIsInZlcnlTbWFsbEFtb3VudE9mSW1wdXJpdGllcyIsInNtYWxsQW1vdW50T2ZJbXB1cml0aWVzU3RyaW5nIiwic21hbGxBbW91bnRPZkltcHVyaXRpZXMiLCJtZWRpdW1BbW91bnRPZkltcHVyaXRpZXNTdHJpbmciLCJtZWRpdW1BbW91bnRPZkltcHVyaXRpZXMiLCJsYXJnZUFtb3VudE9mSW1wdXJpdGllc1N0cmluZyIsImxhcmdlQW1vdW50T2ZJbXB1cml0aWVzIiwidmVyeUxhcmdlQW1vdW50T2ZJbXB1cml0aWVzU3RyaW5nIiwidmVyeUxhcmdlQW1vdW50T2ZJbXB1cml0aWVzIiwiaHVnZUFtb3VudE9mSW1wdXJpdGllc1N0cmluZyIsImh1Z2VBbW91bnRPZkltcHVyaXRpZXMiLCJyZXNpc3RhbmNlRG90c1BhdHRlcm5TdHJpbmciLCJyZXNpc3RhbmNlRG90c1BhdHRlcm4iLCJSRVNJU1RPUl9XSURUSCIsIldJUkVfV0lEVEgiLCJSRVNJU1RPUl9IRUlHSFQiLCJXSVJFX0hFSUdIVCIsIlBFUlNQRUNUSVZFX0ZBQ1RPUiIsIk1BWF9XSURUSF9JTkNMVURJTkdfUk9VTkRFRF9FTkRTIiwiRE9UX1JBRElVUyIsIkFSRUFfUEVSX0RPVCIsIk5VTUJFUl9PRl9ET1RTIiwiSU1QVVJJVElFU19TVFJJTkdTIiwiQk9EWV9GSUxMX0dSQURJRU5UIiwiYWRkQ29sb3JTdG9wIiwiRE9UX0dSSURfUk9XUyIsInJvdW5kU3ltbWV0cmljIiwiTWF0aCIsInNxcnQiLCJET1RfR1JJRF9DT0xVTU5TIiwiTUFYX0RPVFMiLCJSRVNJU1RBTkNFX1RPX05VTV9ET1RTIiwiUkVTSVNUQU5DRV9SQU5HRSIsIm1pbiIsIm1heCIsIlJlc2lzdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwicmVzaXN0YW5jZVByb3BlcnR5Iiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFnTmFtZSIsImJvZHlQYXRoIiwibW92ZVRvIiwiaG9yaXpvbnRhbExpbmVUb1JlbGF0aXZlIiwiZWxsaXB0aWNhbEFyYyIsIlBJIiwic3Ryb2tlIiwiZmlsbCIsImFkZENoaWxkIiwiZW5kUGF0aCIsImVsbGlwc2UiLCJzdHViV2lyZVBhdGgiLCJsaW5lV2lkdGgiLCJkb3RzTm9kZVRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImRvdHNOb2RlIiwiaSIsImNlbnRlclkiLCJuZXh0RG91YmxlIiwiYSIsImIiLCJlbGxpcHRpY2FsWCIsIm1heFdpZHRoSW5jbHVkaW5nRW5kTGltaXQiLCJjZW50ZXJYIiwiZG90IiwibGluayIsInJlc2lzdGFuY2UiLCJudW1Eb3RzVG9TaG93IiwiZXZhbHVhdGUiLCJjaGlsZHJlbiIsImZvckVhY2giLCJpbmRleCIsInNldFZpc2libGUiLCJpbm5lckNvbnRlbnQiLCJnZXRSZXNpc3RhbmNlRGVzY3JpcHRpb24iLCJtdXRhdGUiLCJyYW5nZSIsImxpbmVhciIsImxlbmd0aCIsIm51bURvdHNEZXNjcmlwdGlvbiIsImZpbGxJbiIsImltcHVyaXRpZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlc2lzdG9yTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgcmVzaXN0b3Igd2l0aCBzY2F0dGVyZXJzIHRoYXQgZGVwaWN0IHRoZSBsZXZlbCBvZiByZXNpc3Rpdml0eVxyXG4gKiBAYXV0aG9yIFZhc2lseSBTaGFraG92IChNbGVhcm5lcilcclxuICogQGF1dGhvciBBbnRvbiBVbHlhbm92IChNbGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIExpbmVhckdyYWRpZW50LCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IG9obXNMYXcgZnJvbSAnLi4vLi4vb2htc0xhdy5qcyc7XHJcbmltcG9ydCBPaG1zTGF3QTExeVN0cmluZ3MgZnJvbSAnLi4vT2htc0xhd0ExMXlTdHJpbmdzLmpzJztcclxuaW1wb3J0IE9obXNMYXdDb25zdGFudHMgZnJvbSAnLi4vT2htc0xhd0NvbnN0YW50cy5qcyc7XHJcblxyXG5jb25zdCB0aW55QW1vdW50T2ZJbXB1cml0aWVzU3RyaW5nID0gT2htc0xhd0ExMXlTdHJpbmdzLnRpbnlBbW91bnRPZkltcHVyaXRpZXMudmFsdWU7XHJcbmNvbnN0IHZlcnlTbWFsbEFtb3VudE9mSW1wdXJpdGllc1N0cmluZyA9IE9obXNMYXdBMTF5U3RyaW5ncy52ZXJ5U21hbGxBbW91bnRPZkltcHVyaXRpZXMudmFsdWU7XHJcbmNvbnN0IHNtYWxsQW1vdW50T2ZJbXB1cml0aWVzU3RyaW5nID0gT2htc0xhd0ExMXlTdHJpbmdzLnNtYWxsQW1vdW50T2ZJbXB1cml0aWVzLnZhbHVlO1xyXG5jb25zdCBtZWRpdW1BbW91bnRPZkltcHVyaXRpZXNTdHJpbmcgPSBPaG1zTGF3QTExeVN0cmluZ3MubWVkaXVtQW1vdW50T2ZJbXB1cml0aWVzLnZhbHVlO1xyXG5jb25zdCBsYXJnZUFtb3VudE9mSW1wdXJpdGllc1N0cmluZyA9IE9obXNMYXdBMTF5U3RyaW5ncy5sYXJnZUFtb3VudE9mSW1wdXJpdGllcy52YWx1ZTtcclxuY29uc3QgdmVyeUxhcmdlQW1vdW50T2ZJbXB1cml0aWVzU3RyaW5nID0gT2htc0xhd0ExMXlTdHJpbmdzLnZlcnlMYXJnZUFtb3VudE9mSW1wdXJpdGllcy52YWx1ZTtcclxuY29uc3QgaHVnZUFtb3VudE9mSW1wdXJpdGllc1N0cmluZyA9IE9obXNMYXdBMTF5U3RyaW5ncy5odWdlQW1vdW50T2ZJbXB1cml0aWVzLnZhbHVlO1xyXG5jb25zdCByZXNpc3RhbmNlRG90c1BhdHRlcm5TdHJpbmcgPSBPaG1zTGF3QTExeVN0cmluZ3MucmVzaXN0YW5jZURvdHNQYXR0ZXJuLnZhbHVlO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFJFU0lTVE9SX1dJRFRIID0gT2htc0xhd0NvbnN0YW50cy5XSVJFX1dJRFRIIC8gMi4xMjM7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuY29uc3QgUkVTSVNUT1JfSEVJR0hUID0gT2htc0xhd0NvbnN0YW50cy5XSVJFX0hFSUdIVCAvIDIuNzU7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuY29uc3QgUEVSU1BFQ1RJVkVfRkFDVE9SID0gMC4zOyAvLyBtdWx0aXBsaWVyIHRoYXQgY29udHJvbHMgdGhlIHdpZHRoIG9mIHRoZSBlbGxpcHNlcyBvbiB0aGUgZW5kcyBvZiB0aGUgd2lyZVxyXG5jb25zdCBNQVhfV0lEVEhfSU5DTFVESU5HX1JPVU5ERURfRU5EUyA9IFJFU0lTVE9SX1dJRFRIICsgUkVTSVNUT1JfSEVJR0hUICogUEVSU1BFQ1RJVkVfRkFDVE9SO1xyXG5cclxuLy8gZG90c1xyXG5jb25zdCBET1RfUkFESVVTID0gMjtcclxuY29uc3QgQVJFQV9QRVJfRE9UID0gNDA7IC8vIGFkanVzdCB0aGlzIHRvIGNvbnRyb2wgdGhlIGRlbnNpdHkgb2YgdGhlIGRvdHNcclxuY29uc3QgTlVNQkVSX09GX0RPVFMgPSBNQVhfV0lEVEhfSU5DTFVESU5HX1JPVU5ERURfRU5EUyAqIFJFU0lTVE9SX0hFSUdIVCAvIEFSRUFfUEVSX0RPVDtcclxuY29uc3QgSU1QVVJJVElFU19TVFJJTkdTID0gWyB0aW55QW1vdW50T2ZJbXB1cml0aWVzU3RyaW5nLCB2ZXJ5U21hbGxBbW91bnRPZkltcHVyaXRpZXNTdHJpbmcsIHNtYWxsQW1vdW50T2ZJbXB1cml0aWVzU3RyaW5nLFxyXG4gIG1lZGl1bUFtb3VudE9mSW1wdXJpdGllc1N0cmluZywgbGFyZ2VBbW91bnRPZkltcHVyaXRpZXNTdHJpbmcsIHZlcnlMYXJnZUFtb3VudE9mSW1wdXJpdGllc1N0cmluZyxcclxuICBodWdlQW1vdW50T2ZJbXB1cml0aWVzU3RyaW5nIF07XHJcblxyXG5jb25zdCBCT0RZX0ZJTExfR1JBRElFTlQgPSBuZXcgTGluZWFyR3JhZGllbnQoIDAsIC1SRVNJU1RPUl9IRUlHSFQgLyAyLCAwLCBSRVNJU1RPUl9IRUlHSFQgLyAyICkgLy8gRm9yIDNEIGVmZmVjdCBvbiB0aGUgd2lyZS5cclxuICAuYWRkQ29sb3JTdG9wKCAwLCAnI0YwMCcgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDAuMjY2LCAnI0ZGRicgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDAuNDEyLCAnI0ZDRkNGQycgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDEsICcjRjAwJyApO1xyXG5cclxuY29uc3QgRE9UX0dSSURfUk9XUyA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBSRVNJU1RPUl9IRUlHSFQgLyBNYXRoLnNxcnQoIEFSRUFfUEVSX0RPVCApICk7XHJcbmNvbnN0IERPVF9HUklEX0NPTFVNTlMgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggUkVTSVNUT1JfV0lEVEggLyBNYXRoLnNxcnQoIEFSRUFfUEVSX0RPVCApICk7XHJcbmNvbnN0IE1BWF9ET1RTID0gRE9UX0dSSURfQ09MVU1OUyAqIERPVF9HUklEX1JPV1M7XHJcblxyXG4vLyBwZG9tIC0gRnVuY3Rpb24gdG8gbWFwIHJlc2lzdGFuY2UgdG8gbnVtYmVyIG9mIGRvdHNcclxuY29uc3QgUkVTSVNUQU5DRV9UT19OVU1fRE9UUyA9IG5ldyBMaW5lYXJGdW5jdGlvbihcclxuICBPaG1zTGF3Q29uc3RhbnRzLlJFU0lTVEFOQ0VfUkFOR0UubWluLFxyXG4gIE9obXNMYXdDb25zdGFudHMuUkVTSVNUQU5DRV9SQU5HRS5tYXgsXHJcbiAgTUFYX0RPVFMgKiAwLjA1LFxyXG4gIE1BWF9ET1RTLFxyXG4gIHRydWVcclxuKTtcclxuXHJcbmNsYXNzIFJlc2lzdG9yTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHJlc2lzdGFuY2VQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcmVzaXN0YW5jZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgdGFnTmFtZTogJ2xpJyAvLyB0aGlzIGFzc3VtZXMgdGhhdCBpdCBpcyBhIGNoaWxkIG9mIGEgJ3VsJ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQm9keSBvZiB0aGUgd2lyZVxyXG4gICAgY29uc3QgYm9keVBhdGggPSBuZXcgUGF0aCggbmV3IFNoYXBlKCkubW92ZVRvKCAtUkVTSVNUT1JfV0lEVEggLyAyLCBSRVNJU1RPUl9IRUlHSFQgLyAyIClcclxuICAgICAgLmhvcml6b250YWxMaW5lVG9SZWxhdGl2ZSggUkVTSVNUT1JfV0lEVEggKVxyXG4gICAgICAuZWxsaXB0aWNhbEFyYyggUkVTSVNUT1JfV0lEVEggLyAyLCAwLCBQRVJTUEVDVElWRV9GQUNUT1IgKiBSRVNJU1RPUl9IRUlHSFQgLyAyLCBSRVNJU1RPUl9IRUlHSFQgLyAyLCAwLCBNYXRoLlBJIC8gMiwgMyAqIE1hdGguUEkgLyAyLCB0cnVlIClcclxuICAgICAgLmhvcml6b250YWxMaW5lVG9SZWxhdGl2ZSggLVJFU0lTVE9SX1dJRFRIICksIHtcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBmaWxsOiBCT0RZX0ZJTExfR1JBRElFTlRcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJvZHlQYXRoICk7XHJcblxyXG4gICAgLy8gQ2FwL2VuZCBvZiB0aGUgd2lyZVxyXG4gICAgY29uc3QgZW5kUGF0aCA9IG5ldyBQYXRoKCBTaGFwZS5lbGxpcHNlKCAtUkVTSVNUT1JfV0lEVEggLyAyLCAwLCBSRVNJU1RPUl9IRUlHSFQgKiBQRVJTUEVDVElWRV9GQUNUT1IgLyAyLCBSRVNJU1RPUl9IRUlHSFQgLyAyICksIHtcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBmaWxsOiAnI2ZmOWY5ZidcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVuZFBhdGggKTtcclxuXHJcbiAgICAvLyBTaG9ydCBzdHViIG9mIHdpcmUgbmVhciB0aGUgY2FwIG9mIHdpcmVcclxuICAgIGNvbnN0IHN0dWJXaXJlUGF0aCA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKS5tb3ZlVG8oIDUgLSBSRVNJU1RPUl9XSURUSCAvIDIsIDAgKS5ob3Jpem9udGFsTGluZVRvUmVsYXRpdmUoIC0xNSApLCB7XHJcbiAgICAgIHN0cm9rZTogJyMwMDAnLFxyXG4gICAgICBsaW5lV2lkdGg6IDEwXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzdHViV2lyZVBhdGggKTtcclxuXHJcbiAgICAvLyBEb3RzIHJlcHJlc2VudGluZyBjaGFyZ2Ugc2NhdHRlcmVycy5cclxuICAgIGNvbnN0IGRvdHNOb2RlVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZG90c05vZGUnICk7XHJcbiAgICBjb25zdCBkb3RzTm9kZSA9IG5ldyBOb2RlKCB7IHRhbmRlbTogZG90c05vZGVUYW5kZW0gfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgZG90cyByYW5kb21seSBvbiB0aGUgcmVzaXN0b3IuIERlbnNpdHkgaXMgYmFzZWQgb24gQVJFQV9QRVJfRE9ULlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTlVNQkVSX09GX0RPVFM7IGkrKyApIHtcclxuXHJcbiAgICAgIGNvbnN0IGNlbnRlclkgPSAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgLSAwLjUgKSAqICggUkVTSVNUT1JfSEVJR0hUIC0gRE9UX1JBRElVUyAqIDIgKTtcclxuXHJcbiAgICAgIC8vIGZvciB0aGUgZ2l2ZW4geSBjb29yZGluYXRlLCBjYWxjdWxhdGUgdGhlIHggY29vcmRpbmF0ZSB0aGF0IHdpbGwgcHV0IHRoZSBkb3QgY29tcGxldGVseSB3aXRoaW4gdGhlXHJcbiAgICAgIC8vIHdpcmUgKGluY2x1ZGluZyByb3VuZGVkIHdpcmUgZW5kcykgdXNpbmcgdGhlIGZvcm11bGEgZm9yIGFuIGVsbGlwc2U6ICh4XjIgLyBhXjIpICsgKHleMiAvIGJeMikgPSAxXHJcbiAgICAgIC8vIE5PVEU6IHRoaXMgc2ltIHVzZWQgdG8gdXNlIGEgY2xpcEFyZWEgZm9yIHRoaXMgYnV0IHRoYXQgaXMgdG9vIHNsb3cgb24gaVBhZCBBaXIgMixcclxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9vaG1zLWxhdy9pc3N1ZXMvMTMyXHJcbiAgICAgIGNvbnN0IGEgPSBQRVJTUEVDVElWRV9GQUNUT1IgKiBSRVNJU1RPUl9IRUlHSFQgLyAyOyAvLyBlbGxpcHRpY2FsIHggcmFkaXVzXHJcbiAgICAgIGNvbnN0IGIgPSBSRVNJU1RPUl9IRUlHSFQgLyAyOyAvLyBlbGxpcHRpY2FsIHkgcmFkaXVzXHJcbiAgICAgIGNvbnN0IGVsbGlwdGljYWxYID0gTWF0aC5zcXJ0KCAoIDEgLSAoIGNlbnRlclkgKiBjZW50ZXJZICkgLyAoIGIgKiBiICkgKSAqICggYSAqIGEgKSApO1xyXG5cclxuICAgICAgY29uc3QgbWF4V2lkdGhJbmNsdWRpbmdFbmRMaW1pdCA9IFJFU0lTVE9SX1dJRFRIICsgZWxsaXB0aWNhbFg7XHJcbiAgICAgIGNvbnN0IGNlbnRlclggPSAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgLSAwLjUgKSAqIG1heFdpZHRoSW5jbHVkaW5nRW5kTGltaXQ7XHJcblxyXG4gICAgICBjb25zdCBkb3QgPSBuZXcgQ2lyY2xlKCBET1RfUkFESVVTLCB7XHJcbiAgICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgICBjZW50ZXJYOiBjZW50ZXJYLFxyXG4gICAgICAgIGNlbnRlclk6IGNlbnRlcllcclxuICAgICAgfSApO1xyXG4gICAgICBkb3RzTm9kZS5hZGRDaGlsZCggZG90ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFkZENoaWxkKCBkb3RzTm9kZSApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgbnVtYmVyIG9mIHZpc2libGUgZG90cyBiYXNlZCBvbiB0aGUgcmVzaXN0aXZpdHkuIFByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvbjsgbm8gbmVlZCB0byB1bmxpbmsuXHJcbiAgICByZXNpc3RhbmNlUHJvcGVydHkubGluayggcmVzaXN0YW5jZSA9PiB7XHJcbiAgICAgIGNvbnN0IG51bURvdHNUb1Nob3cgPSBSRVNJU1RBTkNFX1RPX05VTV9ET1RTLmV2YWx1YXRlKCByZXNpc3RhbmNlICk7XHJcbiAgICAgIGRvdHNOb2RlLmNoaWxkcmVuLmZvckVhY2goICggZG90LCBpbmRleCApID0+IHtcclxuICAgICAgICBkb3Quc2V0VmlzaWJsZSggaW5kZXggPCBudW1Eb3RzVG9TaG93ICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuaW5uZXJDb250ZW50ID0gdGhpcy5nZXRSZXNpc3RhbmNlRGVzY3JpcHRpb24oIHJlc2lzdGFuY2UgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGRlc2NyaXB0aW9uIG9mIHRoZSByZXNpc3RhbmNlIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGUgcmVzaXN0YW5jZS5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSByZXNpc3RhbmNlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRSZXNpc3RhbmNlRGVzY3JpcHRpb24oIHJlc2lzdGFuY2UgKSB7XHJcbiAgICBjb25zdCByYW5nZSA9IE9obXNMYXdDb25zdGFudHMuUkVTSVNUQU5DRV9SQU5HRTtcclxuXHJcbiAgICAvLyBtYXAgdGhlIG5vcm1hbGllZCB2YWx1ZSB0byBvbmUgb2YgdGhlIHJlc2lzdGFuY2UgZGVzY3JpcHRpb25zXHJcbiAgICBjb25zdCBpbmRleCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBVdGlscy5saW5lYXIoIHJhbmdlLm1pbiwgcmFuZ2UubWF4LCAwLCBJTVBVUklUSUVTX1NUUklOR1MubGVuZ3RoIC0gMSwgcmVzaXN0YW5jZSApICk7XHJcbiAgICBjb25zdCBudW1Eb3RzRGVzY3JpcHRpb24gPSBJTVBVUklUSUVTX1NUUklOR1NbIGluZGV4IF07XHJcblxyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggcmVzaXN0YW5jZURvdHNQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGltcHVyaXRpZXM6IG51bURvdHNEZXNjcmlwdGlvblxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxub2htc0xhdy5yZWdpc3RlciggJ1Jlc2lzdG9yTm9kZScsIFJlc2lzdG9yTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVzaXN0b3JOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxTQUFTQyxNQUFNLEVBQUVDLGNBQWMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3RGLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsT0FBTyxNQUFNLGtCQUFrQjtBQUN0QyxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFDekQsT0FBT0MsZ0JBQWdCLE1BQU0sd0JBQXdCO0FBRXJELE1BQU1DLDRCQUE0QixHQUFHRixrQkFBa0IsQ0FBQ0csc0JBQXNCLENBQUNDLEtBQUs7QUFDcEYsTUFBTUMsaUNBQWlDLEdBQUdMLGtCQUFrQixDQUFDTSwyQkFBMkIsQ0FBQ0YsS0FBSztBQUM5RixNQUFNRyw2QkFBNkIsR0FBR1Asa0JBQWtCLENBQUNRLHVCQUF1QixDQUFDSixLQUFLO0FBQ3RGLE1BQU1LLDhCQUE4QixHQUFHVCxrQkFBa0IsQ0FBQ1Usd0JBQXdCLENBQUNOLEtBQUs7QUFDeEYsTUFBTU8sNkJBQTZCLEdBQUdYLGtCQUFrQixDQUFDWSx1QkFBdUIsQ0FBQ1IsS0FBSztBQUN0RixNQUFNUyxpQ0FBaUMsR0FBR2Isa0JBQWtCLENBQUNjLDJCQUEyQixDQUFDVixLQUFLO0FBQzlGLE1BQU1XLDRCQUE0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