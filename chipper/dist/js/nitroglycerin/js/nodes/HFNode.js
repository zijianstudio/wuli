// Copyright 2013-2022, University of Colorado Boulder

/**
 * HF Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode from './HorizontalMoleculeNode.js';
export default class HFNode extends HorizontalMoleculeNode {
  constructor(providedOptions) {
    const options = optionize()({
      direction: 'rightToLeft',
      overlapPercent: 0.5
    }, providedOptions);
    super([Element.F, Element.H], options);
  }
}
nitroglycerin.register('HFNode', HFNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJFbGVtZW50Iiwibml0cm9nbHljZXJpbiIsIkhvcml6b250YWxNb2xlY3VsZU5vZGUiLCJIRk5vZGUiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJkaXJlY3Rpb24iLCJvdmVybGFwUGVyY2VudCIsIkYiLCJIIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJIRk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSEYgTW9sZWN1bGVcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuLi9FbGVtZW50LmpzJztcclxuaW1wb3J0IG5pdHJvZ2x5Y2VyaW4gZnJvbSAnLi4vbml0cm9nbHljZXJpbi5qcyc7XHJcbmltcG9ydCBIb3Jpem9udGFsTW9sZWN1bGVOb2RlLCB7IEhvcml6b250YWxNb2xlY3VsZU5vZGVPcHRpb25zIH0gZnJvbSAnLi9Ib3Jpem9udGFsTW9sZWN1bGVOb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBIRk5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PEhvcml6b250YWxNb2xlY3VsZU5vZGVPcHRpb25zLCAnZGlyZWN0aW9uJyB8ICdvdmVybGFwUGVyY2VudCc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSEZOb2RlIGV4dGVuZHMgSG9yaXpvbnRhbE1vbGVjdWxlTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogSEZOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEhGTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBIb3Jpem9udGFsTW9sZWN1bGVOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICBkaXJlY3Rpb246ICdyaWdodFRvTGVmdCcsXHJcbiAgICAgIG92ZXJsYXBQZXJjZW50OiAwLjVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBbIEVsZW1lbnQuRiwgRWxlbWVudC5IIF0sIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbm5pdHJvZ2x5Y2VyaW4ucmVnaXN0ZXIoICdIRk5vZGUnLCBIRk5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUE0QixvQ0FBb0M7QUFFaEYsT0FBT0MsT0FBTyxNQUFNLGVBQWU7QUFDbkMsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjtBQUMvQyxPQUFPQyxzQkFBc0IsTUFBeUMsNkJBQTZCO0FBS25HLGVBQWUsTUFBTUMsTUFBTSxTQUFTRCxzQkFBc0IsQ0FBQztFQUVsREUsV0FBV0EsQ0FBRUMsZUFBK0IsRUFBRztJQUVwRCxNQUFNQyxPQUFPLEdBQUdQLFNBQVMsQ0FBNEQsQ0FBQyxDQUFFO01BQ3RGUSxTQUFTLEVBQUUsYUFBYTtNQUN4QkMsY0FBYyxFQUFFO0lBQ2xCLENBQUMsRUFBRUgsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUUsQ0FBRUwsT0FBTyxDQUFDUyxDQUFDLEVBQUVULE9BQU8sQ0FBQ1UsQ0FBQyxDQUFFLEVBQUVKLE9BQVEsQ0FBQztFQUM1QztBQUNGO0FBRUFMLGFBQWEsQ0FBQ1UsUUFBUSxDQUFFLFFBQVEsRUFBRVIsTUFBTyxDQUFDIn0=