// Copyright 2019-2023, University of Colorado Boulder

/**
 * BaseVectorsAccordionBox appears on the right side of the 'Equations' screen. It contains pickers for modifying the
 * base vectors, and a checkbox to show/hide the base vectors.
 *
 * 'Is a' relationship with AccordionBox but adds the following functionality:
 *  - allow users to change the components of the Vectors on Cartesian mode (via numberPicker)
 *  - allow users to change the angle and the magnitude of the Vectors on polar mode (via numberPicker)
 *  - allow users to toggle the visibility of the Base Vectors (via checkbox)
 *
 * This AccordionBox is not meant to be disposed.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { HBox, HStrut, Node, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import CoordinateSnapModes from '../../common/model/CoordinateSnapModes.js';
import VectorAdditionConstants from '../../common/VectorAdditionConstants.js';
import VectorSymbolNode from '../../common/view/VectorSymbolNode.js';
import vectorAddition from '../../vectorAddition.js';
import VectorAdditionStrings from '../../VectorAdditionStrings.js';
import EquationsVectorSet from '../model/EquationsVectorSet.js';
import BaseVectorsCheckbox from './BaseVectorsCheckbox.js';

// constants
const LABEL_MAX_WIDTH = 30; // maxWidth for picker labels, determined empirically

export default class BaseVectorsAccordionBox extends AccordionBox {
  /**
   * @param {BooleanProperty} baseVectorsVisibleProperty
   * @param {CoordinateSnapModes} coordinateSnapMode
   * @param {EquationsVectorSet} vectorSet
   * @param {Object} [options]
   */
  constructor(baseVectorsVisibleProperty, coordinateSnapMode, vectorSet, options) {
    assert && assert(baseVectorsVisibleProperty instanceof BooleanProperty, `invalid baseVectorsVisibleProperty: ${baseVectorsVisibleProperty}`);
    assert && assert(CoordinateSnapModes.enumeration.includes(coordinateSnapMode), `invalid coordinateSnapMode: ${coordinateSnapMode}`);
    assert && assert(vectorSet instanceof EquationsVectorSet, `invalid vectorSet: ${vectorSet}`);
    assert && assert(!options || Object.getPrototypeOf(options) === Object.prototype, `Extra prototype on options: ${options}`);

    //----------------------------------------------------------------------------------------

    options = merge({}, VectorAdditionConstants.ACCORDION_BOX_OPTIONS, {
      // specific to this class
      xSpacing: 11,
      // {number} spacing between the left NumberPicker and the right label
      ySpacing: 17,
      // {number} y spacing between UI components
      contentWidth: VectorAdditionConstants.BASE_VECTORS_ACCORDION_BOX_CONTENT_WIDTH,
      // fixed content width

      // super class options
      titleNode: new Text(VectorAdditionStrings.baseVectors, {
        font: VectorAdditionConstants.TITLE_FONT
      })
    }, options);

    // Assign a max width of the title node.
    options.titleNode.maxWidth = 0.75 * options.contentWidth;

    //----------------------------------------------------------------------------------------
    // Create the Number Pickers / labels
    //
    // Each Vector in the vectorSet gets 2 NumberPickers displayed horizontally. Each NumberPicker has
    // a 'label'.
    //
    // On Cartesian, the two NumberPickers toggle the X and the Y component respectively.
    // On Polar, the two NumberPickers toggle the magnitude and the angle respectively.
    //----------------------------------------------------------------------------------------

    const pickers = []; // {HBox[]} pairs of pickers and their labels

    // Each Vector in the vectorSet gets 2 NumberPickers, so loop through the vectorSet
    vectorSet.vectors.forEach(vector => {
      const baseVector = vector.baseVector; // convenience reference

      // Empty references to the 2 NumberPickers/labels per Vector. To be set later.
      let leftNumberPickerAndLabel;
      let rightNumberPickerAndLabel;
      if (coordinateSnapMode === CoordinateSnapModes.CARTESIAN) {
        // X Component
        leftNumberPickerAndLabel = createNumberPickerWithLabel(baseVector.xComponentProperty, VectorAdditionConstants.COMPONENT_RANGE, new VectorSymbolNode({
          symbol: `${baseVector.symbol}<sub>${VectorAdditionStrings.symbol.x}</sub>`,
          showVectorArrow: false,
          maxWidth: LABEL_MAX_WIDTH
        }));

        // Y Component
        rightNumberPickerAndLabel = createNumberPickerWithLabel(baseVector.yComponentProperty, VectorAdditionConstants.COMPONENT_RANGE, new VectorSymbolNode({
          symbol: `${baseVector.symbol}<sub>${VectorAdditionStrings.symbol.y}</sub>`,
          showVectorArrow: false,
          maxWidth: LABEL_MAX_WIDTH
        }));
      } else {
        // Magnitude
        leftNumberPickerAndLabel = createNumberPickerWithLabel(baseVector.magnitudeProperty, VectorAdditionConstants.MAGNITUDE_RANGE, new VectorSymbolNode({
          symbol: baseVector.symbol,
          includeAbsoluteValueBars: true,
          maxWidth: LABEL_MAX_WIDTH
        }));

        // Angle
        rightNumberPickerAndLabel = createNumberPickerWithLabel(baseVector.angleDegreesProperty, VectorAdditionConstants.ANGLE_RANGE, new RichText(`${MathSymbols.THETA}<sub>${baseVector.symbol}</sub>`, {
          font: VectorAdditionConstants.EQUATION_SYMBOL_FONT,
          maxWidth: LABEL_MAX_WIDTH
        }), {
          numberPickerOptions: {
            // increment by the polar angle interval
            incrementFunction: value => value + VectorAdditionConstants.POLAR_ANGLE_INTERVAL,
            decrementFunction: value => value - VectorAdditionConstants.POLAR_ANGLE_INTERVAL
          }
        });
      }

      // Displayed Horizontally, push a HBox to the content children array
      pickers.push(new HBox({
        align: 'origin',
        spacing: options.xSpacing,
        children: [leftNumberPickerAndLabel, rightNumberPickerAndLabel]
      }));
    });
    const pickersVBox = new VBox({
      children: pickers,
      spacing: options.ySpacing,
      align: 'center'
    });

    // Ensure that the accordion box is a fixed width.
    const strut = new HStrut(options.contentWidth, {
      pickable: false,
      center: pickersVBox.center
    });
    const fixedWidthPickers = new Node({
      children: [strut, pickersVBox]
    });

    // Create the checkbox that toggles the visibility of Base Vectors
    const baseVectorsCheckbox = new BaseVectorsCheckbox(baseVectorsVisibleProperty, vectorSet.vectorColorPalette);
    const accordionBoxContent = new VBox({
      children: [fixedWidthPickers, baseVectorsCheckbox],
      spacing: options.ySpacing,
      align: 'left',
      maxWidth: options.contentWidth
    });
    super(accordionBoxContent, options);

    // When the box is collapsed, cancel interactions.
    // unlink is not necessary, exists for the lifetime of the sim.
    this.expandedProperty.lazyLink(expanded => {
      if (!expanded) {
        this.interruptSubtreeInput();
      }
    });
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'BaseVectorsAccordionBox is not intended to be disposed');
  }
}

