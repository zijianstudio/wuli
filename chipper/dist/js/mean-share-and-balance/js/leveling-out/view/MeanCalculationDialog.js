// Copyright 2022, University of Colorado Boulder

/**
 * A dialog that shows different mathematical representations of the mean according to the sim's current data.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dialog from '../../../../sun/js/Dialog.js';
import meanShareAndBalance from '../../meanShareAndBalance.js';
import { GridBox, Line, Text, VBox } from '../../../../scenery/js/imports.js';
import Utils from '../../../../dot/js/Utils.js';
import Multilink from '../../../../axon/js/Multilink.js';
import MeanShareAndBalanceConstants from '../../common/MeanShareAndBalanceConstants.js';
import Panel from '../../../../sun/js/Panel.js';
import MeanShareAndBalanceStrings from '../../MeanShareAndBalanceStrings.js';
export default class MeanCalculationDialog extends Dialog {
  constructor(people, visibleProperty, notebookPaperBounds) {
    const meanTitleText = new Text(MeanShareAndBalanceStrings.meanStringProperty);
    const meanEqualsAdditionFractionText = new Text(MeanShareAndBalanceStrings.meanEqualsStringProperty);
    const meanEqualsFractionText = new Text(MeanShareAndBalanceStrings.meanEqualsStringProperty);
    const meanEqualsDecimalText = new Text(MeanShareAndBalanceStrings.meanEqualsStringProperty);
    const calculationNode = new GridBox({
      margin: 10
    });
    const panel = new Panel(calculationNode, {
      stroke: null,
      minWidth: notebookPaperBounds.width - 76.4,
      // the left and right margin calculated by Dialog.ts
      minHeight: notebookPaperBounds.height - 40 // the top/bottom margin, and y spacing implemented by Dialog.ts
    });

    const isActiveProperties = people.map(person => person.isActiveProperty);
    const numberOfChocolatesProperties = people.map(person => person.chocolateNumberProperty);
    Multilink.multilinkAny([...isActiveProperties, ...numberOfChocolatesProperties], () => {
      const numbers = people.filter(person => person.isActiveProperty.value).map(person => person.chocolateNumberProperty.value);
      const numberOfPeople = people.filter(person => person.isActiveProperty.value).length;

      // REVIEW: Can we align the numbers with the table spinners?  So correspondence is clear?
      const additionText = new Text(numbers.join(' + '));
      const additionFractionLine = new Line(0, 0, additionText.width, 0, {
        stroke: 'black'
      });
      const additionDenominatorText = new Text(numberOfPeople);
      const additionFraction = new VBox({
        children: [additionText, additionFractionLine, additionDenominatorText]
      });
      const numeratorText = new Text(_.sum(numbers));
      const fractionLine = new Line(0, 0, numeratorText.width, 0, {
        stroke: 'black'
      });
      const denominatorText = new Text(numberOfPeople);
      const fraction = new VBox({
        children: [numeratorText, fractionLine, denominatorText]
      });
      const decimalText = new Text(Utils.toFixedNumber(_.sum(numbers) / numberOfPeople, 2));
      calculationNode.rows = [[meanEqualsAdditionFractionText, additionFraction], [meanEqualsFractionText, fraction], [meanEqualsDecimalText, decimalText]];
    });
    super(panel, {
      title: meanTitleText,
      titleAlign: 'left',
      visibleProperty: visibleProperty,
      resize: false,
      centerY: MeanShareAndBalanceConstants.NOTEBOOK_PAPER_CENTER_Y,
      closeButtonListener: () => this.visibleProperty.set(false),
      // We specify the position manually
      // REVIEW: Where is x specified?
      layoutStrategy: _.noop
    });
  }
}
meanShareAndBalance.register('MeanCalculationDialog', MeanCalculationDialog);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaWFsb2ciLCJtZWFuU2hhcmVBbmRCYWxhbmNlIiwiR3JpZEJveCIsIkxpbmUiLCJUZXh0IiwiVkJveCIsIlV0aWxzIiwiTXVsdGlsaW5rIiwiTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cyIsIlBhbmVsIiwiTWVhblNoYXJlQW5kQmFsYW5jZVN0cmluZ3MiLCJNZWFuQ2FsY3VsYXRpb25EaWFsb2ciLCJjb25zdHJ1Y3RvciIsInBlb3BsZSIsInZpc2libGVQcm9wZXJ0eSIsIm5vdGVib29rUGFwZXJCb3VuZHMiLCJtZWFuVGl0bGVUZXh0IiwibWVhblN0cmluZ1Byb3BlcnR5IiwibWVhbkVxdWFsc0FkZGl0aW9uRnJhY3Rpb25UZXh0IiwibWVhbkVxdWFsc1N0cmluZ1Byb3BlcnR5IiwibWVhbkVxdWFsc0ZyYWN0aW9uVGV4dCIsIm1lYW5FcXVhbHNEZWNpbWFsVGV4dCIsImNhbGN1bGF0aW9uTm9kZSIsIm1hcmdpbiIsInBhbmVsIiwic3Ryb2tlIiwibWluV2lkdGgiLCJ3aWR0aCIsIm1pbkhlaWdodCIsImhlaWdodCIsImlzQWN0aXZlUHJvcGVydGllcyIsIm1hcCIsInBlcnNvbiIsImlzQWN0aXZlUHJvcGVydHkiLCJudW1iZXJPZkNob2NvbGF0ZXNQcm9wZXJ0aWVzIiwiY2hvY29sYXRlTnVtYmVyUHJvcGVydHkiLCJtdWx0aWxpbmtBbnkiLCJudW1iZXJzIiwiZmlsdGVyIiwidmFsdWUiLCJudW1iZXJPZlBlb3BsZSIsImxlbmd0aCIsImFkZGl0aW9uVGV4dCIsImpvaW4iLCJhZGRpdGlvbkZyYWN0aW9uTGluZSIsImFkZGl0aW9uRGVub21pbmF0b3JUZXh0IiwiYWRkaXRpb25GcmFjdGlvbiIsImNoaWxkcmVuIiwibnVtZXJhdG9yVGV4dCIsIl8iLCJzdW0iLCJmcmFjdGlvbkxpbmUiLCJkZW5vbWluYXRvclRleHQiLCJmcmFjdGlvbiIsImRlY2ltYWxUZXh0IiwidG9GaXhlZE51bWJlciIsInJvd3MiLCJ0aXRsZSIsInRpdGxlQWxpZ24iLCJyZXNpemUiLCJjZW50ZXJZIiwiTk9URUJPT0tfUEFQRVJfQ0VOVEVSX1kiLCJjbG9zZUJ1dHRvbkxpc3RlbmVyIiwic2V0IiwibGF5b3V0U3RyYXRlZ3kiLCJub29wIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNZWFuQ2FsY3VsYXRpb25EaWFsb2cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgZGlhbG9nIHRoYXQgc2hvd3MgZGlmZmVyZW50IG1hdGhlbWF0aWNhbCByZXByZXNlbnRhdGlvbnMgb2YgdGhlIG1lYW4gYWNjb3JkaW5nIHRvIHRoZSBzaW0ncyBjdXJyZW50IGRhdGEuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaWFsb2cgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0RpYWxvZy5qcyc7XHJcbmltcG9ydCBtZWFuU2hhcmVBbmRCYWxhbmNlIGZyb20gJy4uLy4uL21lYW5TaGFyZUFuZEJhbGFuY2UuanMnO1xyXG5pbXBvcnQgeyBHcmlkQm94LCBMaW5lLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBQZXJzb24gZnJvbSAnLi4vbW9kZWwvUGVyc29uLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9NZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IE1lYW5TaGFyZUFuZEJhbGFuY2VTdHJpbmdzIGZyb20gJy4uLy4uL01lYW5TaGFyZUFuZEJhbGFuY2VTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVhbkNhbGN1bGF0aW9uRGlhbG9nIGV4dGVuZHMgRGlhbG9nIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwZW9wbGU6IEFycmF5PFBlcnNvbj4sIHZpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIG5vdGVib29rUGFwZXJCb3VuZHM6IEJvdW5kczIgKSB7XHJcblxyXG4gICAgY29uc3QgbWVhblRpdGxlVGV4dCA9IG5ldyBUZXh0KCBNZWFuU2hhcmVBbmRCYWxhbmNlU3RyaW5ncy5tZWFuU3RyaW5nUHJvcGVydHkgKTtcclxuICAgIGNvbnN0IG1lYW5FcXVhbHNBZGRpdGlvbkZyYWN0aW9uVGV4dCA9IG5ldyBUZXh0KCBNZWFuU2hhcmVBbmRCYWxhbmNlU3RyaW5ncy5tZWFuRXF1YWxzU3RyaW5nUHJvcGVydHkgKTtcclxuICAgIGNvbnN0IG1lYW5FcXVhbHNGcmFjdGlvblRleHQgPSBuZXcgVGV4dCggTWVhblNoYXJlQW5kQmFsYW5jZVN0cmluZ3MubWVhbkVxdWFsc1N0cmluZ1Byb3BlcnR5ICk7XHJcbiAgICBjb25zdCBtZWFuRXF1YWxzRGVjaW1hbFRleHQgPSBuZXcgVGV4dCggTWVhblNoYXJlQW5kQmFsYW5jZVN0cmluZ3MubWVhbkVxdWFsc1N0cmluZ1Byb3BlcnR5ICk7XHJcblxyXG4gICAgY29uc3QgY2FsY3VsYXRpb25Ob2RlID0gbmV3IEdyaWRCb3goIHtcclxuICAgICAgbWFyZ2luOiAxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBhbmVsID0gbmV3IFBhbmVsKCBjYWxjdWxhdGlvbk5vZGUsIHtcclxuICAgICAgc3Ryb2tlOiBudWxsLFxyXG4gICAgICBtaW5XaWR0aDogbm90ZWJvb2tQYXBlckJvdW5kcy53aWR0aCAtIDc2LjQsIC8vIHRoZSBsZWZ0IGFuZCByaWdodCBtYXJnaW4gY2FsY3VsYXRlZCBieSBEaWFsb2cudHNcclxuICAgICAgbWluSGVpZ2h0OiBub3RlYm9va1BhcGVyQm91bmRzLmhlaWdodCAtIDQwIC8vIHRoZSB0b3AvYm90dG9tIG1hcmdpbiwgYW5kIHkgc3BhY2luZyBpbXBsZW1lbnRlZCBieSBEaWFsb2cudHNcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBpc0FjdGl2ZVByb3BlcnRpZXMgPSBwZW9wbGUubWFwKCBwZXJzb24gPT4gcGVyc29uLmlzQWN0aXZlUHJvcGVydHkgKTtcclxuICAgIGNvbnN0IG51bWJlck9mQ2hvY29sYXRlc1Byb3BlcnRpZXMgPSBwZW9wbGUubWFwKCBwZXJzb24gPT4gcGVyc29uLmNob2NvbGF0ZU51bWJlclByb3BlcnR5ICk7XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rQW55KCBbIC4uLmlzQWN0aXZlUHJvcGVydGllcywgLi4ubnVtYmVyT2ZDaG9jb2xhdGVzUHJvcGVydGllcyBdLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG51bWJlcnMgPSBwZW9wbGUuZmlsdGVyKCBwZXJzb24gPT4gcGVyc29uLmlzQWN0aXZlUHJvcGVydHkudmFsdWUgKS5tYXAoIHBlcnNvbiA9PiBwZXJzb24uY2hvY29sYXRlTnVtYmVyUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgY29uc3QgbnVtYmVyT2ZQZW9wbGUgPSBwZW9wbGUuZmlsdGVyKCBwZXJzb24gPT4gcGVyc29uLmlzQWN0aXZlUHJvcGVydHkudmFsdWUgKS5sZW5ndGg7XHJcblxyXG4gICAgICAvLyBSRVZJRVc6IENhbiB3ZSBhbGlnbiB0aGUgbnVtYmVycyB3aXRoIHRoZSB0YWJsZSBzcGlubmVycz8gIFNvIGNvcnJlc3BvbmRlbmNlIGlzIGNsZWFyP1xyXG4gICAgICBjb25zdCBhZGRpdGlvblRleHQgPSBuZXcgVGV4dCggbnVtYmVycy5qb2luKCAnICsgJyApICk7XHJcbiAgICAgIGNvbnN0IGFkZGl0aW9uRnJhY3Rpb25MaW5lID0gbmV3IExpbmUoIDAsIDAsIGFkZGl0aW9uVGV4dC53aWR0aCwgMCwgeyBzdHJva2U6ICdibGFjaycgfSApO1xyXG4gICAgICBjb25zdCBhZGRpdGlvbkRlbm9taW5hdG9yVGV4dCA9IG5ldyBUZXh0KCBudW1iZXJPZlBlb3BsZSApO1xyXG4gICAgICBjb25zdCBhZGRpdGlvbkZyYWN0aW9uID0gbmV3IFZCb3goIHsgY2hpbGRyZW46IFsgYWRkaXRpb25UZXh0LCBhZGRpdGlvbkZyYWN0aW9uTGluZSwgYWRkaXRpb25EZW5vbWluYXRvclRleHQgXSB9ICk7XHJcblxyXG4gICAgICBjb25zdCBudW1lcmF0b3JUZXh0ID0gbmV3IFRleHQoIF8uc3VtKCBudW1iZXJzICkgKTtcclxuICAgICAgY29uc3QgZnJhY3Rpb25MaW5lID0gbmV3IExpbmUoIDAsIDAsIG51bWVyYXRvclRleHQud2lkdGgsIDAsIHsgc3Ryb2tlOiAnYmxhY2snIH0gKTtcclxuICAgICAgY29uc3QgZGVub21pbmF0b3JUZXh0ID0gbmV3IFRleHQoIG51bWJlck9mUGVvcGxlICk7XHJcbiAgICAgIGNvbnN0IGZyYWN0aW9uID0gbmV3IFZCb3goIHsgY2hpbGRyZW46IFsgbnVtZXJhdG9yVGV4dCwgZnJhY3Rpb25MaW5lLCBkZW5vbWluYXRvclRleHQgXSB9ICk7XHJcblxyXG4gICAgICBjb25zdCBkZWNpbWFsVGV4dCA9IG5ldyBUZXh0KCBVdGlscy50b0ZpeGVkTnVtYmVyKCBfLnN1bSggbnVtYmVycyApIC8gbnVtYmVyT2ZQZW9wbGUsIDIgKSApO1xyXG5cclxuICAgICAgY2FsY3VsYXRpb25Ob2RlLnJvd3MgPSBbXHJcbiAgICAgICAgWyBtZWFuRXF1YWxzQWRkaXRpb25GcmFjdGlvblRleHQsIGFkZGl0aW9uRnJhY3Rpb24gXSxcclxuICAgICAgICBbIG1lYW5FcXVhbHNGcmFjdGlvblRleHQsIGZyYWN0aW9uIF0sXHJcbiAgICAgICAgWyBtZWFuRXF1YWxzRGVjaW1hbFRleHQsIGRlY2ltYWxUZXh0IF1cclxuICAgICAgXTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggcGFuZWwsIHtcclxuICAgICAgdGl0bGU6IG1lYW5UaXRsZVRleHQsXHJcbiAgICAgIHRpdGxlQWxpZ246ICdsZWZ0JyxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB2aXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHJlc2l6ZTogZmFsc2UsXHJcbiAgICAgIGNlbnRlclk6IE1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMuTk9URUJPT0tfUEFQRVJfQ0VOVEVSX1ksXHJcbiAgICAgIGNsb3NlQnV0dG9uTGlzdGVuZXI6ICgpID0+IHRoaXMudmlzaWJsZVByb3BlcnR5LnNldCggZmFsc2UgKSxcclxuXHJcbiAgICAgIC8vIFdlIHNwZWNpZnkgdGhlIHBvc2l0aW9uIG1hbnVhbGx5XHJcbiAgICAgIC8vIFJFVklFVzogV2hlcmUgaXMgeCBzcGVjaWZpZWQ/XHJcbiAgICAgIGxheW91dFN0cmF0ZWd5OiBfLm5vb3BcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbm1lYW5TaGFyZUFuZEJhbGFuY2UucmVnaXN0ZXIoICdNZWFuQ2FsY3VsYXRpb25EaWFsb2cnLCBNZWFuQ2FsY3VsYXRpb25EaWFsb2cgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLG1CQUFtQixNQUFNLDhCQUE4QjtBQUM5RCxTQUFTQyxPQUFPLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FB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