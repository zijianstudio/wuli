// Copyright 2013-2022, University of Colorado Boulder

/**
 * View circuit with a resistor, a battery pack, two current arrows and a current readout panel
 * @author Vasily Shakhov (Mlearner)
 * @author Anton Ulyanov (Mlearner)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ohmsLaw from '../../ohmsLaw.js';
import OhmsLawA11yStrings from '../OhmsLawA11yStrings.js';
import OhmsLawConstants from '../OhmsLawConstants.js';
import BatteriesView from './BatteriesView.js';
import ReadoutPanel from './ReadoutPanel.js';
import ResistorNode from './ResistorNode.js';
import RightAngleArrow from './RightAngleArrow.js';
const circuitLabelString = OhmsLawA11yStrings.circuitLabel.value;
const circuitDescriptionString = OhmsLawA11yStrings.circuitDescription.value;
const currentDescriptionPatternString = OhmsLawA11yStrings.currentDescriptionPattern.value;

// constants
const WIDTH = OhmsLawConstants.WIRE_WIDTH;
const HEIGHT = OhmsLawConstants.WIRE_HEIGHT;
const WIRE_THICKNESS = 10;
const OFFSET = 10; // position offset for the RightAngleArrow

class WireBox extends Node {
  /**
   * @param {OhmsLawModel} model
   * @param {OhmsLawDescriber} ohmsLawDescriber
   * @param {Object} [options]
   */
  constructor(model, ohmsLawDescriber, options) {
    options = merge({
      // phet-io
      tandem: Tandem.REQUIRED,
      // pdom
      tagName: 'ul',
      labelTagName: 'h3',
      labelContent: circuitLabelString,
      descriptionContent: circuitDescriptionString
    }, options);
    super(options);

    // For positioning, the top left corner of the wireFrame is defined as 0,0
    const wireFrame = new Rectangle(0, 0, WIDTH, HEIGHT, 4, 4, {
      stroke: '#000',
      lineWidth: WIRE_THICKNESS,
      tandem: options.tandem.createTandem('wireFrame')
    });
    this.addChild(wireFrame);
    const batteriesView = new BatteriesView(model.voltageProperty, {
      left: OhmsLawConstants.BATTERIES_OFFSET,
      // Slightly to the right of the wire
      centerY: 0,
      tandem: options.tandem.createTandem('batteriesView')
    });
    this.addChild(batteriesView);
    const resistorNode = new ResistorNode(model.resistanceProperty, {
      centerX: WIDTH / 2,
      centerY: HEIGHT,
      tandem: options.tandem.createTandem('resistorNode')
    });
    this.addChild(resistorNode);

    // @private
    this.bottomLeftArrow = new RightAngleArrow(model.currentProperty, {
      x: -OFFSET,
      y: HEIGHT + OFFSET,
      rotation: Math.PI / 2,
      tandem: options.tandem.createTandem('bottomLeftArrow')
    });
    this.addChild(this.bottomLeftArrow);
    const bottomRightArrow = new RightAngleArrow(model.currentProperty, {
      x: WIDTH + OFFSET,
      y: HEIGHT + OFFSET,
      rotation: 0,
      tandem: options.tandem.createTandem('bottomRightArrow')
    });
    this.addChild(bottomRightArrow);

    // pdom - accessible description for the current
    assert && assert(this.tagName.toUpperCase() === 'UL', 'li children assume list parent');
    const accessibleCurrentNode = new Node({
      tagName: 'li'
    });
    this.addChild(accessibleCurrentNode);
    const currentReadoutPanel = new ReadoutPanel(model, {
      centerY: HEIGHT / 2,
      centerX: WIDTH / 2,
      tandem: options.tandem.createTandem('currentReadoutPanel')
    });
    this.addChild(currentReadoutPanel);
    model.voltageProperty.set(OhmsLawConstants.VOLTAGE_RANGE.min);
    model.resistanceProperty.set(OhmsLawConstants.RESISTANCE_RANGE.max);

    // @private - this is the min height of the arrows for this sim
    this.minArrowHeight = this.bottomLeftArrow.height;

    // reset the model after using to get height of arrows
    model.reset();

    // pdom - when the current changes, update the accessible description
    Multilink.multilink([model.currentProperty, model.currentUnitsProperty], () => {
      accessibleCurrentNode.innerContent = StringUtils.fillIn(currentDescriptionPatternString, {
        arrowSize: this.getArrowSizeDescription(),
        value: model.getFixedCurrent(),
        unit: ohmsLawDescriber.getUnitForCurrent()
      });
    });

    // pdom - the order of descriptions should be batteries, resistance, then current
    this.pdomOrder = [batteriesView, resistorNode, accessibleCurrentNode];
  }

  /**
   * Get a description of the arrow size.  Returns omething like "small" or "huge" or "medium size".
   * @public
   *
   * @returns {string}
   */
  getArrowSizeDescription() {
    const height = this.bottomLeftArrow.height;

    // Empirically determined, the idea is for the largest relative size string to map to when the 'I' in the formula
    // goes off the screen (or at least close to that), see https://github.com/phetsims/ohms-law/issues/97.
    const maxArrowHeightThresholdCoefficient = 2;

    // The max in the linear function, instead of the max height of the arrow, everything bigger will just be the
    // largest relative size.
    const maxArrowHeightThreshold = HEIGHT * maxArrowHeightThresholdCoefficient;

    // map the normalized height to one of the size descriptions
    let index = Utils.roundSymmetric(Utils.linear(this.minArrowHeight, maxArrowHeightThreshold,
    // a1 b1
    0, OhmsLawConstants.RELATIVE_SIZE_STRINGS.length - 1,
    // a2 b2
    height)); // a3

    // if beyond the threshold, clamp it back to the highest index
    if (height > maxArrowHeightThreshold) {
      index = OhmsLawConstants.RELATIVE_SIZE_STRINGS.length - 1;
    }
    assert && assert(index >= 0 && index < OhmsLawConstants.RELATIVE_SIZE_STRINGS.length, 'mapping to relative size string incorrect');
    return OhmsLawConstants.RELATIVE_SIZE_STRINGS[index].toLowerCase();
  }
}
ohmsLaw.register('WireBox', WireBox);
export default WireBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJVdGlscyIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGFuZGVtIiwib2htc0xhdyIsIk9obXNMYXdBMTF5U3RyaW5ncyIsIk9obXNMYXdDb25zdGFudHMiLCJCYXR0ZXJpZXNWaWV3IiwiUmVhZG91dFBhbmVsIiwiUmVzaXN0b3JOb2RlIiwiUmlnaHRBbmdsZUFycm93IiwiY2lyY3VpdExhYmVsU3RyaW5nIiwiY2lyY3VpdExhYmVsIiwidmFsdWUiLCJjaXJjdWl0RGVzY3JpcHRpb25TdHJpbmciLCJjaXJjdWl0RGVzY3JpcHRpb24iLCJjdXJyZW50RGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nIiwiY3VycmVudERlc2NyaXB0aW9uUGF0dGVybiIsIldJRFRIIiwiV0lSRV9XSURUSCIsIkhFSUdIVCIsIldJUkVfSEVJR0hUIiwiV0lSRV9USElDS05FU1MiLCJPRkZTRVQiLCJXaXJlQm94IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm9obXNMYXdEZXNjcmliZXIiLCJvcHRpb25zIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YWdOYW1lIiwibGFiZWxUYWdOYW1lIiwibGFiZWxDb250ZW50IiwiZGVzY3JpcHRpb25Db250ZW50Iiwid2lyZUZyYW1lIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiY3JlYXRlVGFuZGVtIiwiYWRkQ2hpbGQiLCJiYXR0ZXJpZXNWaWV3Iiwidm9sdGFnZVByb3BlcnR5IiwibGVmdCIsIkJBVFRFUklFU19PRkZTRVQiLCJjZW50ZXJZIiwicmVzaXN0b3JOb2RlIiwicmVzaXN0YW5jZVByb3BlcnR5IiwiY2VudGVyWCIsImJvdHRvbUxlZnRBcnJvdyIsImN1cnJlbnRQcm9wZXJ0eSIsIngiLCJ5Iiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJib3R0b21SaWdodEFycm93IiwiYXNzZXJ0IiwidG9VcHBlckNhc2UiLCJhY2Nlc3NpYmxlQ3VycmVudE5vZGUiLCJjdXJyZW50UmVhZG91dFBhbmVsIiwic2V0IiwiVk9MVEFHRV9SQU5HRSIsIm1pbiIsIlJFU0lTVEFOQ0VfUkFOR0UiLCJtYXgiLCJtaW5BcnJvd0hlaWdodCIsImhlaWdodCIsInJlc2V0IiwibXVsdGlsaW5rIiwiY3VycmVudFVuaXRzUHJvcGVydHkiLCJpbm5lckNvbnRlbnQiLCJmaWxsSW4iLCJhcnJvd1NpemUiLCJnZXRBcnJvd1NpemVEZXNjcmlwdGlvbiIsImdldEZpeGVkQ3VycmVudCIsInVuaXQiLCJnZXRVbml0Rm9yQ3VycmVudCIsInBkb21PcmRlciIsIm1heEFycm93SGVpZ2h0VGhyZXNob2xkQ29lZmZpY2llbnQiLCJtYXhBcnJvd0hlaWdodFRocmVzaG9sZCIsImluZGV4Iiwicm91bmRTeW1tZXRyaWMiLCJsaW5lYXIiLCJSRUxBVElWRV9TSVpFX1NUUklOR1MiLCJsZW5ndGgiLCJ0b0xvd2VyQ2FzZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2lyZUJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGNpcmN1aXQgd2l0aCBhIHJlc2lzdG9yLCBhIGJhdHRlcnkgcGFjaywgdHdvIGN1cnJlbnQgYXJyb3dzIGFuZCBhIGN1cnJlbnQgcmVhZG91dCBwYW5lbFxyXG4gKiBAYXV0aG9yIFZhc2lseSBTaGFraG92IChNbGVhcm5lcilcclxuICogQGF1dGhvciBBbnRvbiBVbHlhbm92IChNbGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IG9obXNMYXcgZnJvbSAnLi4vLi4vb2htc0xhdy5qcyc7XHJcbmltcG9ydCBPaG1zTGF3QTExeVN0cmluZ3MgZnJvbSAnLi4vT2htc0xhd0ExMXlTdHJpbmdzLmpzJztcclxuaW1wb3J0IE9obXNMYXdDb25zdGFudHMgZnJvbSAnLi4vT2htc0xhd0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCYXR0ZXJpZXNWaWV3IGZyb20gJy4vQmF0dGVyaWVzVmlldy5qcyc7XHJcbmltcG9ydCBSZWFkb3V0UGFuZWwgZnJvbSAnLi9SZWFkb3V0UGFuZWwuanMnO1xyXG5pbXBvcnQgUmVzaXN0b3JOb2RlIGZyb20gJy4vUmVzaXN0b3JOb2RlLmpzJztcclxuaW1wb3J0IFJpZ2h0QW5nbGVBcnJvdyBmcm9tICcuL1JpZ2h0QW5nbGVBcnJvdy5qcyc7XHJcblxyXG5jb25zdCBjaXJjdWl0TGFiZWxTdHJpbmcgPSBPaG1zTGF3QTExeVN0cmluZ3MuY2lyY3VpdExhYmVsLnZhbHVlO1xyXG5jb25zdCBjaXJjdWl0RGVzY3JpcHRpb25TdHJpbmcgPSBPaG1zTGF3QTExeVN0cmluZ3MuY2lyY3VpdERlc2NyaXB0aW9uLnZhbHVlO1xyXG5jb25zdCBjdXJyZW50RGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nID0gT2htc0xhd0ExMXlTdHJpbmdzLmN1cnJlbnREZXNjcmlwdGlvblBhdHRlcm4udmFsdWU7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgV0lEVEggPSBPaG1zTGF3Q29uc3RhbnRzLldJUkVfV0lEVEg7XHJcbmNvbnN0IEhFSUdIVCA9IE9obXNMYXdDb25zdGFudHMuV0lSRV9IRUlHSFQ7XHJcbmNvbnN0IFdJUkVfVEhJQ0tORVNTID0gMTA7XHJcbmNvbnN0IE9GRlNFVCA9IDEwOyAgLy8gcG9zaXRpb24gb2Zmc2V0IGZvciB0aGUgUmlnaHRBbmdsZUFycm93XHJcblxyXG5jbGFzcyBXaXJlQm94IGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPaG1zTGF3TW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtPaG1zTGF3RGVzY3JpYmVyfSBvaG1zTGF3RGVzY3JpYmVyXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgb2htc0xhd0Rlc2NyaWJlciwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcblxyXG4gICAgICAvLyBwZG9tXHJcbiAgICAgIHRhZ05hbWU6ICd1bCcsXHJcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2gzJyxcclxuICAgICAgbGFiZWxDb250ZW50OiBjaXJjdWl0TGFiZWxTdHJpbmcsXHJcbiAgICAgIGRlc2NyaXB0aW9uQ29udGVudDogY2lyY3VpdERlc2NyaXB0aW9uU3RyaW5nXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBGb3IgcG9zaXRpb25pbmcsIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIHdpcmVGcmFtZSBpcyBkZWZpbmVkIGFzIDAsMFxyXG4gICAgY29uc3Qgd2lyZUZyYW1lID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgV0lEVEgsIEhFSUdIVCwgNCwgNCwge1xyXG4gICAgICBzdHJva2U6ICcjMDAwJyxcclxuICAgICAgbGluZVdpZHRoOiBXSVJFX1RISUNLTkVTUyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd3aXJlRnJhbWUnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHdpcmVGcmFtZSApO1xyXG5cclxuICAgIGNvbnN0IGJhdHRlcmllc1ZpZXcgPSBuZXcgQmF0dGVyaWVzVmlldyggbW9kZWwudm9sdGFnZVByb3BlcnR5LCB7XHJcbiAgICAgIGxlZnQ6IE9obXNMYXdDb25zdGFudHMuQkFUVEVSSUVTX09GRlNFVCwgLy8gU2xpZ2h0bHkgdG8gdGhlIHJpZ2h0IG9mIHRoZSB3aXJlXHJcbiAgICAgIGNlbnRlclk6IDAsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmF0dGVyaWVzVmlldycgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYmF0dGVyaWVzVmlldyApO1xyXG5cclxuICAgIGNvbnN0IHJlc2lzdG9yTm9kZSA9IG5ldyBSZXNpc3Rvck5vZGUoIG1vZGVsLnJlc2lzdGFuY2VQcm9wZXJ0eSwge1xyXG4gICAgICBjZW50ZXJYOiBXSURUSCAvIDIsXHJcbiAgICAgIGNlbnRlclk6IEhFSUdIVCxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNpc3Rvck5vZGUnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2lzdG9yTm9kZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmJvdHRvbUxlZnRBcnJvdyA9IG5ldyBSaWdodEFuZ2xlQXJyb3coIG1vZGVsLmN1cnJlbnRQcm9wZXJ0eSwge1xyXG4gICAgICB4OiAtT0ZGU0VULFxyXG4gICAgICB5OiBIRUlHSFQgKyBPRkZTRVQsXHJcbiAgICAgIHJvdGF0aW9uOiBNYXRoLlBJIC8gMixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdib3R0b21MZWZ0QXJyb3cnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYm90dG9tTGVmdEFycm93ICk7XHJcblxyXG4gICAgY29uc3QgYm90dG9tUmlnaHRBcnJvdyA9IG5ldyBSaWdodEFuZ2xlQXJyb3coIG1vZGVsLmN1cnJlbnRQcm9wZXJ0eSwge1xyXG4gICAgICB4OiBXSURUSCArIE9GRlNFVCxcclxuICAgICAgeTogSEVJR0hUICsgT0ZGU0VULFxyXG4gICAgICByb3RhdGlvbjogMCxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdib3R0b21SaWdodEFycm93JyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBib3R0b21SaWdodEFycm93ICk7XHJcblxyXG4gICAgLy8gcGRvbSAtIGFjY2Vzc2libGUgZGVzY3JpcHRpb24gZm9yIHRoZSBjdXJyZW50XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRhZ05hbWUudG9VcHBlckNhc2UoKSA9PT0gJ1VMJywgJ2xpIGNoaWxkcmVuIGFzc3VtZSBsaXN0IHBhcmVudCcgKTtcclxuICAgIGNvbnN0IGFjY2Vzc2libGVDdXJyZW50Tm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdsaScgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYWNjZXNzaWJsZUN1cnJlbnROb2RlICk7XHJcblxyXG4gICAgY29uc3QgY3VycmVudFJlYWRvdXRQYW5lbCA9IG5ldyBSZWFkb3V0UGFuZWwoIG1vZGVsLCB7XHJcbiAgICAgIGNlbnRlclk6IEhFSUdIVCAvIDIsXHJcbiAgICAgIGNlbnRlclg6IFdJRFRIIC8gMixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjdXJyZW50UmVhZG91dFBhbmVsJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjdXJyZW50UmVhZG91dFBhbmVsICk7XHJcblxyXG4gICAgbW9kZWwudm9sdGFnZVByb3BlcnR5LnNldCggT2htc0xhd0NvbnN0YW50cy5WT0xUQUdFX1JBTkdFLm1pbiApO1xyXG4gICAgbW9kZWwucmVzaXN0YW5jZVByb3BlcnR5LnNldCggT2htc0xhd0NvbnN0YW50cy5SRVNJU1RBTkNFX1JBTkdFLm1heCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGhpcyBpcyB0aGUgbWluIGhlaWdodCBvZiB0aGUgYXJyb3dzIGZvciB0aGlzIHNpbVxyXG4gICAgdGhpcy5taW5BcnJvd0hlaWdodCA9IHRoaXMuYm90dG9tTGVmdEFycm93LmhlaWdodDtcclxuXHJcbiAgICAvLyByZXNldCB0aGUgbW9kZWwgYWZ0ZXIgdXNpbmcgdG8gZ2V0IGhlaWdodCBvZiBhcnJvd3NcclxuICAgIG1vZGVsLnJlc2V0KCk7XHJcblxyXG4gICAgLy8gcGRvbSAtIHdoZW4gdGhlIGN1cnJlbnQgY2hhbmdlcywgdXBkYXRlIHRoZSBhY2Nlc3NpYmxlIGRlc2NyaXB0aW9uXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vZGVsLmN1cnJlbnRQcm9wZXJ0eSwgbW9kZWwuY3VycmVudFVuaXRzUHJvcGVydHkgXSwgKCkgPT4ge1xyXG4gICAgICBhY2Nlc3NpYmxlQ3VycmVudE5vZGUuaW5uZXJDb250ZW50ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBjdXJyZW50RGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgYXJyb3dTaXplOiB0aGlzLmdldEFycm93U2l6ZURlc2NyaXB0aW9uKCksXHJcbiAgICAgICAgdmFsdWU6IG1vZGVsLmdldEZpeGVkQ3VycmVudCgpLFxyXG4gICAgICAgIHVuaXQ6IG9obXNMYXdEZXNjcmliZXIuZ2V0VW5pdEZvckN1cnJlbnQoKVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcGRvbSAtIHRoZSBvcmRlciBvZiBkZXNjcmlwdGlvbnMgc2hvdWxkIGJlIGJhdHRlcmllcywgcmVzaXN0YW5jZSwgdGhlbiBjdXJyZW50XHJcbiAgICB0aGlzLnBkb21PcmRlciA9IFsgYmF0dGVyaWVzVmlldywgcmVzaXN0b3JOb2RlLCBhY2Nlc3NpYmxlQ3VycmVudE5vZGUgXTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiB0aGUgYXJyb3cgc2l6ZS4gIFJldHVybnMgb21ldGhpbmcgbGlrZSBcInNtYWxsXCIgb3IgXCJodWdlXCIgb3IgXCJtZWRpdW0gc2l6ZVwiLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0QXJyb3dTaXplRGVzY3JpcHRpb24oKSB7XHJcblxyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5ib3R0b21MZWZ0QXJyb3cuaGVpZ2h0O1xyXG5cclxuICAgIC8vIEVtcGlyaWNhbGx5IGRldGVybWluZWQsIHRoZSBpZGVhIGlzIGZvciB0aGUgbGFyZ2VzdCByZWxhdGl2ZSBzaXplIHN0cmluZyB0byBtYXAgdG8gd2hlbiB0aGUgJ0knIGluIHRoZSBmb3JtdWxhXHJcbiAgICAvLyBnb2VzIG9mZiB0aGUgc2NyZWVuIChvciBhdCBsZWFzdCBjbG9zZSB0byB0aGF0KSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9vaG1zLWxhdy9pc3N1ZXMvOTcuXHJcbiAgICBjb25zdCBtYXhBcnJvd0hlaWdodFRocmVzaG9sZENvZWZmaWNpZW50ID0gMjtcclxuXHJcbiAgICAvLyBUaGUgbWF4IGluIHRoZSBsaW5lYXIgZnVuY3Rpb24sIGluc3RlYWQgb2YgdGhlIG1heCBoZWlnaHQgb2YgdGhlIGFycm93LCBldmVyeXRoaW5nIGJpZ2dlciB3aWxsIGp1c3QgYmUgdGhlXHJcbiAgICAvLyBsYXJnZXN0IHJlbGF0aXZlIHNpemUuXHJcbiAgICBjb25zdCBtYXhBcnJvd0hlaWdodFRocmVzaG9sZCA9IEhFSUdIVCAqIG1heEFycm93SGVpZ2h0VGhyZXNob2xkQ29lZmZpY2llbnQ7XHJcblxyXG4gICAgLy8gbWFwIHRoZSBub3JtYWxpemVkIGhlaWdodCB0byBvbmUgb2YgdGhlIHNpemUgZGVzY3JpcHRpb25zXHJcbiAgICBsZXQgaW5kZXggPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggVXRpbHMubGluZWFyKFxyXG4gICAgICB0aGlzLm1pbkFycm93SGVpZ2h0LCBtYXhBcnJvd0hlaWdodFRocmVzaG9sZCwgLy8gYTEgYjFcclxuICAgICAgMCwgT2htc0xhd0NvbnN0YW50cy5SRUxBVElWRV9TSVpFX1NUUklOR1MubGVuZ3RoIC0gMSwgLy8gYTIgYjJcclxuICAgICAgaGVpZ2h0ICkgKTsgLy8gYTNcclxuXHJcbiAgICAvLyBpZiBiZXlvbmQgdGhlIHRocmVzaG9sZCwgY2xhbXAgaXQgYmFjayB0byB0aGUgaGlnaGVzdCBpbmRleFxyXG4gICAgaWYgKCBoZWlnaHQgPiBtYXhBcnJvd0hlaWdodFRocmVzaG9sZCApIHtcclxuICAgICAgaW5kZXggPSBPaG1zTGF3Q29uc3RhbnRzLlJFTEFUSVZFX1NJWkVfU1RSSU5HUy5sZW5ndGggLSAxO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPj0gMCAmJiBpbmRleCA8IE9obXNMYXdDb25zdGFudHMuUkVMQVRJVkVfU0laRV9TVFJJTkdTLmxlbmd0aCxcclxuICAgICAgJ21hcHBpbmcgdG8gcmVsYXRpdmUgc2l6ZSBzdHJpbmcgaW5jb3JyZWN0JyApO1xyXG4gICAgcmV0dXJuIE9obXNMYXdDb25zdGFudHMuUkVMQVRJVkVfU0laRV9TVFJJTkdTWyBpbmRleCBdLnRvTG93ZXJDYXNlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5vaG1zTGF3LnJlZ2lzdGVyKCAnV2lyZUJveCcsIFdpcmVCb3ggKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdpcmVCb3g7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUs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