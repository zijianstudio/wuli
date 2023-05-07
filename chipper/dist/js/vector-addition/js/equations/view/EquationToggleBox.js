// Copyright 2019-2023, University of Colorado Boulder

/**
 * EquationToggleBox is the toggle box labeled 'Equation' in the 'Equations' screen.
 * It allows the user to select the form of the equation, and change the coefficients of the vectors.
 *
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import { AlignBox, AlignGroup, HBox, Node, Text } from '../../../../scenery/js/imports.js';
import VectorAdditionConstants from '../../common/VectorAdditionConstants.js';
import ToggleBox from '../../common/view/ToggleBox.js';
import vectorAddition from '../../vectorAddition.js';
import VectorAdditionStrings from '../../VectorAdditionStrings.js';
import EquationsVectorSet from '../model/EquationsVectorSet.js';
import EquationTypes from '../model/EquationTypes.js';
import EquationTypeNode from './EquationTypeNode.js';
import EquationTypesRadioButtonGroup from './EquationTypesRadioButtonGroup.js';

// constants
const TEXT_OPTIONS = {
  font: VectorAdditionConstants.EQUATION_FONT
};
export default class EquationToggleBox extends ToggleBox {
  /**
   * @param {EquationsVectorSet} vectorSet
   * @param {EnumerationProperty.<EquationTypes>} equationTypeProperty
   * @param {AlignGroup} equationButtonsAlignGroup - used to make all equation radio buttons the same size
   * @param {AlignGroup} equationsAlignGroup - used to make all interactive equations the same size
   * @param {Object} [options]
   */
  constructor(vectorSet, equationTypeProperty, equationButtonsAlignGroup, equationsAlignGroup, options) {
    assert && assert(vectorSet instanceof EquationsVectorSet, `invalid vectorSet: ${vectorSet}`);
    assert && assert(equationTypeProperty instanceof EnumerationProperty, `invalid equationTypeProperty: ${equationTypeProperty}`);
    assert && assert(equationButtonsAlignGroup instanceof AlignGroup, `invalid equationButtonsAlignGroup: ${equationButtonsAlignGroup}`);
    assert && assert(equationsAlignGroup instanceof AlignGroup, `invalid equationsAlignGroup: ${equationsAlignGroup}`);
    assert && assert(!options || Object.getPrototypeOf(options) === Object.prototype, `Extra prototype on options: ${options}`);
    options = merge({
      // superclass options
      contentFixedWidth: 670,
      contentFixedHeight: 50,
      contentXSpacing: 17
    }, options);

    // When the toggle box is collapsed, show 'Equation'
    const closedContent = new Text(VectorAdditionStrings.equation, TEXT_OPTIONS);

    // Radio buttons for selecting equation type
    const radioButtonGroup = new EquationTypesRadioButtonGroup(equationTypeProperty, vectorSet.symbols, equationButtonsAlignGroup, {
      scale: 0.75
    });

    // Create an equation of each type, only one of which will be visible at a time.
    const equationsParent = new Node();
    EquationTypes.enumeration.values.forEach(equationType => {
      const equationTypeNode = new EquationTypeNode(vectorSet, equationType);
      equationsParent.addChild(new AlignBox(equationTypeNode, {
        group: equationsAlignGroup,
        xAlign: 'left'
      }));

      // unlink is unnecessary, exists for the lifetime of the sim.
      equationTypeProperty.link(() => {
        equationTypeNode.visible = equationType === equationTypeProperty.value;
      });
    });

    // Radio buttons on the left, equation on the right. See https://github.com/phetsims/vector-addition/issues/128
    const openContent = new HBox({
      children: [radioButtonGroup, equationsParent],
      spacing: 55
    });
    super(closedContent, openContent, options);

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
    assert && assert(false, 'EquationToggleBox is not intended to be disposed');
  }
}
vectorAddition.register('EquationToggleBox', EquationToggleBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwibWVyZ2UiLCJBbGlnbkJveCIsIkFsaWduR3JvdXAiLCJIQm94IiwiTm9kZSIsIlRleHQiLCJWZWN0b3JBZGRpdGlvbkNvbnN0YW50cyIsIlRvZ2dsZUJveCIsInZlY3RvckFkZGl0aW9uIiwiVmVjdG9yQWRkaXRpb25TdHJpbmdzIiwiRXF1YXRpb25zVmVjdG9yU2V0IiwiRXF1YXRpb25UeXBlcyIsIkVxdWF0aW9uVHlwZU5vZGUiLCJFcXVhdGlvblR5cGVzUmFkaW9CdXR0b25Hcm91cCIsIlRFWFRfT1BUSU9OUyIsImZvbnQiLCJFUVVBVElPTl9GT05UIiwiRXF1YXRpb25Ub2dnbGVCb3giLCJjb25zdHJ1Y3RvciIsInZlY3RvclNldCIsImVxdWF0aW9uVHlwZVByb3BlcnR5IiwiZXF1YXRpb25CdXR0b25zQWxpZ25Hcm91cCIsImVxdWF0aW9uc0FsaWduR3JvdXAiLCJvcHRpb25zIiwiYXNzZXJ0IiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJjb250ZW50Rml4ZWRXaWR0aCIsImNvbnRlbnRGaXhlZEhlaWdodCIsImNvbnRlbnRYU3BhY2luZyIsImNsb3NlZENvbnRlbnQiLCJlcXVhdGlvbiIsInJhZGlvQnV0dG9uR3JvdXAiLCJzeW1ib2xzIiwic2NhbGUiLCJlcXVhdGlvbnNQYXJlbnQiLCJlbnVtZXJhdGlvbiIsInZhbHVlcyIsImZvckVhY2giLCJlcXVhdGlvblR5cGUiLCJlcXVhdGlvblR5cGVOb2RlIiwiYWRkQ2hpbGQiLCJncm91cCIsInhBbGlnbiIsImxpbmsiLCJ2aXNpYmxlIiwidmFsdWUiLCJvcGVuQ29udGVudCIsImNoaWxkcmVuIiwic3BhY2luZyIsImV4cGFuZGVkUHJvcGVydHkiLCJsYXp5TGluayIsImV4cGFuZGVkIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXF1YXRpb25Ub2dnbGVCb3guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRXF1YXRpb25Ub2dnbGVCb3ggaXMgdGhlIHRvZ2dsZSBib3ggbGFiZWxlZCAnRXF1YXRpb24nIGluIHRoZSAnRXF1YXRpb25zJyBzY3JlZW4uXHJcbiAqIEl0IGFsbG93cyB0aGUgdXNlciB0byBzZWxlY3QgdGhlIGZvcm0gb2YgdGhlIGVxdWF0aW9uLCBhbmQgY2hhbmdlIHRoZSBjb2VmZmljaWVudHMgb2YgdGhlIHZlY3RvcnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgQWxpZ25Hcm91cCwgSEJveCwgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vVmVjdG9yQWRkaXRpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgVG9nZ2xlQm94IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1RvZ2dsZUJveC5qcyc7XHJcbmltcG9ydCB2ZWN0b3JBZGRpdGlvbiBmcm9tICcuLi8uLi92ZWN0b3JBZGRpdGlvbi5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvblN0cmluZ3MgZnJvbSAnLi4vLi4vVmVjdG9yQWRkaXRpb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uc1ZlY3RvclNldCBmcm9tICcuLi9tb2RlbC9FcXVhdGlvbnNWZWN0b3JTZXQuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25UeXBlcyBmcm9tICcuLi9tb2RlbC9FcXVhdGlvblR5cGVzLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uVHlwZU5vZGUgZnJvbSAnLi9FcXVhdGlvblR5cGVOb2RlLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uVHlwZXNSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4vRXF1YXRpb25UeXBlc1JhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRFWFRfT1BUSU9OUyA9IHsgZm9udDogVmVjdG9yQWRkaXRpb25Db25zdGFudHMuRVFVQVRJT05fRk9OVCB9O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXF1YXRpb25Ub2dnbGVCb3ggZXh0ZW5kcyBUb2dnbGVCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0VxdWF0aW9uc1ZlY3RvclNldH0gdmVjdG9yU2V0XHJcbiAgICogQHBhcmFtIHtFbnVtZXJhdGlvblByb3BlcnR5LjxFcXVhdGlvblR5cGVzPn0gZXF1YXRpb25UeXBlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0FsaWduR3JvdXB9IGVxdWF0aW9uQnV0dG9uc0FsaWduR3JvdXAgLSB1c2VkIHRvIG1ha2UgYWxsIGVxdWF0aW9uIHJhZGlvIGJ1dHRvbnMgdGhlIHNhbWUgc2l6ZVxyXG4gICAqIEBwYXJhbSB7QWxpZ25Hcm91cH0gZXF1YXRpb25zQWxpZ25Hcm91cCAtIHVzZWQgdG8gbWFrZSBhbGwgaW50ZXJhY3RpdmUgZXF1YXRpb25zIHRoZSBzYW1lIHNpemVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHZlY3RvclNldCwgZXF1YXRpb25UeXBlUHJvcGVydHksIGVxdWF0aW9uQnV0dG9uc0FsaWduR3JvdXAsIGVxdWF0aW9uc0FsaWduR3JvdXAsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVjdG9yU2V0IGluc3RhbmNlb2YgRXF1YXRpb25zVmVjdG9yU2V0LCBgaW52YWxpZCB2ZWN0b3JTZXQ6ICR7dmVjdG9yU2V0fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVxdWF0aW9uVHlwZVByb3BlcnR5IGluc3RhbmNlb2YgRW51bWVyYXRpb25Qcm9wZXJ0eSwgYGludmFsaWQgZXF1YXRpb25UeXBlUHJvcGVydHk6ICR7ZXF1YXRpb25UeXBlUHJvcGVydHl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZXF1YXRpb25CdXR0b25zQWxpZ25Hcm91cCBpbnN0YW5jZW9mIEFsaWduR3JvdXAsIGBpbnZhbGlkIGVxdWF0aW9uQnV0dG9uc0FsaWduR3JvdXA6ICR7ZXF1YXRpb25CdXR0b25zQWxpZ25Hcm91cH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlcXVhdGlvbnNBbGlnbkdyb3VwIGluc3RhbmNlb2YgQWxpZ25Hcm91cCwgYGludmFsaWQgZXF1YXRpb25zQWxpZ25Hcm91cDogJHtlcXVhdGlvbnNBbGlnbkdyb3VwfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZiggb3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlLCBgRXh0cmEgcHJvdG90eXBlIG9uIG9wdGlvbnM6ICR7b3B0aW9uc31gICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBzdXBlcmNsYXNzIG9wdGlvbnNcclxuICAgICAgY29udGVudEZpeGVkV2lkdGg6IDY3MCxcclxuICAgICAgY29udGVudEZpeGVkSGVpZ2h0OiA1MCxcclxuICAgICAgY29udGVudFhTcGFjaW5nOiAxN1xyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB0b2dnbGUgYm94IGlzIGNvbGxhcHNlZCwgc2hvdyAnRXF1YXRpb24nXHJcbiAgICBjb25zdCBjbG9zZWRDb250ZW50ID0gbmV3IFRleHQoIFZlY3RvckFkZGl0aW9uU3RyaW5ncy5lcXVhdGlvbiwgVEVYVF9PUFRJT05TICk7XHJcblxyXG4gICAgLy8gUmFkaW8gYnV0dG9ucyBmb3Igc2VsZWN0aW5nIGVxdWF0aW9uIHR5cGVcclxuICAgIGNvbnN0IHJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgRXF1YXRpb25UeXBlc1JhZGlvQnV0dG9uR3JvdXAoXHJcbiAgICAgIGVxdWF0aW9uVHlwZVByb3BlcnR5LCB2ZWN0b3JTZXQuc3ltYm9scywgZXF1YXRpb25CdXR0b25zQWxpZ25Hcm91cCwge1xyXG4gICAgICAgIHNjYWxlOiAwLjc1XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW4gZXF1YXRpb24gb2YgZWFjaCB0eXBlLCBvbmx5IG9uZSBvZiB3aGljaCB3aWxsIGJlIHZpc2libGUgYXQgYSB0aW1lLlxyXG4gICAgY29uc3QgZXF1YXRpb25zUGFyZW50ID0gbmV3IE5vZGUoKTtcclxuICAgIEVxdWF0aW9uVHlwZXMuZW51bWVyYXRpb24udmFsdWVzLmZvckVhY2goIGVxdWF0aW9uVHlwZSA9PiB7XHJcblxyXG4gICAgICBjb25zdCBlcXVhdGlvblR5cGVOb2RlID0gbmV3IEVxdWF0aW9uVHlwZU5vZGUoIHZlY3RvclNldCwgZXF1YXRpb25UeXBlICk7XHJcbiAgICAgIGVxdWF0aW9uc1BhcmVudC5hZGRDaGlsZCggbmV3IEFsaWduQm94KCBlcXVhdGlvblR5cGVOb2RlLCB7XHJcbiAgICAgICAgZ3JvdXA6IGVxdWF0aW9uc0FsaWduR3JvdXAsXHJcbiAgICAgICAgeEFsaWduOiAnbGVmdCdcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICAvLyB1bmxpbmsgaXMgdW5uZWNlc3NhcnksIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICAgIGVxdWF0aW9uVHlwZVByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgICBlcXVhdGlvblR5cGVOb2RlLnZpc2libGUgPSAoIGVxdWF0aW9uVHlwZSA9PT0gZXF1YXRpb25UeXBlUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJhZGlvIGJ1dHRvbnMgb24gdGhlIGxlZnQsIGVxdWF0aW9uIG9uIHRoZSByaWdodC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWN0b3ItYWRkaXRpb24vaXNzdWVzLzEyOFxyXG4gICAgY29uc3Qgb3BlbkNvbnRlbnQgPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyByYWRpb0J1dHRvbkdyb3VwLCBlcXVhdGlvbnNQYXJlbnQgXSxcclxuICAgICAgc3BhY2luZzogNTVcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY2xvc2VkQ29udGVudCwgb3BlbkNvbnRlbnQsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBib3ggaXMgY29sbGFwc2VkLCBjYW5jZWwgaW50ZXJhY3Rpb25zLlxyXG4gICAgLy8gdW5saW5rIGlzIG5vdCBuZWNlc3NhcnksIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkubGF6eUxpbmsoIGV4cGFuZGVkID0+IHtcclxuICAgICAgaWYgKCAhZXhwYW5kZWQgKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ0VxdWF0aW9uVG9nZ2xlQm94IGlzIG5vdCBpbnRlbmRlZCB0byBiZSBkaXNwb3NlZCcgKTtcclxuICB9XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnRXF1YXRpb25Ub2dnbGVCb3gn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