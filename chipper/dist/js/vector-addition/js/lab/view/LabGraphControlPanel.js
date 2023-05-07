// Copyright 2019-2023, University of Colorado Boulder

/**
 *  LabGraphControlPanel is the graph control panel for the 'Lab' screen.
 *  It exists for the lifetime of the sim and is not intended to be disposed.
 *
 *  @author Brandon Li
 *  @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import { AlignBox, AlignGroup, Color, HSeparator, Node, VBox } from '../../../../scenery/js/imports.js';
import VectorAdditionConstants from '../../common/VectorAdditionConstants.js';
import AnglesCheckbox from '../../common/view/AnglesCheckbox.js';
import ComponentStyleControl from '../../common/view/ComponentStyleControl.js';
import GraphControlPanel from '../../common/view/GraphControlPanel.js';
import SumCheckbox from '../../common/view/SumCheckbox.js';
import ValuesCheckbox from '../../common/view/ValuesCheckbox.js';
import VectorAdditionGridCheckbox from '../../common/view/VectorAdditionGridCheckbox.js';
import VectorAdditionViewProperties from '../../common/view/VectorAdditionViewProperties.js';
import vectorAddition from '../../vectorAddition.js';
import LabGraph from '../model/LabGraph.js';
export default class LabGraphControlPanel extends GraphControlPanel {
  /**
   * @param {LabGraph} cartesianGraph
   * @param {LabGraph} polarGraph
   * @param {EnumerationProperty.<ComponentVectorStyles>} componentStyleProperty
   * @param {Property.<boolean>} sumVisibleProperty1
   * @param {Property.<boolean>} sumVisibleProperty2
   * @param {VectorAdditionViewProperties} viewProperties
   * @param {Object} [options]
   */
  constructor(cartesianGraph, polarGraph, componentStyleProperty, sumVisibleProperty1, sumVisibleProperty2, viewProperties, options) {
    assert && assert(cartesianGraph instanceof LabGraph, `invalid cartesianGraph: ${cartesianGraph}`);
    assert && assert(polarGraph instanceof LabGraph, `invalid polarGraph: ${polarGraph}`);
    assert && assert(componentStyleProperty instanceof EnumerationProperty, `invalid componentStyleProperty: ${componentStyleProperty}`);
    assert && assert(viewProperties instanceof VectorAdditionViewProperties, `invalid viewProperties: ${viewProperties}`);

    // To make all checkboxes the same height
    const alignBoxOptions = {
      group: new AlignGroup({
        matchHorizontal: false,
        matchVertical: true
      })
    };

    // Create two 'Sum' checkboxes for each graph
    const sumCheckboxContainer = new Node();
    [cartesianGraph, polarGraph].forEach(graph => {
      const sumCheckboxes = new VBox({
        children: [new AlignBox(new SumCheckbox(sumVisibleProperty1, graph.vectorSet1.vectorColorPalette), alignBoxOptions), new AlignBox(new SumCheckbox(sumVisibleProperty2, graph.vectorSet2.vectorColorPalette), alignBoxOptions)],
        spacing: VectorAdditionConstants.CHECKBOX_Y_SPACING,
        align: 'left'
      });
      sumCheckboxContainer.addChild(sumCheckboxes);

      // Show the Sum checkboxes that match the selected scene.
      // unlink is unnecessary, exists for the lifetime of the sim.
      viewProperties.coordinateSnapModeProperty.link(coordinateSnapMode => {
        sumCheckboxes.visible = coordinateSnapMode === graph.coordinateSnapMode;
      });
    });

    // Values
    const valuesCheckbox = new ValuesCheckbox(viewProperties.valuesVisibleProperty);

    // Angles
    const anglesCheckbox = new AnglesCheckbox(viewProperties.anglesVisibleProperty);

    // Grid
    const gridCheckbox = new VectorAdditionGridCheckbox(viewProperties.gridVisibleProperty);
    super([
    // checkboxes, wrapped with AlignBox so that they are all the same height
    new VBox({
      spacing: VectorAdditionConstants.CHECKBOX_Y_SPACING,
      align: 'left',
      children: [sumCheckboxContainer, new AlignBox(valuesCheckbox, alignBoxOptions), new AlignBox(anglesCheckbox, alignBoxOptions), new AlignBox(gridCheckbox, alignBoxOptions)]
    }),
    // separator
    new HSeparator({
      stroke: Color.BLACK
    }),
    // Components radio buttons
    new ComponentStyleControl(componentStyleProperty, {
      maxWidth: VectorAdditionConstants.GRAPH_CONTROL_PANEL_CONTENT_WIDTH
    })], options);
  }
}
vectorAddition.register('LabGraphControlPanel', LabGraphControlPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiQWxpZ25Cb3giLCJBbGlnbkdyb3VwIiwiQ29sb3IiLCJIU2VwYXJhdG9yIiwiTm9kZSIsIlZCb3giLCJWZWN0b3JBZGRpdGlvbkNvbnN0YW50cyIsIkFuZ2xlc0NoZWNrYm94IiwiQ29tcG9uZW50U3R5bGVDb250cm9sIiwiR3JhcGhDb250cm9sUGFuZWwiLCJTdW1DaGVja2JveCIsIlZhbHVlc0NoZWNrYm94IiwiVmVjdG9yQWRkaXRpb25HcmlkQ2hlY2tib3giLCJWZWN0b3JBZGRpdGlvblZpZXdQcm9wZXJ0aWVzIiwidmVjdG9yQWRkaXRpb24iLCJMYWJHcmFwaCIsIkxhYkdyYXBoQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJjYXJ0ZXNpYW5HcmFwaCIsInBvbGFyR3JhcGgiLCJjb21wb25lbnRTdHlsZVByb3BlcnR5Iiwic3VtVmlzaWJsZVByb3BlcnR5MSIsInN1bVZpc2libGVQcm9wZXJ0eTIiLCJ2aWV3UHJvcGVydGllcyIsIm9wdGlvbnMiLCJhc3NlcnQiLCJhbGlnbkJveE9wdGlvbnMiLCJncm91cCIsIm1hdGNoSG9yaXpvbnRhbCIsIm1hdGNoVmVydGljYWwiLCJzdW1DaGVja2JveENvbnRhaW5lciIsImZvckVhY2giLCJncmFwaCIsInN1bUNoZWNrYm94ZXMiLCJjaGlsZHJlbiIsInZlY3RvclNldDEiLCJ2ZWN0b3JDb2xvclBhbGV0dGUiLCJ2ZWN0b3JTZXQyIiwic3BhY2luZyIsIkNIRUNLQk9YX1lfU1BBQ0lORyIsImFsaWduIiwiYWRkQ2hpbGQiLCJjb29yZGluYXRlU25hcE1vZGVQcm9wZXJ0eSIsImxpbmsiLCJjb29yZGluYXRlU25hcE1vZGUiLCJ2aXNpYmxlIiwidmFsdWVzQ2hlY2tib3giLCJ2YWx1ZXNWaXNpYmxlUHJvcGVydHkiLCJhbmdsZXNDaGVja2JveCIsImFuZ2xlc1Zpc2libGVQcm9wZXJ0eSIsImdyaWRDaGVja2JveCIsImdyaWRWaXNpYmxlUHJvcGVydHkiLCJzdHJva2UiLCJCTEFDSyIsIm1heFdpZHRoIiwiR1JBUEhfQ09OVFJPTF9QQU5FTF9DT05URU5UX1dJRFRIIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYWJHcmFwaENvbnRyb2xQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiAgTGFiR3JhcGhDb250cm9sUGFuZWwgaXMgdGhlIGdyYXBoIGNvbnRyb2wgcGFuZWwgZm9yIHRoZSAnTGFiJyBzY3JlZW4uXHJcbiAqICBJdCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltIGFuZCBpcyBub3QgaW50ZW5kZWQgdG8gYmUgZGlzcG9zZWQuXHJcbiAqXHJcbiAqICBAYXV0aG9yIEJyYW5kb24gTGlcclxuICogIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEFsaWduR3JvdXAsIENvbG9yLCBIU2VwYXJhdG9yLCBOb2RlLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9WZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBBbmdsZXNDaGVja2JveCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9BbmdsZXNDaGVja2JveC5qcyc7XHJcbmltcG9ydCBDb21wb25lbnRTdHlsZUNvbnRyb2wgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQ29tcG9uZW50U3R5bGVDb250cm9sLmpzJztcclxuaW1wb3J0IEdyYXBoQ29udHJvbFBhbmVsIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0dyYXBoQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IFN1bUNoZWNrYm94IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1N1bUNoZWNrYm94LmpzJztcclxuaW1wb3J0IFZhbHVlc0NoZWNrYm94IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1ZhbHVlc0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uR3JpZENoZWNrYm94IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1ZlY3RvckFkZGl0aW9uR3JpZENoZWNrYm94LmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uVmlld1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvVmVjdG9yQWRkaXRpb25WaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCB2ZWN0b3JBZGRpdGlvbiBmcm9tICcuLi8uLi92ZWN0b3JBZGRpdGlvbi5qcyc7XHJcbmltcG9ydCBMYWJHcmFwaCBmcm9tICcuLi9tb2RlbC9MYWJHcmFwaC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYWJHcmFwaENvbnRyb2xQYW5lbCBleHRlbmRzIEdyYXBoQ29udHJvbFBhbmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtMYWJHcmFwaH0gY2FydGVzaWFuR3JhcGhcclxuICAgKiBAcGFyYW0ge0xhYkdyYXBofSBwb2xhckdyYXBoXHJcbiAgICogQHBhcmFtIHtFbnVtZXJhdGlvblByb3BlcnR5LjxDb21wb25lbnRWZWN0b3JTdHlsZXM+fSBjb21wb25lbnRTdHlsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHN1bVZpc2libGVQcm9wZXJ0eTFcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gc3VtVmlzaWJsZVByb3BlcnR5MlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yQWRkaXRpb25WaWV3UHJvcGVydGllc30gdmlld1Byb3BlcnRpZXNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNhcnRlc2lhbkdyYXBoLCBwb2xhckdyYXBoLCBjb21wb25lbnRTdHlsZVByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICBzdW1WaXNpYmxlUHJvcGVydHkxLCBzdW1WaXNpYmxlUHJvcGVydHkyLCB2aWV3UHJvcGVydGllcywgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjYXJ0ZXNpYW5HcmFwaCBpbnN0YW5jZW9mIExhYkdyYXBoLCBgaW52YWxpZCBjYXJ0ZXNpYW5HcmFwaDogJHtjYXJ0ZXNpYW5HcmFwaH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2xhckdyYXBoIGluc3RhbmNlb2YgTGFiR3JhcGgsIGBpbnZhbGlkIHBvbGFyR3JhcGg6ICR7cG9sYXJHcmFwaH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb21wb25lbnRTdHlsZVByb3BlcnR5IGluc3RhbmNlb2YgRW51bWVyYXRpb25Qcm9wZXJ0eSwgYGludmFsaWQgY29tcG9uZW50U3R5bGVQcm9wZXJ0eTogJHtjb21wb25lbnRTdHlsZVByb3BlcnR5fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZpZXdQcm9wZXJ0aWVzIGluc3RhbmNlb2YgVmVjdG9yQWRkaXRpb25WaWV3UHJvcGVydGllcywgYGludmFsaWQgdmlld1Byb3BlcnRpZXM6ICR7dmlld1Byb3BlcnRpZXN9YCApO1xyXG5cclxuICAgIC8vIFRvIG1ha2UgYWxsIGNoZWNrYm94ZXMgdGhlIHNhbWUgaGVpZ2h0XHJcbiAgICBjb25zdCBhbGlnbkJveE9wdGlvbnMgPSB7XHJcbiAgICAgIGdyb3VwOiBuZXcgQWxpZ25Hcm91cCgge1xyXG4gICAgICAgIG1hdGNoSG9yaXpvbnRhbDogZmFsc2UsXHJcbiAgICAgICAgbWF0Y2hWZXJ0aWNhbDogdHJ1ZVxyXG4gICAgICB9IClcclxuICAgIH07XHJcblxyXG4gICAgLy8gQ3JlYXRlIHR3byAnU3VtJyBjaGVja2JveGVzIGZvciBlYWNoIGdyYXBoXHJcbiAgICBjb25zdCBzdW1DaGVja2JveENvbnRhaW5lciA9IG5ldyBOb2RlKCk7XHJcbiAgICBbIGNhcnRlc2lhbkdyYXBoLCBwb2xhckdyYXBoIF0uZm9yRWFjaCggZ3JhcGggPT4ge1xyXG5cclxuICAgICAgY29uc3Qgc3VtQ2hlY2tib3hlcyA9IG5ldyBWQm94KCB7XHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBBbGlnbkJveCggbmV3IFN1bUNoZWNrYm94KCBzdW1WaXNpYmxlUHJvcGVydHkxLCBncmFwaC52ZWN0b3JTZXQxLnZlY3RvckNvbG9yUGFsZXR0ZSApLCBhbGlnbkJveE9wdGlvbnMgKSxcclxuICAgICAgICAgIG5ldyBBbGlnbkJveCggbmV3IFN1bUNoZWNrYm94KCBzdW1WaXNpYmxlUHJvcGVydHkyLCBncmFwaC52ZWN0b3JTZXQyLnZlY3RvckNvbG9yUGFsZXR0ZSApLCBhbGlnbkJveE9wdGlvbnMgKVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgc3BhY2luZzogVmVjdG9yQWRkaXRpb25Db25zdGFudHMuQ0hFQ0tCT1hfWV9TUEFDSU5HLFxyXG4gICAgICAgIGFsaWduOiAnbGVmdCdcclxuICAgICAgfSApO1xyXG4gICAgICBzdW1DaGVja2JveENvbnRhaW5lci5hZGRDaGlsZCggc3VtQ2hlY2tib3hlcyApO1xyXG5cclxuICAgICAgLy8gU2hvdyB0aGUgU3VtIGNoZWNrYm94ZXMgdGhhdCBtYXRjaCB0aGUgc2VsZWN0ZWQgc2NlbmUuXHJcbiAgICAgIC8vIHVubGluayBpcyB1bm5lY2Vzc2FyeSwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbS5cclxuICAgICAgdmlld1Byb3BlcnRpZXMuY29vcmRpbmF0ZVNuYXBNb2RlUHJvcGVydHkubGluayggY29vcmRpbmF0ZVNuYXBNb2RlID0+IHtcclxuICAgICAgICBzdW1DaGVja2JveGVzLnZpc2libGUgPSAoIGNvb3JkaW5hdGVTbmFwTW9kZSA9PT0gZ3JhcGguY29vcmRpbmF0ZVNuYXBNb2RlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBWYWx1ZXNcclxuICAgIGNvbnN0IHZhbHVlc0NoZWNrYm94ID0gbmV3IFZhbHVlc0NoZWNrYm94KCB2aWV3UHJvcGVydGllcy52YWx1ZXNWaXNpYmxlUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBBbmdsZXNcclxuICAgIGNvbnN0IGFuZ2xlc0NoZWNrYm94ID0gbmV3IEFuZ2xlc0NoZWNrYm94KCB2aWV3UHJvcGVydGllcy5hbmdsZXNWaXNpYmxlUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBHcmlkXHJcbiAgICBjb25zdCBncmlkQ2hlY2tib3ggPSBuZXcgVmVjdG9yQWRkaXRpb25HcmlkQ2hlY2tib3goIHZpZXdQcm9wZXJ0aWVzLmdyaWRWaXNpYmxlUHJvcGVydHkgKTtcclxuXHJcbiAgICBzdXBlciggW1xyXG5cclxuICAgICAgLy8gY2hlY2tib3hlcywgd3JhcHBlZCB3aXRoIEFsaWduQm94IHNvIHRoYXQgdGhleSBhcmUgYWxsIHRoZSBzYW1lIGhlaWdodFxyXG4gICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgIHNwYWNpbmc6IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLkNIRUNLQk9YX1lfU1BBQ0lORyxcclxuICAgICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBzdW1DaGVja2JveENvbnRhaW5lcixcclxuICAgICAgICAgIG5ldyBBbGlnbkJveCggdmFsdWVzQ2hlY2tib3gsIGFsaWduQm94T3B0aW9ucyApLFxyXG4gICAgICAgICAgbmV3IEFsaWduQm94KCBhbmdsZXNDaGVja2JveCwgYWxpZ25Cb3hPcHRpb25zICksXHJcbiAgICAgICAgICBuZXcgQWxpZ25Cb3goIGdyaWRDaGVja2JveCwgYWxpZ25Cb3hPcHRpb25zIClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKSxcclxuXHJcbiAgICAgIC8vIHNlcGFyYXRvclxyXG4gICAgICBuZXcgSFNlcGFyYXRvciggeyBzdHJva2U6IENvbG9yLkJMQUNLIH0gKSxcclxuXHJcbiAgICAgIC8vIENvbXBvbmVudHMgcmFkaW8gYnV0dG9uc1xyXG4gICAgICBuZXcgQ29tcG9uZW50U3R5bGVDb250cm9sKCBjb21wb25lbnRTdHlsZVByb3BlcnR5LCB7XHJcbiAgICAgICAgbWF4V2lkdGg6IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLkdSQVBIX0NPTlRST0xfUEFORUxfQ09OVEVOVF9XSURUSFxyXG4gICAgICB9IClcclxuXHJcbiAgICBdLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlvbi5yZWdpc3RlciggJ0xhYkdyYXBoQ29udHJvbFBhbmVsJywgTGFiR3JhcGhDb250cm9sUGFuZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxTQUFTQyxRQUFRLEVBQUVDLFVBQVUsRUFBRUMsS0FBSyxFQUFFQyxVQUFVLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN2RyxPQUFPQyx1QkFBdUIsTUFBTSx5Q0FBeUM7QUFDN0UsT0FBT0MsY0FBYyxNQUFNLHFDQUFxQztBQUNoRSxPQUFPQyxxQkFBcUIsTUFBTSw0Q0FBNEM7QUFDOUUsT0FBT0MsaUJBQWlCLE1BQU0sd0NBQXdDO0FBQ3RFLE9BQU9DLFdBQVcsTUFBTSxrQ0FBa0M7QUFDMUQsT0FBT0MsY0FBYyxNQUFNLHFDQUFxQztBQUNoRSxPQUFPQywwQkFBMEIsTUFBTSxpREFBaUQ7QUFDeEYsT0FBT0MsNEJBQTRCLE1BQU0sbURBQW1EO0FBQzVGLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsUUFBUSxNQUFNLHNCQUFzQjtBQUUzQyxlQUFlLE1BQU1DLG9CQUFvQixTQUFTUCxpQkFBaUIsQ0FBQztFQUVsRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVEsV0FBV0EsQ0FBRUMsY0FBYyxFQUFFQyxVQUFVLEVBQUVDLHNCQUFzQixFQUNsREMsbUJBQW1CLEVBQUVDLG1CQUFtQixFQUFFQyxjQUFjLEVBQUVDLE9BQU8sRUFBRztJQUUvRUMsTUFBTSxJQUFJQSxNQUFNLENBQUVQLGNBQWMsWUFBWUgsUUFBUSxFQUFHLDJCQUEwQkcsY0FBZSxFQUFFLENBQUM7SUFDbkdPLE1BQU0sSUFBSUEsTUFBTSxDQUFFTixVQUFVLFlBQVlKLFFBQVEsRUFBRyx1QkFBc0JJLFVBQVcsRUFBRSxDQUFDO0lBQ3ZGTSxNQUFNLElBQUlBLE1BQU0sQ0FBRUwsc0JBQXNCLFlBQVlyQixtQkFBbUIsRUFBRyxtQ0FBa0NxQixzQkFBdUIsRUFBRSxDQUFDO0lBQ3RJSyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsY0FBYyxZQUFZViw0QkFBNEIsRUFBRywyQkFBMEJVLGNBQWUsRUFBRSxDQUFDOztJQUV2SDtJQUNBLE1BQU1HLGVBQWUsR0FBRztNQUN0QkMsS0FBSyxFQUFFLElBQUkxQixVQUFVLENBQUU7UUFDckIyQixlQUFlLEVBQUUsS0FBSztRQUN0QkMsYUFBYSxFQUFFO01BQ2pCLENBQUU7SUFDSixDQUFDOztJQUVEO0lBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSTFCLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUVjLGNBQWMsRUFBRUMsVUFBVSxDQUFFLENBQUNZLE9BQU8sQ0FBRUMsS0FBSyxJQUFJO01BRS9DLE1BQU1DLGFBQWEsR0FBRyxJQUFJNUIsSUFBSSxDQUFFO1FBQzlCNkIsUUFBUSxFQUFFLENBQ1IsSUFBSWxDLFFBQVEsQ0FBRSxJQUFJVSxXQUFXLENBQUVXLG1CQUFtQixFQUFFVyxLQUFLLENBQUNHLFVBQVUsQ0FBQ0Msa0JBQW1CLENBQUMsRUFBRVYsZUFBZ0IsQ0FBQyxFQUM1RyxJQUFJMUIsUUFBUSxDQUFFLElBQUlVLFdBQVcsQ0FBRVksbUJBQW1CLEVBQUVVLEtBQUssQ0FBQ0ssVUFBVSxDQUFDRCxrQkFBbUIsQ0FBQyxFQUFFVixlQUFnQixDQUFDLENBQzdHO1FBQ0RZLE9BQU8sRUFBRWhDLHVCQUF1QixDQUFDaUMsa0JBQWtCO1FBQ25EQyxLQUFLLEVBQUU7TUFDVCxDQUFFLENBQUM7TUFDSFYsb0JBQW9CLENBQUNXLFFBQVEsQ0FBRVIsYUFBYyxDQUFDOztNQUU5QztNQUNBO01BQ0FWLGNBQWMsQ0FBQ21CLDBCQUEwQixDQUFDQyxJQUFJLENBQUVDLGtCQUFrQixJQUFJO1FBQ3BFWCxhQUFhLENBQUNZLE9BQU8sR0FBS0Qsa0JBQWtCLEtBQUtaLEtBQUssQ0FBQ1ksa0JBQW9CO01BQzdFLENBQUUsQ0FBQztJQUNMLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1FLGNBQWMsR0FBRyxJQUFJbkMsY0FBYyxDQUFFWSxjQUFjLENBQUN3QixxQkFBc0IsQ0FBQzs7SUFFakY7SUFDQSxNQUFNQyxjQUFjLEdBQUcsSUFBSXpDLGNBQWMsQ0FBRWdCLGNBQWMsQ0FBQzBCLHFCQUFzQixDQUFDOztJQUVqRjtJQUNBLE1BQU1DLFlBQVksR0FBRyxJQUFJdEMsMEJBQTBCLENBQUVXLGNBQWMsQ0FBQzRCLG1CQUFvQixDQUFDO0lBRXpGLEtBQUssQ0FBRTtJQUVMO0lBQ0EsSUFBSTlDLElBQUksQ0FBRTtNQUNSaUMsT0FBTyxFQUFFaEMsdUJBQXVCLENBQUNpQyxrQkFBa0I7TUFDbkRDLEtBQUssRUFBRSxNQUFNO01BQ2JOLFFBQVEsRUFBRSxDQUNSSixvQkFBb0IsRUFDcEIsSUFBSTlCLFFBQVEsQ0FBRThDLGNBQWMsRUFBRXBCLGVBQWdCLENBQUMsRUFDL0MsSUFBSTFCLFFBQVEsQ0FBRWdELGNBQWMsRUFBRXRCLGVBQWdCLENBQUMsRUFDL0MsSUFBSTFCLFFBQVEsQ0FBRWtELFlBQVksRUFBRXhCLGVBQWdCLENBQUM7SUFFakQsQ0FBRSxDQUFDO0lBRUg7SUFDQSxJQUFJdkIsVUFBVSxDQUFFO01BQUVpRCxNQUFNLEVBQUVsRCxLQUFLLENBQUNtRDtJQUFNLENBQUUsQ0FBQztJQUV6QztJQUNBLElBQUk3QyxxQkFBcUIsQ0FBRVksc0JBQXNCLEVBQUU7TUFDakRrQyxRQUFRLEVBQUVoRCx1QkFBdUIsQ0FBQ2lEO0lBQ3BDLENBQUUsQ0FBQyxDQUVKLEVBQUUvQixPQUFRLENBQUM7RUFDZDtBQUNGO0FBRUFWLGNBQWMsQ0FBQzBDLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRXhDLG9CQUFxQixDQUFDIn0=