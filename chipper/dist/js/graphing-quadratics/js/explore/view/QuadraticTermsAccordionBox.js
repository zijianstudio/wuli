// Copyright 2018-2023, University of Colorado Boulder

/**
 * Accordion box for showing and hiding terms of the interactive quadratic equation.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { optionize4 } from '../../../../phet-core/js/optionize.js';
import { AlignBox, AlignGroup, HSeparator, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQCheckbox from '../../common/view/GQCheckbox.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GraphingQuadraticsStrings from '../../GraphingQuadraticsStrings.js';
export default class QuadraticTermsAccordionBox extends AccordionBox {
  constructor(viewProperties, providedOptions) {
    const options = optionize4()({}, GQConstants.ACCORDION_BOX_OPTIONS, {
      // AccordionBoxOptions
      titleAlignX: 'left',
      titleXSpacing: 8,
      phetioDocumentation: 'the Quadratic Terms accordion box'
    }, providedOptions);

    // AccordionBox title
    options.titleNode = new Text(GraphingQuadraticsStrings.quadraticTerms, {
      font: GQConstants.TITLE_FONT,
      maxWidth: 180,
      // determined empirically
      tandem: options.tandem.createTandem('titleText'),
      phetioDocumentation: 'the title on this accordion box',
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    });

    // y = ax^2
    const quadraticTermCheckbox = GQCheckbox.createQuadraticTermCheckbox(viewProperties.quadraticTermVisibleProperty, options.tandem.createTandem('quadraticTermCheckbox'));

    // y = bx
    const linearTermCheckbox = GQCheckbox.createLinearTermCheckbox(viewProperties.linearTermVisibleProperty, options.tandem.createTandem('linearTermCheckbox'));

    // y = c
    const constantTermCheckbox = GQCheckbox.createConstantTermCheckbox(viewProperties.constantTermVisibleProperty, options.tandem.createTandem('constantTermCheckbox'));

    // Equations
    const equationsCheckbox = GQCheckbox.createEquationsCheckbox(viewProperties.equationsVisibleProperty, options.tandem.createTandem('equationsCheckbox'));

    // To make all checkboxes have the same effective width
    const alignBoxOptions = {
      group: new AlignGroup(),
      xAlign: 'left'
    };

    // vertical layout
    const contentNode = new VBox({
      align: 'left',
      spacing: GQConstants.CHECKBOXES_Y_SPACING,
      children: [new AlignBox(quadraticTermCheckbox, alignBoxOptions), new AlignBox(linearTermCheckbox, alignBoxOptions), new AlignBox(constantTermCheckbox, alignBoxOptions), new HSeparator({
        stroke: GQColors.SEPARATOR,
        minimumWidth: 1.1 * options.titleNode.width
      }), new AlignBox(equationsCheckbox, alignBoxOptions)]
    });
    super(contentNode, options);
  }
}
graphingQuadratics.register('QuadraticTermsAccordionBox', QuadraticTermsAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemU0IiwiQWxpZ25Cb3giLCJBbGlnbkdyb3VwIiwiSFNlcGFyYXRvciIsIlRleHQiLCJWQm94IiwiQWNjb3JkaW9uQm94IiwiR1FDb2xvcnMiLCJHUUNvbnN0YW50cyIsIkdRQ2hlY2tib3giLCJncmFwaGluZ1F1YWRyYXRpY3MiLCJHcmFwaGluZ1F1YWRyYXRpY3NTdHJpbmdzIiwiUXVhZHJhdGljVGVybXNBY2NvcmRpb25Cb3giLCJjb25zdHJ1Y3RvciIsInZpZXdQcm9wZXJ0aWVzIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIkFDQ09SRElPTl9CT1hfT1BUSU9OUyIsInRpdGxlQWxpZ25YIiwidGl0bGVYU3BhY2luZyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ0aXRsZU5vZGUiLCJxdWFkcmF0aWNUZXJtcyIsImZvbnQiLCJUSVRMRV9GT05UIiwibWF4V2lkdGgiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJxdWFkcmF0aWNUZXJtQ2hlY2tib3giLCJjcmVhdGVRdWFkcmF0aWNUZXJtQ2hlY2tib3giLCJxdWFkcmF0aWNUZXJtVmlzaWJsZVByb3BlcnR5IiwibGluZWFyVGVybUNoZWNrYm94IiwiY3JlYXRlTGluZWFyVGVybUNoZWNrYm94IiwibGluZWFyVGVybVZpc2libGVQcm9wZXJ0eSIsImNvbnN0YW50VGVybUNoZWNrYm94IiwiY3JlYXRlQ29uc3RhbnRUZXJtQ2hlY2tib3giLCJjb25zdGFudFRlcm1WaXNpYmxlUHJvcGVydHkiLCJlcXVhdGlvbnNDaGVja2JveCIsImNyZWF0ZUVxdWF0aW9uc0NoZWNrYm94IiwiZXF1YXRpb25zVmlzaWJsZVByb3BlcnR5IiwiYWxpZ25Cb3hPcHRpb25zIiwiZ3JvdXAiLCJ4QWxpZ24iLCJjb250ZW50Tm9kZSIsImFsaWduIiwic3BhY2luZyIsIkNIRUNLQk9YRVNfWV9TUEFDSU5HIiwiY2hpbGRyZW4iLCJzdHJva2UiLCJTRVBBUkFUT1IiLCJtaW5pbXVtV2lkdGgiLCJ3aWR0aCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUXVhZHJhdGljVGVybXNBY2NvcmRpb25Cb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQWNjb3JkaW9uIGJveCBmb3Igc2hvd2luZyBhbmQgaGlkaW5nIHRlcm1zIG9mIHRoZSBpbnRlcmFjdGl2ZSBxdWFkcmF0aWMgZXF1YXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmVhIExpblxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IEVtcHR5U2VsZk9wdGlvbnMsIG9wdGlvbml6ZTQgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEFsaWduQm94T3B0aW9ucywgQWxpZ25Hcm91cCwgSFNlcGFyYXRvciwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3gsIHsgQWNjb3JkaW9uQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgR1FDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0dRQ29sb3JzLmpzJztcclxuaW1wb3J0IEdRQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9HUUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBHUUNoZWNrYm94IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0dRQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgZ3JhcGhpbmdRdWFkcmF0aWNzIGZyb20gJy4uLy4uL2dyYXBoaW5nUXVhZHJhdGljcy5qcyc7XHJcbmltcG9ydCBHcmFwaGluZ1F1YWRyYXRpY3NTdHJpbmdzIGZyb20gJy4uLy4uL0dyYXBoaW5nUXVhZHJhdGljc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgRXhwbG9yZVZpZXdQcm9wZXJ0aWVzIGZyb20gJy4vRXhwbG9yZVZpZXdQcm9wZXJ0aWVzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBRdWFkcmF0aWNUZXJtc0FjY29yZGlvbkJveE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxBY2NvcmRpb25Cb3hPcHRpb25zLCAndGFuZGVtJyB8ICdleHBhbmRlZFByb3BlcnR5Jz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWFkcmF0aWNUZXJtc0FjY29yZGlvbkJveCBleHRlbmRzIEFjY29yZGlvbkJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggdmlld1Byb3BlcnRpZXM6IEV4cGxvcmVWaWV3UHJvcGVydGllcywgcHJvdmlkZWRPcHRpb25zOiBRdWFkcmF0aWNUZXJtc0FjY29yZGlvbkJveE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTQ8UXVhZHJhdGljVGVybXNBY2NvcmRpb25Cb3hPcHRpb25zLCBTZWxmT3B0aW9ucywgQWNjb3JkaW9uQm94T3B0aW9ucz4oKShcclxuICAgICAge30sIEdRQ29uc3RhbnRzLkFDQ09SRElPTl9CT1hfT1BUSU9OUywge1xyXG5cclxuICAgICAgICAvLyBBY2NvcmRpb25Cb3hPcHRpb25zXHJcbiAgICAgICAgdGl0bGVBbGlnblg6ICdsZWZ0JyxcclxuICAgICAgICB0aXRsZVhTcGFjaW5nOiA4LFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgUXVhZHJhdGljIFRlcm1zIGFjY29yZGlvbiBib3gnXHJcbiAgICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEFjY29yZGlvbkJveCB0aXRsZVxyXG4gICAgb3B0aW9ucy50aXRsZU5vZGUgPSBuZXcgVGV4dCggR3JhcGhpbmdRdWFkcmF0aWNzU3RyaW5ncy5xdWFkcmF0aWNUZXJtcywge1xyXG4gICAgICBmb250OiBHUUNvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMTgwLCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGl0bGVUZXh0JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIHRpdGxlIG9uIHRoaXMgYWNjb3JkaW9uIGJveCcsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvUmVhZE9ubHk6IHRydWUgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHkgPSBheF4yXHJcbiAgICBjb25zdCBxdWFkcmF0aWNUZXJtQ2hlY2tib3ggPSBHUUNoZWNrYm94LmNyZWF0ZVF1YWRyYXRpY1Rlcm1DaGVja2JveCggdmlld1Byb3BlcnRpZXMucXVhZHJhdGljVGVybVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncXVhZHJhdGljVGVybUNoZWNrYm94JyApICk7XHJcblxyXG4gICAgLy8geSA9IGJ4XHJcbiAgICBjb25zdCBsaW5lYXJUZXJtQ2hlY2tib3ggPSBHUUNoZWNrYm94LmNyZWF0ZUxpbmVhclRlcm1DaGVja2JveCggdmlld1Byb3BlcnRpZXMubGluZWFyVGVybVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGluZWFyVGVybUNoZWNrYm94JyApICk7XHJcblxyXG4gICAgLy8geSA9IGNcclxuICAgIGNvbnN0IGNvbnN0YW50VGVybUNoZWNrYm94ID0gR1FDaGVja2JveC5jcmVhdGVDb25zdGFudFRlcm1DaGVja2JveCggdmlld1Byb3BlcnRpZXMuY29uc3RhbnRUZXJtVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb25zdGFudFRlcm1DaGVja2JveCcgKSApO1xyXG5cclxuICAgIC8vIEVxdWF0aW9uc1xyXG4gICAgY29uc3QgZXF1YXRpb25zQ2hlY2tib3ggPSBHUUNoZWNrYm94LmNyZWF0ZUVxdWF0aW9uc0NoZWNrYm94KCB2aWV3UHJvcGVydGllcy5lcXVhdGlvbnNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VxdWF0aW9uc0NoZWNrYm94JyApICk7XHJcblxyXG4gICAgLy8gVG8gbWFrZSBhbGwgY2hlY2tib3hlcyBoYXZlIHRoZSBzYW1lIGVmZmVjdGl2ZSB3aWR0aFxyXG4gICAgY29uc3QgYWxpZ25Cb3hPcHRpb25zOiBBbGlnbkJveE9wdGlvbnMgPSB7XHJcbiAgICAgIGdyb3VwOiBuZXcgQWxpZ25Hcm91cCgpLFxyXG4gICAgICB4QWxpZ246ICdsZWZ0J1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyB2ZXJ0aWNhbCBsYXlvdXRcclxuICAgIGNvbnN0IGNvbnRlbnROb2RlID0gbmV3IFZCb3goIHtcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogR1FDb25zdGFudHMuQ0hFQ0tCT1hFU19ZX1NQQUNJTkcsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IEFsaWduQm94KCBxdWFkcmF0aWNUZXJtQ2hlY2tib3gsIGFsaWduQm94T3B0aW9ucyApLFxyXG4gICAgICAgIG5ldyBBbGlnbkJveCggbGluZWFyVGVybUNoZWNrYm94LCBhbGlnbkJveE9wdGlvbnMgKSxcclxuICAgICAgICBuZXcgQWxpZ25Cb3goIGNvbnN0YW50VGVybUNoZWNrYm94LCBhbGlnbkJveE9wdGlvbnMgKSxcclxuICAgICAgICBuZXcgSFNlcGFyYXRvcigge1xyXG4gICAgICAgICAgc3Ryb2tlOiBHUUNvbG9ycy5TRVBBUkFUT1IsXHJcbiAgICAgICAgICBtaW5pbXVtV2lkdGg6IDEuMSAqIG9wdGlvbnMudGl0bGVOb2RlLndpZHRoXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBBbGlnbkJveCggZXF1YXRpb25zQ2hlY2tib3gsIGFsaWduQm94T3B0aW9ucyApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudE5vZGUsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nUXVhZHJhdGljcy5yZWdpc3RlciggJ1F1YWRyYXRpY1Rlcm1zQWNjb3JkaW9uQm94JywgUXVhZHJhdGljVGVybXNBY2NvcmRpb25Cb3ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUEyQkEsVUFBVSxRQUFRLHVDQUF1QztBQUVwRixTQUFTQyxRQUFRLEVBQW1CQyxVQUFVLEVBQUVDLFVBQVUsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ2pILE9BQU9DLFlBQVksTUFBK0Isb0NBQW9DO0FBQ3RGLE9BQU9DLFFBQVEsTUFBTSwwQkFBMEI7QUFDL0MsT0FBT0MsV0FBVyxNQUFNLDZCQUE2QjtBQUNyRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyx5QkFBeUIsTUFBTSxvQ0FBb0M7QUFPMUUsZUFBZSxNQUFNQywwQkFBMEIsU0FBU04sWUFBWSxDQUFDO0VBRTVETyxXQUFXQSxDQUFFQyxjQUFxQyxFQUFFQyxlQUFrRCxFQUFHO0lBRTlHLE1BQU1DLE9BQU8sR0FBR2hCLFVBQVUsQ0FBc0UsQ0FBQyxDQUMvRixDQUFDLENBQUMsRUFBRVEsV0FBVyxDQUFDUyxxQkFBcUIsRUFBRTtNQUVyQztNQUNBQyxXQUFXLEVB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