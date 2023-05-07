// Copyright 2022, University of Colorado Boulder

/**
 * VectorCheckbox is the checkbox used for visibility of a vector in control panels, labeled with text and a vector icon.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import LineArrowNode from '../../../../scenery-phet/js/LineArrowNode.js';
import { AlignBox, HBox, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import HookesLawConstants from '../HookesLawConstants.js';
import HookesLawIconFactory from './HookesLawIconFactory.js';
import hookesLaw from '../../hookesLaw.js';
export default class VectorCheckbox extends Checkbox {
  constructor(visibleProperty, stringProperty, providedOptions) {
    const options = optionize3()({}, HookesLawConstants.CHECKBOX_OPTIONS, providedOptions);
    const text = new Text(stringProperty, combineOptions({}, HookesLawConstants.CONTROL_TEXT_OPTIONS, {
      tandem: options.tandem.createTandem('text')
    }));
    const textAlignBox = new AlignBox(text, options.textAlignBoxOptions);
    let arrowNode;
    if (options.vectorType === 'force') {
      arrowNode = HookesLawIconFactory.createForceVectorIcon({
        fill: options.arrowFill
      });
    } else {
      arrowNode = new LineArrowNode(0, 0, 30, 0, {
        stroke: options.arrowFill,
        headWidth: HookesLawConstants.VECTOR_HEAD_SIZE.width,
        headHeight: HookesLawConstants.VECTOR_HEAD_SIZE.height,
        headLineWidth: 3,
        tailLineWidth: 3
      });
    }
    const content = new HBox({
      children: [textAlignBox, arrowNode],
      spacing: 10
    });
    super(visibleProperty, content, options);
  }
}
hookesLaw.register('VectorCheckbox', VectorCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb21iaW5lT3B0aW9ucyIsIm9wdGlvbml6ZTMiLCJMaW5lQXJyb3dOb2RlIiwiQWxpZ25Cb3giLCJIQm94IiwiVGV4dCIsIkNoZWNrYm94IiwiSG9va2VzTGF3Q29uc3RhbnRzIiwiSG9va2VzTGF3SWNvbkZhY3RvcnkiLCJob29rZXNMYXciLCJWZWN0b3JDaGVja2JveCIsImNvbnN0cnVjdG9yIiwidmlzaWJsZVByb3BlcnR5Iiwic3RyaW5nUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiQ0hFQ0tCT1hfT1BUSU9OUyIsInRleHQiLCJDT05UUk9MX1RFWFRfT1BUSU9OUyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInRleHRBbGlnbkJveCIsInRleHRBbGlnbkJveE9wdGlvbnMiLCJhcnJvd05vZGUiLCJ2ZWN0b3JUeXBlIiwiY3JlYXRlRm9yY2VWZWN0b3JJY29uIiwiZmlsbCIsImFycm93RmlsbCIsInN0cm9rZSIsImhlYWRXaWR0aCIsIlZFQ1RPUl9IRUFEX1NJWkUiLCJ3aWR0aCIsImhlYWRIZWlnaHQiLCJoZWlnaHQiLCJoZWFkTGluZVdpZHRoIiwidGFpbExpbmVXaWR0aCIsImNvbnRlbnQiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZlY3RvckNoZWNrYm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWZWN0b3JDaGVja2JveCBpcyB0aGUgY2hlY2tib3ggdXNlZCBmb3IgdmlzaWJpbGl0eSBvZiBhIHZlY3RvciBpbiBjb250cm9sIHBhbmVscywgbGFiZWxlZCB3aXRoIHRleHQgYW5kIGEgdmVjdG9yIGljb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zLCBvcHRpb25pemUzIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IExpbmVBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0xpbmVBcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgQWxpZ25Cb3hPcHRpb25zLCBIQm94LCBUQ29sb3IsIFRleHQsIFRleHRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENoZWNrYm94LCB7IENoZWNrYm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBIb29rZXNMYXdDb25zdGFudHMgZnJvbSAnLi4vSG9va2VzTGF3Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEhvb2tlc0xhd0ljb25GYWN0b3J5IGZyb20gJy4vSG9va2VzTGF3SWNvbkZhY3RvcnkuanMnO1xyXG5pbXBvcnQgaG9va2VzTGF3IGZyb20gJy4uLy4uL2hvb2tlc0xhdy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHZlY3RvclR5cGU6ICdmb3JjZScgfCAnZGlzcGxhY2VtZW50JztcclxuICBhcnJvd0ZpbGw6IFRDb2xvcjtcclxuICB0ZXh0QWxpZ25Cb3hPcHRpb25zPzogU3RyaWN0T21pdDxBbGlnbkJveE9wdGlvbnMsICd0YW5kZW0nPjsgLy8gdG8gZ2l2ZSB0ZXh0IGxhYmVscyB0aGUgc2FtZSBlZmZlY3RpdmUgd2lkdGhcclxufTtcclxuXHJcbnR5cGUgVmVjdG9yQ2hlY2tib3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Q2hlY2tib3hPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3JDaGVja2JveCBleHRlbmRzIENoZWNrYm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2aXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgc3RyaW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IFZlY3RvckNoZWNrYm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplMzxWZWN0b3JDaGVja2JveE9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICd0ZXh0QWxpZ25Cb3hPcHRpb25zJz4sIENoZWNrYm94T3B0aW9ucz4oKShcclxuICAgICAge30sIEhvb2tlc0xhd0NvbnN0YW50cy5DSEVDS0JPWF9PUFRJT05TLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHQoIHN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHt9LCBIb29rZXNMYXdDb25zdGFudHMuQ09OVFJPTF9URVhUX09QVElPTlMsIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RleHQnIClcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgY29uc3QgdGV4dEFsaWduQm94ID0gbmV3IEFsaWduQm94KCB0ZXh0LCBvcHRpb25zLnRleHRBbGlnbkJveE9wdGlvbnMgKTtcclxuXHJcbiAgICBsZXQgYXJyb3dOb2RlO1xyXG4gICAgaWYgKCBvcHRpb25zLnZlY3RvclR5cGUgPT09ICdmb3JjZScgKSB7XHJcbiAgICAgIGFycm93Tm9kZSA9IEhvb2tlc0xhd0ljb25GYWN0b3J5LmNyZWF0ZUZvcmNlVmVjdG9ySWNvbigge1xyXG4gICAgICAgIGZpbGw6IG9wdGlvbnMuYXJyb3dGaWxsXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhcnJvd05vZGUgPSBuZXcgTGluZUFycm93Tm9kZSggMCwgMCwgMzAsIDAsIHtcclxuICAgICAgICBzdHJva2U6IG9wdGlvbnMuYXJyb3dGaWxsLFxyXG4gICAgICAgIGhlYWRXaWR0aDogSG9va2VzTGF3Q29uc3RhbnRzLlZFQ1RPUl9IRUFEX1NJWkUud2lkdGgsXHJcbiAgICAgICAgaGVhZEhlaWdodDogSG9va2VzTGF3Q29uc3RhbnRzLlZFQ1RPUl9IRUFEX1NJWkUuaGVpZ2h0LFxyXG4gICAgICAgIGhlYWRMaW5lV2lkdGg6IDMsXHJcbiAgICAgICAgdGFpbExpbmVXaWR0aDogM1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHRleHRBbGlnbkJveCwgYXJyb3dOb2RlIF0sXHJcbiAgICAgIHNwYWNpbmc6IDEwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHZpc2libGVQcm9wZXJ0eSwgY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuaG9va2VzTGF3LnJlZ2lzdGVyKCAnVmVjdG9yQ2hlY2tib3gnLCBWZWN0b3JDaGVja2JveCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQSxTQUFTQSxjQUFjLEVBQUVDLFVBQVUsUUFBUSx1Q0FBdUM7QUFHbEYsT0FBT0MsYUFBYSxNQUFNLDhDQUE4QztBQUN4RSxTQUFTQyxRQUFRLEVBQW1CQyxJQUFJLEVBQVVDLElBQUksUUFBcUIsbUNBQW1DO0FBQzlHLE9BQU9DLFFBQVEsTUFBMkIsZ0NBQWdDO0FBQzFFLE9BQU9DLGtCQUFrQixNQUFNLDBCQUEwQjtBQUN6RCxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQVUxQyxlQUFlLE1BQU1DLGNBQWMsU0FBU0osUUFBUSxDQUFDO0VBRTVDSyxXQUFXQSxDQUFFQyxlQUFrQyxFQUNsQ0MsY0FBeUMsRUFDekNDLGVBQXNDLEVBQUc7SUFFM0QsTUFBTUMsT0FBTyxHQUFHZCxVQUFVLENBQXlGLENBQUMsQ0FDbEgsQ0FBQyxDQUFDLEVBQUVNLGtCQUFrQixDQUFDUyxnQkFBZ0IsRUFBRUYsZUFBZ0IsQ0FBQztJQUU1RCxNQUFNRyxJQUFJLEdBQUcsSUFBSVosSUFBSSxDQUFFUSxjQUFjLEVBQ25DYixjQUFjLENBQWUsQ0FBQyxDQUFDLEVBQUVPLGtCQUFrQixDQUFDVyxvQkFBb0IsRUFBRTtNQUN4RUMsTUFBTSxFQUFFSixPQUFPLENBQUNJLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLE1BQU87SUFDOUMsQ0FBRSxDQUFFLENBQUM7SUFFUCxNQUFNQyxZQUFZLEdBQUcsSUFBSWxCLFFBQVEsQ0FBRWMsSUFBSSxFQUFFRixPQUFPLENBQUNPLG1CQUFvQixDQUFDO0lBRXRFLElBQUlDLFNBQVM7SUFDYixJQUFLUixPQUFPLENBQUNTLFVBQVUsS0FBSyxPQUFPLEVBQUc7TUFDcENELFNBQVMsR0FBR2Ysb0JBQW9CLENBQUNpQixxQkFBcUIsQ0FBRTtRQUN0REMsSUFBSSxFQUFFWCxPQUFPLENBQUNZO01BQ2hCLENBQUUsQ0FBQztJQUNMLENBQUMsTUFDSTtNQUNISixTQUFTLEdBQUcsSUFBSXJCLGFBQWEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDMUMwQixNQUFNLEVBQUViLE9BQU8sQ0FBQ1ksU0FBUztRQUN6QkUsU0FBUyxFQUFFdEIsa0JBQWtCLENBQUN1QixnQkFBZ0IsQ0FBQ0MsS0FBSztRQUNwREMsVUFBVSxFQUFFekIsa0JBQWtCLENBQUN1QixnQkFBZ0IsQ0FBQ0csTUFBTTtRQUN0REMsYUFBYSxFQUFFLENBQUM7UUFDaEJDLGFBQWEsRUFBRTtNQUNqQixDQUFFLENBQUM7SUFDTDtJQUVBLE1BQU1DLE9BQU8sR0FBRyxJQUFJaEMsSUFBSSxDQUFFO01BQ3hCaUMsUUFBUSxFQUFFLENBQUVoQixZQUFZLEVBQUVFLFNBQVMsQ0FBRTtNQUNyQ2UsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFMUIsZUFBZSxFQUFFd0IsT0FBTyxFQUFFckIsT0FBUSxDQUFDO0VBQzVDO0FBQ0Y7QUFFQU4sU0FBUyxDQUFDOEIsUUFBUSxDQUFFLGdCQUFnQixFQUFFN0IsY0FBZSxDQUFDIn0=