/**
 * Layouts a VectorSymbolNode, a equals sign (Text), and a NumberPicker horizontally in a HBox.
 *
 * The VectorSymbolNode is then aligned in a AlignBox to ensure the correct alignment and sizing, which ensures that
 * all HBoxes have equal widths (since the NumberPicker and the equals sign Text don't change size).
 *
 * @param {NumberProperty} numberProperty - number Property that goes in the NumberPicker
 * @param {Range} numberRange - static numberRange of the number Property
 * @param {Node} vectorSymbolNode
 * @param {Object} [options]
 * @returns {HBox}
 */
function createNumberPickerWithLabel(numberProperty, numberRange, vectorSymbolNode, options) {
  options = merge({
    // options passed to NumberPicker
    numberPickerOptions: merge({}, VectorAdditionConstants.NUMBER_PICKER_OPTIONS, {
      touchAreaXDilation: 20,
      touchAreaYDilation: 10
    }),
    equalsSignFont: VectorAdditionConstants.EQUATION_FONT,
    // {Font} font for the equals sign text
    spacing: 3 // {number} space around the equals sign
  }, options);
  const equalsSign = new Text(MathSymbols.EQUAL_TO, {
    font: options.equalsSignFont
  });

  // Empirically set the vertical position of the NumberPicker, and wrap it in a Node to work with HBox.
  // See https://github.com/phetsims/vector-addition/issues/209
  const numberPicker = new NumberPicker(numberProperty, new Property(numberRange), options.numberPickerOptions);
  numberPicker.centerY = -equalsSign.height / 3;
  const numberPickerParent = new Node({
    children: [numberPicker]
  });
  return new HBox({
    align: 'origin',
    spacing: options.spacing,
    children: [vectorSymbolNode, equalsSign, numberPickerParent]
  });
}
vectorAddition.register('BaseVectorsAccordionBox', BaseVectorsAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJQcm9wZXJ0eSIsIm1lcmdlIiwiTWF0aFN5bWJvbHMiLCJIQm94IiwiSFN0cnV0IiwiTm9kZSIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJBY2NvcmRpb25Cb3giLCJOdW1iZXJQaWNrZXIiLCJDb29yZGluYXRlU25hcE1vZGVzIiwiVmVjdG9yQWRkaXRpb25Db25zdGFudHMiLCJWZWN0b3JTeW1ib2xOb2RlIiwidmVjdG9yQWRkaXRpb24iLCJWZWN0b3JBZGRpdGlvblN0cmluZ3MiLCJFcXVhdGlvbnNWZWN0b3JTZXQiLCJCYXNlVmVjdG9yc0NoZWNrYm94IiwiTEFCRUxfTUFYX1dJRFRIIiwiQmFzZVZlY3RvcnNBY2NvcmRpb25Cb3giLCJjb25zdHJ1Y3RvciIsImJhc2VWZWN0b3JzVmlzaWJsZVByb3BlcnR5IiwiY29vcmRpbmF0ZVNuYXBNb2RlIiwidmVjdG9yU2V0Iiwib3B0aW9ucyIsImFzc2VydCIsImVudW1lcmF0aW9uIiwiaW5jbHVkZXMiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsIkFDQ09SRElPTl9CT1hfT1BUSU9OUyIsInhTcGFjaW5nIiwieVNwYWNpbmciLCJjb250ZW50V2lkdGgiLCJCQVNFX1ZFQ1RPUlNfQUNDT1JESU9OX0JPWF9DT05URU5UX1dJRFRIIiwidGl0bGVOb2RlIiwiYmFzZVZlY3RvcnMiLCJmb250IiwiVElUTEVfRk9OVCIsIm1heFdpZHRoIiwicGlja2VycyIsInZlY3RvcnMiLCJmb3JFYWNoIiwidmVjdG9yIiwiYmFzZVZlY3RvciIsImxlZnROdW1iZXJQaWNrZXJBbmRMYWJlbCIsInJpZ2h0TnVtYmVyUGlja2VyQW5kTGFiZWwiLCJDQVJURVNJQU4iLCJjcmVhdGVOdW1iZXJQaWNrZXJXaXRoTGFiZWwiLCJ4Q29tcG9uZW50UHJvcGVydHkiLCJDT01QT05FTlRfUkFOR0UiLCJzeW1ib2wiLCJ4Iiwic2hvd1ZlY3RvckFycm93IiwieUNvbXBvbmVudFByb3BlcnR5IiwieSIsIm1hZ25pdHVkZVByb3BlcnR5IiwiTUFHTklUVURFX1JBTkdFIiwiaW5jbHVkZUFic29sdXRlVmFsdWVCYXJzIiwiYW5nbGVEZWdyZWVzUHJvcGVydHkiLCJBTkdMRV9SQU5HRSIsIlRIRVRBIiwiRVFVQVRJT05fU1lNQk9MX0ZPTlQiLCJudW1iZXJQaWNrZXJPcHRpb25zIiwiaW5jcmVtZW50RnVuY3Rpb24iLCJ2YWx1ZSIsIlBPTEFSX0FOR0xFX0lOVEVSVkFMIiwiZGVjcmVtZW50RnVuY3Rpb24iLCJwdXNoIiwiYWxpZ24iLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJwaWNrZXJzVkJveCIsInN0cnV0IiwicGlja2FibGUiLCJjZW50ZXIiLCJmaXhlZFdpZHRoUGlja2VycyIsImJhc2VWZWN0b3JzQ2hlY2tib3giLCJ2ZWN0b3JDb2xvclBhbGV0dGUiLCJhY2NvcmRpb25Cb3hDb250ZW50IiwiZXhwYW5kZWRQcm9wZXJ0eSIsImxhenlMaW5rIiwiZXhwYW5kZWQiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJkaXNwb3NlIiwibnVtYmVyUHJvcGVydHkiLCJudW1iZXJSYW5nZSIsInZlY3RvclN5bWJvbE5vZGUiLCJOVU1CRVJfUElDS0VSX09QVElPTlMiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJlcXVhbHNTaWduRm9udCIsIkVRVUFUSU9OX0ZPTlQiLCJlcXVhbHNTaWduIiwiRVFVQUxfVE8iLCJudW1iZXJQaWNrZXIiLCJjZW50ZXJZIiwiaGVpZ2h0IiwibnVtYmVyUGlja2VyUGFyZW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXNlVmVjdG9yc0FjY29yZGlvbkJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlVmVjdG9yc0FjY29yZGlvbkJveCBhcHBlYXJzIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSAnRXF1YXRpb25zJyBzY3JlZW4uIEl0IGNvbnRhaW5zIHBpY2tlcnMgZm9yIG1vZGlmeWluZyB0aGVcclxuICogYmFzZSB2ZWN0b3JzLCBhbmQgYSBjaGVja2JveCB0byBzaG93L2hpZGUgdGhlIGJhc2UgdmVjdG9ycy5cclxuICpcclxuICogJ0lzIGEnIHJlbGF0aW9uc2hpcCB3aXRoIEFjY29yZGlvbkJveCBidXQgYWRkcyB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uYWxpdHk6XHJcbiAqICAtIGFsbG93IHVzZXJzIHRvIGNoYW5nZSB0aGUgY29tcG9uZW50cyBvZiB0aGUgVmVjdG9ycyBvbiBDYXJ0ZXNpYW4gbW9kZSAodmlhIG51bWJlclBpY2tlcilcclxuICogIC0gYWxsb3cgdXNlcnMgdG8gY2hhbmdlIHRoZSBhbmdsZSBhbmQgdGhlIG1hZ25pdHVkZSBvZiB0aGUgVmVjdG9ycyBvbiBwb2xhciBtb2RlICh2aWEgbnVtYmVyUGlja2VyKVxyXG4gKiAgLSBhbGxvdyB1c2VycyB0byB0b2dnbGUgdGhlIHZpc2liaWxpdHkgb2YgdGhlIEJhc2UgVmVjdG9ycyAodmlhIGNoZWNrYm94KVxyXG4gKlxyXG4gKiBUaGlzIEFjY29yZGlvbkJveCBpcyBub3QgbWVhbnQgdG8gYmUgZGlzcG9zZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IHsgSEJveCwgSFN0cnV0LCBOb2RlLCBSaWNoVGV4dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBOdW1iZXJQaWNrZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL051bWJlclBpY2tlci5qcyc7XHJcbmltcG9ydCBDb29yZGluYXRlU25hcE1vZGVzIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Db29yZGluYXRlU25hcE1vZGVzLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9WZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBWZWN0b3JTeW1ib2xOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1ZlY3RvclN5bWJvbE5vZGUuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5pbXBvcnQgVmVjdG9yQWRkaXRpb25TdHJpbmdzIGZyb20gJy4uLy4uL1ZlY3RvckFkZGl0aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbnNWZWN0b3JTZXQgZnJvbSAnLi4vbW9kZWwvRXF1YXRpb25zVmVjdG9yU2V0LmpzJztcclxuaW1wb3J0IEJhc2VWZWN0b3JzQ2hlY2tib3ggZnJvbSAnLi9CYXNlVmVjdG9yc0NoZWNrYm94LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBMQUJFTF9NQVhfV0lEVEggPSAzMDsgLy8gbWF4V2lkdGggZm9yIHBpY2tlciBsYWJlbHMsIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VWZWN0b3JzQWNjb3JkaW9uQm94IGV4dGVuZHMgQWNjb3JkaW9uQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IGJhc2VWZWN0b3JzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtDb29yZGluYXRlU25hcE1vZGVzfSBjb29yZGluYXRlU25hcE1vZGVcclxuICAgKiBAcGFyYW0ge0VxdWF0aW9uc1ZlY3RvclNldH0gdmVjdG9yU2V0XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBiYXNlVmVjdG9yc1Zpc2libGVQcm9wZXJ0eSwgY29vcmRpbmF0ZVNuYXBNb2RlLCB2ZWN0b3JTZXQsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFzZVZlY3RvcnNWaXNpYmxlUHJvcGVydHkgaW5zdGFuY2VvZiBCb29sZWFuUHJvcGVydHksIGBpbnZhbGlkIGJhc2VWZWN0b3JzVmlzaWJsZVByb3BlcnR5OiAke2Jhc2VWZWN0b3JzVmlzaWJsZVByb3BlcnR5fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIENvb3JkaW5hdGVTbmFwTW9kZXMuZW51bWVyYXRpb24uaW5jbHVkZXMoIGNvb3JkaW5hdGVTbmFwTW9kZSApLCBgaW52YWxpZCBjb29yZGluYXRlU25hcE1vZGU6ICR7Y29vcmRpbmF0ZVNuYXBNb2RlfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlY3RvclNldCBpbnN0YW5jZW9mIEVxdWF0aW9uc1ZlY3RvclNldCwgYGludmFsaWQgdmVjdG9yU2V0OiAke3ZlY3RvclNldH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSwgYEV4dHJhIHByb3RvdHlwZSBvbiBvcHRpb25zOiAke29wdGlvbnN9YCApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLkFDQ09SRElPTl9CT1hfT1BUSU9OUywge1xyXG5cclxuICAgICAgLy8gc3BlY2lmaWMgdG8gdGhpcyBjbGFzc1xyXG4gICAgICB4U3BhY2luZzogMTEsIC8vIHtudW1iZXJ9IHNwYWNpbmcgYmV0d2VlbiB0aGUgbGVmdCBOdW1iZXJQaWNrZXIgYW5kIHRoZSByaWdodCBsYWJlbFxyXG4gICAgICB5U3BhY2luZzogMTcsIC8vIHtudW1iZXJ9IHkgc3BhY2luZyBiZXR3ZWVuIFVJIGNvbXBvbmVudHNcclxuICAgICAgY29udGVudFdpZHRoOiBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5CQVNFX1ZFQ1RPUlNfQUNDT1JESU9OX0JPWF9DT05URU5UX1dJRFRILCAvLyBmaXhlZCBjb250ZW50IHdpZHRoXHJcblxyXG4gICAgICAvLyBzdXBlciBjbGFzcyBvcHRpb25zXHJcbiAgICAgIHRpdGxlTm9kZTogbmV3IFRleHQoIFZlY3RvckFkZGl0aW9uU3RyaW5ncy5iYXNlVmVjdG9ycywgeyBmb250OiBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5USVRMRV9GT05UIH0gKVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcblxyXG4gICAgLy8gQXNzaWduIGEgbWF4IHdpZHRoIG9mIHRoZSB0aXRsZSBub2RlLlxyXG4gICAgb3B0aW9ucy50aXRsZU5vZGUubWF4V2lkdGggPSAwLjc1ICogb3B0aW9ucy5jb250ZW50V2lkdGg7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBDcmVhdGUgdGhlIE51bWJlciBQaWNrZXJzIC8gbGFiZWxzXHJcbiAgICAvL1xyXG4gICAgLy8gRWFjaCBWZWN0b3IgaW4gdGhlIHZlY3RvclNldCBnZXRzIDIgTnVtYmVyUGlja2VycyBkaXNwbGF5ZWQgaG9yaXpvbnRhbGx5LiBFYWNoIE51bWJlclBpY2tlciBoYXNcclxuICAgIC8vIGEgJ2xhYmVsJy5cclxuICAgIC8vXHJcbiAgICAvLyBPbiBDYXJ0ZXNpYW4sIHRoZSB0d28gTnVtYmVyUGlja2VycyB0b2dnbGUgdGhlIFggYW5kIHRoZSBZIGNvbXBvbmVudCByZXNwZWN0aXZlbHkuXHJcbiAgICAvLyBPbiBQb2xhciwgdGhlIHR3byBOdW1iZXJQaWNrZXJzIHRvZ2dsZSB0aGUgbWFnbml0dWRlIGFuZCB0aGUgYW5nbGUgcmVzcGVjdGl2ZWx5LlxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY29uc3QgcGlja2VycyA9IFtdOyAvLyB7SEJveFtdfSBwYWlycyBvZiBwaWNrZXJzIGFuZCB0aGVpciBsYWJlbHNcclxuXHJcbiAgICAvLyBFYWNoIFZlY3RvciBpbiB0aGUgdmVjdG9yU2V0IGdldHMgMiBOdW1iZXJQaWNrZXJzLCBzbyBsb29wIHRocm91Z2ggdGhlIHZlY3RvclNldFxyXG4gICAgdmVjdG9yU2V0LnZlY3RvcnMuZm9yRWFjaCggdmVjdG9yID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IGJhc2VWZWN0b3IgPSB2ZWN0b3IuYmFzZVZlY3RvcjsgLy8gY29udmVuaWVuY2UgcmVmZXJlbmNlXHJcblxyXG4gICAgICAvLyBFbXB0eSByZWZlcmVuY2VzIHRvIHRoZSAyIE51bWJlclBpY2tlcnMvbGFiZWxzIHBlciBWZWN0b3IuIFRvIGJlIHNldCBsYXRlci5cclxuICAgICAgbGV0IGxlZnROdW1iZXJQaWNrZXJBbmRMYWJlbDtcclxuICAgICAgbGV0IHJpZ2h0TnVtYmVyUGlja2VyQW5kTGFiZWw7XHJcblxyXG4gICAgICBpZiAoIGNvb3JkaW5hdGVTbmFwTW9kZSA9PT0gQ29vcmRpbmF0ZVNuYXBNb2Rlcy5DQVJURVNJQU4gKSB7XHJcblxyXG4gICAgICAgIC8vIFggQ29tcG9uZW50XHJcbiAgICAgICAgbGVmdE51bWJlclBpY2tlckFuZExhYmVsID0gY3JlYXRlTnVtYmVyUGlja2VyV2l0aExhYmVsKFxyXG4gICAgICAgICAgYmFzZVZlY3Rvci54Q29tcG9uZW50UHJvcGVydHksXHJcbiAgICAgICAgICBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5DT01QT05FTlRfUkFOR0UsXHJcbiAgICAgICAgICBuZXcgVmVjdG9yU3ltYm9sTm9kZSgge1xyXG4gICAgICAgICAgICBzeW1ib2w6IGAke2Jhc2VWZWN0b3Iuc3ltYm9sfTxzdWI+JHtWZWN0b3JBZGRpdGlvblN0cmluZ3Muc3ltYm9sLnh9PC9zdWI+YCxcclxuICAgICAgICAgICAgc2hvd1ZlY3RvckFycm93OiBmYWxzZSxcclxuICAgICAgICAgICAgbWF4V2lkdGg6IExBQkVMX01BWF9XSURUSFxyXG4gICAgICAgICAgfSApICk7XHJcblxyXG4gICAgICAgIC8vIFkgQ29tcG9uZW50XHJcbiAgICAgICAgcmlnaHROdW1iZXJQaWNrZXJBbmRMYWJlbCA9IGNyZWF0ZU51bWJlclBpY2tlcldpdGhMYWJlbChcclxuICAgICAgICAgIGJhc2VWZWN0b3IueUNvbXBvbmVudFByb3BlcnR5LFxyXG4gICAgICAgICAgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuQ09NUE9ORU5UX1JBTkdFLFxyXG4gICAgICAgICAgbmV3IFZlY3RvclN5bWJvbE5vZGUoIHtcclxuICAgICAgICAgICAgc3ltYm9sOiBgJHtiYXNlVmVjdG9yLnN5bWJvbH08c3ViPiR7VmVjdG9yQWRkaXRpb25TdHJpbmdzLnN5bWJvbC55fTwvc3ViPmAsXHJcbiAgICAgICAgICAgIHNob3dWZWN0b3JBcnJvdzogZmFsc2UsXHJcbiAgICAgICAgICAgIG1heFdpZHRoOiBMQUJFTF9NQVhfV0lEVEhcclxuICAgICAgICAgIH0gKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBNYWduaXR1ZGVcclxuICAgICAgICBsZWZ0TnVtYmVyUGlja2VyQW5kTGFiZWwgPSBjcmVhdGVOdW1iZXJQaWNrZXJXaXRoTGFiZWwoXHJcbiAgICAgICAgICBiYXNlVmVjdG9yLm1hZ25pdHVkZVByb3BlcnR5LFxyXG4gICAgICAgICAgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuTUFHTklUVURFX1JBTkdFLFxyXG4gICAgICAgICAgbmV3IFZlY3RvclN5bWJvbE5vZGUoIHtcclxuICAgICAgICAgICAgc3ltYm9sOiBiYXNlVmVjdG9yLnN5bWJvbCxcclxuICAgICAgICAgICAgaW5jbHVkZUFic29sdXRlVmFsdWVCYXJzOiB0cnVlLFxyXG4gICAgICAgICAgICBtYXhXaWR0aDogTEFCRUxfTUFYX1dJRFRIXHJcbiAgICAgICAgICB9ICkgKTtcclxuXHJcbiAgICAgICAgLy8gQW5nbGVcclxuICAgICAgICByaWdodE51bWJlclBpY2tlckFuZExhYmVsID0gY3JlYXRlTnVtYmVyUGlja2VyV2l0aExhYmVsKFxyXG4gICAgICAgICAgYmFzZVZlY3Rvci5hbmdsZURlZ3JlZXNQcm9wZXJ0eSxcclxuICAgICAgICAgIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLkFOR0xFX1JBTkdFLFxyXG4gICAgICAgICAgbmV3IFJpY2hUZXh0KCBgJHtNYXRoU3ltYm9scy5USEVUQX08c3ViPiR7YmFzZVZlY3Rvci5zeW1ib2x9PC9zdWI+YCwge1xyXG4gICAgICAgICAgICBmb250OiBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5FUVVBVElPTl9TWU1CT0xfRk9OVCxcclxuICAgICAgICAgICAgbWF4V2lkdGg6IExBQkVMX01BWF9XSURUSFxyXG4gICAgICAgICAgfSApLCB7XHJcbiAgICAgICAgICAgIG51bWJlclBpY2tlck9wdGlvbnM6IHsgLy8gaW5jcmVtZW50IGJ5IHRoZSBwb2xhciBhbmdsZSBpbnRlcnZhbFxyXG4gICAgICAgICAgICAgIGluY3JlbWVudEZ1bmN0aW9uOiB2YWx1ZSA9PiB2YWx1ZSArIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlBPTEFSX0FOR0xFX0lOVEVSVkFMLFxyXG4gICAgICAgICAgICAgIGRlY3JlbWVudEZ1bmN0aW9uOiB2YWx1ZSA9PiB2YWx1ZSAtIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlBPTEFSX0FOR0xFX0lOVEVSVkFMXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGlzcGxheWVkIEhvcml6b250YWxseSwgcHVzaCBhIEhCb3ggdG8gdGhlIGNvbnRlbnQgY2hpbGRyZW4gYXJyYXlcclxuICAgICAgcGlja2Vycy5wdXNoKCBuZXcgSEJveCgge1xyXG4gICAgICAgIGFsaWduOiAnb3JpZ2luJyxcclxuICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnhTcGFjaW5nLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbIGxlZnROdW1iZXJQaWNrZXJBbmRMYWJlbCwgcmlnaHROdW1iZXJQaWNrZXJBbmRMYWJlbCBdXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBpY2tlcnNWQm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IHBpY2tlcnMsXHJcbiAgICAgIHNwYWNpbmc6IG9wdGlvbnMueVNwYWNpbmcsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBhY2NvcmRpb24gYm94IGlzIGEgZml4ZWQgd2lkdGguXHJcbiAgICBjb25zdCBzdHJ1dCA9IG5ldyBIU3RydXQoIG9wdGlvbnMuY29udGVudFdpZHRoLCB7XHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgY2VudGVyOiBwaWNrZXJzVkJveC5jZW50ZXJcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGZpeGVkV2lkdGhQaWNrZXJzID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgc3RydXQsIHBpY2tlcnNWQm94IF0gfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgY2hlY2tib3ggdGhhdCB0b2dnbGVzIHRoZSB2aXNpYmlsaXR5IG9mIEJhc2UgVmVjdG9yc1xyXG4gICAgY29uc3QgYmFzZVZlY3RvcnNDaGVja2JveCA9IG5ldyBCYXNlVmVjdG9yc0NoZWNrYm94KCBiYXNlVmVjdG9yc1Zpc2libGVQcm9wZXJ0eSwgdmVjdG9yU2V0LnZlY3RvckNvbG9yUGFsZXR0ZSApO1xyXG5cclxuICAgIGNvbnN0IGFjY29yZGlvbkJveENvbnRlbnQgPSBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBmaXhlZFdpZHRoUGlja2VycywgYmFzZVZlY3RvcnNDaGVja2JveCBdLFxyXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLnlTcGFjaW5nLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy5jb250ZW50V2lkdGhcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggYWNjb3JkaW9uQm94Q29udGVudCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIGJveCBpcyBjb2xsYXBzZWQsIGNhbmNlbCBpbnRlcmFjdGlvbnMuXHJcbiAgICAvLyB1bmxpbmsgaXMgbm90IG5lY2Vzc2FyeSwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbS5cclxuICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS5sYXp5TGluayggZXhwYW5kZWQgPT4ge1xyXG4gICAgICBpZiAoICFleHBhbmRlZCApIHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnQmFzZVZlY3RvcnNBY2NvcmRpb25Cb3ggaXMgbm90IGludGVuZGVkIHRvIGJlIGRpc3Bvc2VkJyApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIExheW91dHMgYSBWZWN0b3JTeW1ib2xOb2RlLCBhIGVxdWFscyBzaWduIChUZXh0KSwgYW5kIGEgTnVtYmVyUGlja2VyIGhvcml6b250YWxseSBpbiBhIEhCb3guXHJcbiAqXHJcbiAqIFRoZSBWZWN0b3JTeW1ib2xOb2RlIGlzIHRoZW4gYWxpZ25lZCBpbiBhIEFsaWduQm94IHRvIGVuc3VyZSB0aGUgY29ycmVjdCBhbGlnbm1lbnQgYW5kIHNpemluZywgd2hpY2ggZW5zdXJlcyB0aGF0XHJcbiAqIGFsbCBIQm94ZXMgaGF2ZSBlcXVhbCB3aWR0aHMgKHNpbmNlIHRoZSBOdW1iZXJQaWNrZXIgYW5kIHRoZSBlcXVhbHMgc2lnbiBUZXh0IGRvbid0IGNoYW5nZSBzaXplKS5cclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJQcm9wZXJ0eX0gbnVtYmVyUHJvcGVydHkgLSBudW1iZXIgUHJvcGVydHkgdGhhdCBnb2VzIGluIHRoZSBOdW1iZXJQaWNrZXJcclxuICogQHBhcmFtIHtSYW5nZX0gbnVtYmVyUmFuZ2UgLSBzdGF0aWMgbnVtYmVyUmFuZ2Ugb2YgdGhlIG51bWJlciBQcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge05vZGV9IHZlY3RvclN5bWJvbE5vZGVcclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gKiBAcmV0dXJucyB7SEJveH1cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZU51bWJlclBpY2tlcldpdGhMYWJlbCggbnVtYmVyUHJvcGVydHksIG51bWJlclJhbmdlLCB2ZWN0b3JTeW1ib2xOb2RlLCBvcHRpb25zICkge1xyXG5cclxuICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAvLyBvcHRpb25zIHBhc3NlZCB0byBOdW1iZXJQaWNrZXJcclxuICAgIG51bWJlclBpY2tlck9wdGlvbnM6IG1lcmdlKCB7fSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuTlVNQkVSX1BJQ0tFUl9PUFRJT05TLCB7XHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMjAsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTBcclxuICAgIH0gKSxcclxuXHJcbiAgICBlcXVhbHNTaWduRm9udDogVmVjdG9yQWRkaXRpb25Db25zdGFudHMuRVFVQVRJT05fRk9OVCwgIC8vIHtGb250fSBmb250IGZvciB0aGUgZXF1YWxzIHNpZ24gdGV4dFxyXG4gICAgc3BhY2luZzogMyAvLyB7bnVtYmVyfSBzcGFjZSBhcm91bmQgdGhlIGVxdWFscyBzaWduXHJcblxyXG4gIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgY29uc3QgZXF1YWxzU2lnbiA9IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5FUVVBTF9UTywgeyBmb250OiBvcHRpb25zLmVxdWFsc1NpZ25Gb250IH0gKTtcclxuXHJcbiAgLy8gRW1waXJpY2FsbHkgc2V0IHRoZSB2ZXJ0aWNhbCBwb3NpdGlvbiBvZiB0aGUgTnVtYmVyUGlja2VyLCBhbmQgd3JhcCBpdCBpbiBhIE5vZGUgdG8gd29yayB3aXRoIEhCb3guXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWN0b3ItYWRkaXRpb24vaXNzdWVzLzIwOVxyXG4gIGNvbnN0IG51bWJlclBpY2tlciA9IG5ldyBOdW1iZXJQaWNrZXIoIG51bWJlclByb3BlcnR5LCBuZXcgUHJvcGVydHkoIG51bWJlclJhbmdlICksIG9wdGlvbnMubnVtYmVyUGlja2VyT3B0aW9ucyApO1xyXG4gIG51bWJlclBpY2tlci5jZW50ZXJZID0gLWVxdWFsc1NpZ24uaGVpZ2h0IC8gMztcclxuICBjb25zdCBudW1iZXJQaWNrZXJQYXJlbnQgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBudW1iZXJQaWNrZXIgXSB9ICk7XHJcblxyXG4gIHJldHVybiBuZXcgSEJveCgge1xyXG4gICAgYWxpZ246ICdvcmlnaW4nLFxyXG4gICAgc3BhY2luZzogb3B0aW9ucy5zcGFjaW5nLFxyXG4gICAgY2hpbGRyZW46IFsgdmVjdG9yU3ltYm9sTm9kZSwgZXF1YWxzU2lnbiwgbnVtYmVyUGlja2VyUGFyZW50IF1cclxuICB9ICk7XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnQmFzZVZlY3RvcnNBY2NvcmRpb25Cb3gnLCBCYXNlVmVjdG9yc0FjY29yZGlvbkJveCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxTQUFTQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM1RixPQUFPQyxZQUFZLE1BQU0sb0NBQW9DO0FBQzdELE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsbUJBQW1CLE1BQU0sMkNBQTJDO0FBQzNFLE9BQU9DLHVCQUF1QixNQUFNLHlDQUF5QztBQUM3RSxPQUFPQyxnQkFBZ0IsTUFBTSx1Q0FBdUM7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0Msa0JBQWtCLE1BQU0sZ0NBQWdDO0FBQy9ELE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjs7QUFFMUQ7QUFDQSxNQUFNQyxlQUFlLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBRTVCLGVBQWUsTUFBTUMsdUJBQXVCLFNBQVNWLFlBQVksQ0FBQztFQUVoRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVcsV0FBV0EsQ0FBRUMsMEJBQTBCLEVBQUVDLGtCQUFrQixFQUFFQyxTQUFTLEVBQUVDLE9BQU8sRUFBRztJQUVoRkMs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