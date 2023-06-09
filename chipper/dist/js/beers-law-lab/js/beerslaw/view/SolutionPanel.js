// Copyright 2013-2023, University of Colorado Boulder

/**
 * Control panel for solution.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import beersLawLab from '../../beersLawLab.js';
import ConcentrationControl from './ConcentrationControl.js';
import SolutionControl from './SolutionControl.js';
export default class SolutionPanel extends Panel {
  constructor(solutions, solutionProperty, solutionInCuvette, solutionListParent, providedOptions) {
    const options = optionize()({
      xMargin: 15,
      yMargin: 15,
      fill: '#F0F0F0',
      stroke: 'gray',
      lineWidth: 1,
      maxWidth: 575 // determined empirically
    }, providedOptions);
    const solutionComboBox = new SolutionControl(solutionProperty, solutions, solutionListParent, {
      comboBoxOptions: {
        tandem: options.tandem.createTandem('solutionComboBox')
      }
    });
    const concentrationControl = new ConcentrationControl(solutions, solutionProperty, solutionInCuvette.concentrationProperty, {
      tandem: options.tandem.createTandem('concentrationControl')
    });
    const contentNode = new VBox({
      spacing: 15,
      align: 'left',
      children: [solutionComboBox, concentrationControl]
    });
    super(contentNode, options);
    this.addLinkedElement(solutionInCuvette, {
      tandem: options.tandem.createTandem('solutionInCuvette')
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
beersLawLab.register('SolutionPanel', SolutionPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJWQm94IiwiUGFuZWwiLCJiZWVyc0xhd0xhYiIsIkNvbmNlbnRyYXRpb25Db250cm9sIiwiU29sdXRpb25Db250cm9sIiwiU29sdXRpb25QYW5lbCIsImNvbnN0cnVjdG9yIiwic29sdXRpb25zIiwic29sdXRpb25Qcm9wZXJ0eSIsInNvbHV0aW9uSW5DdXZldHRlIiwic29sdXRpb25MaXN0UGFyZW50IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsIm1heFdpZHRoIiwic29sdXRpb25Db21ib0JveCIsImNvbWJvQm94T3B0aW9ucyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImNvbmNlbnRyYXRpb25Db250cm9sIiwiY29uY2VudHJhdGlvblByb3BlcnR5IiwiY29udGVudE5vZGUiLCJzcGFjaW5nIiwiYWxpZ24iLCJjaGlsZHJlbiIsImFkZExpbmtlZEVsZW1lbnQiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTb2x1dGlvblBhbmVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnRyb2wgcGFuZWwgZm9yIHNvbHV0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGFuZWwsIHsgUGFuZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IGJlZXJzTGF3TGFiIGZyb20gJy4uLy4uL2JlZXJzTGF3TGFiLmpzJztcclxuaW1wb3J0IEJlZXJzTGF3U29sdXRpb24gZnJvbSAnLi4vbW9kZWwvQmVlcnNMYXdTb2x1dGlvbi5qcyc7XHJcbmltcG9ydCBDb25jZW50cmF0aW9uQ29udHJvbCBmcm9tICcuL0NvbmNlbnRyYXRpb25Db250cm9sLmpzJztcclxuaW1wb3J0IFNvbHV0aW9uQ29udHJvbCBmcm9tICcuL1NvbHV0aW9uQ29udHJvbC5qcyc7XHJcbmltcG9ydCBTb2x1dGlvbkluQ3V2ZXR0ZSBmcm9tICcuLi9tb2RlbC9Tb2x1dGlvbkluQ3V2ZXR0ZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgU29sdXRpb25QYW5lbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGFuZWxPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2x1dGlvblBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNvbHV0aW9uczogQmVlcnNMYXdTb2x1dGlvbltdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgc29sdXRpb25Qcm9wZXJ0eTogUHJvcGVydHk8QmVlcnNMYXdTb2x1dGlvbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBzb2x1dGlvbkluQ3V2ZXR0ZTogU29sdXRpb25JbkN1dmV0dGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICBzb2x1dGlvbkxpc3RQYXJlbnQ6IE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IFNvbHV0aW9uUGFuZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U29sdXRpb25QYW5lbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYW5lbE9wdGlvbnM+KCkoIHtcclxuICAgICAgeE1hcmdpbjogMTUsXHJcbiAgICAgIHlNYXJnaW46IDE1LFxyXG4gICAgICBmaWxsOiAnI0YwRjBGMCcsXHJcbiAgICAgIHN0cm9rZTogJ2dyYXknLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIG1heFdpZHRoOiA1NzUgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3Qgc29sdXRpb25Db21ib0JveCA9IG5ldyBTb2x1dGlvbkNvbnRyb2woIHNvbHV0aW9uUHJvcGVydHksIHNvbHV0aW9ucywgc29sdXRpb25MaXN0UGFyZW50LCB7XHJcbiAgICAgIGNvbWJvQm94T3B0aW9uczoge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc29sdXRpb25Db21ib0JveCcgKVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29uY2VudHJhdGlvbkNvbnRyb2wgPSBuZXcgQ29uY2VudHJhdGlvbkNvbnRyb2woIHNvbHV0aW9ucywgc29sdXRpb25Qcm9wZXJ0eSwgc29sdXRpb25JbkN1dmV0dGUuY29uY2VudHJhdGlvblByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29uY2VudHJhdGlvbkNvbnRyb2wnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50Tm9kZSA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDE1LFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBjaGlsZHJlbjogWyBzb2x1dGlvbkNvbWJvQm94LCBjb25jZW50cmF0aW9uQ29udHJvbCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnROb2RlLCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBzb2x1dGlvbkluQ3V2ZXR0ZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NvbHV0aW9uSW5DdXZldHRlJyApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuYmVlcnNMYXdMYWIucmVnaXN0ZXIoICdTb2x1dGlvblBhbmVsJywgU29sdXRpb25QYW5lbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixTQUF1Q0MsSUFBSSxRQUFRLG1DQUFtQztBQUN0RixPQUFPQyxLQUFLLE1BQXdCLDZCQUE2QjtBQUNqRSxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBRTlDLE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUM1RCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBT2xELGVBQWUsTUFBTUMsYUFBYSxTQUFTSixLQUFLLENBQUM7RUFFeENLLFdBQVdBLENBQUVDLFNBQTZCLEVBQzdCQyxnQkFBNEMsRUFDNUNDLGlCQUFvQyxFQUNwQ0Msa0JBQXdCLEVBQ3hCQyxlQUFxQyxFQUFHO0lBRTFELE1BQU1DLE9BQU8sR0FBR2IsU0FBUyxDQUFrRCxDQUFDLENBQUU7TUFDNUVjLE9BQU8sRUFBRSxFQUFFO01BQ1hDLE9BQU8sRUFBRSxFQUFFO01BQ1hDLElBQUksRUFBRSxTQUFTO01BQ2ZDLE1BQU0sRUFBRSxNQUFNO01BQ2RDLFNBQVMsRUFBRSxDQUFDO01BQ1pDLFFBQVEsRUFBRSxHQUFHLENBQUM7SUFDaEIsQ0FBQyxFQUFFUCxlQUFnQixDQUFDO0lBRXBCLE1BQU1RLGdCQUFnQixHQUFHLElBQUlmLGVBQWUsQ0FBRUksZ0JBQWdCLEVBQUVELFNBQVMsRUFBRUcsa0JBQWtCLEVBQUU7TUFDN0ZVLGVBQWUsRUFBRTtRQUNmQyxNQUFNLEVBQUVULE9BQU8sQ0FBQ1MsTUFBTSxDQUFDQyxZQUFZLENBQUUsa0JBQW1CO01BQzFEO0lBQ0YsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSXBCLG9CQUFvQixDQUFFSSxTQUFTLEVBQUVDLGdCQUFnQixFQUFFQyxpQkFBaUIsQ0FBQ2UscUJBQXFCLEVBQUU7TUFDM0hILE1BQU0sRUFBRVQsT0FBTyxDQUFDUyxNQUFNLENBQUNDLFlBQVksQ0FBRSxzQkFBdUI7SUFDOUQsQ0FBRSxDQUFDO0lBRUgsTUFBTUcsV0FBVyxHQUFHLElBQUl6QixJQUFJLENBQUU7TUFDNUIwQixPQUFPLEVBQUUsRUFBRTtNQUNYQyxLQUFLLEVBQUUsTUFBTTtNQUNiQyxRQUFRLEVBQUUsQ0FBRVQsZ0JBQWdCLEVBQUVJLG9CQUFvQjtJQUNwRCxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUVFLFdBQVcsRUFBRWIsT0FBUSxDQUFDO0lBRTdCLElBQUksQ0FBQ2lCLGdCQUFnQixDQUFFcEIsaUJBQWlCLEVBQUU7TUFDeENZLE1BQU0sRUFBRVQsT0FBTyxDQUFDUyxNQUFNLENBQUNDLFlBQVksQ0FBRSxtQkFBb0I7SUFDM0QsQ0FBRSxDQUFDO0VBQ0w7RUFFZ0JRLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBNUIsV0FBVyxDQUFDOEIsUUFBUSxDQUFFLGVBQWUsRUFBRTNCLGFBQWMsQ0FBQyJ9