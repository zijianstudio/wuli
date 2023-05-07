// Copyright 2022, University of Colorado Boulder

/**
 * 'Solve for x' text that appears in a couple of places in the 'Solve It!' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EqualityExplorerStrings from '../../EqualityExplorerStrings.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import { RichText } from '../../../../scenery/js/imports.js';
import equalityExplorer from '../../equalityExplorer.js';
export default class SolveForXText extends RichText {
  constructor(providedOptions) {
    const stringProperty = new PatternStringProperty(EqualityExplorerStrings.solveForStringProperty, {
      variable: EqualityExplorerStrings.xStringProperty
    }, {
      tandem: providedOptions.tandem.createTandem(RichText.STRING_PROPERTY_TANDEM_NAME)
    });
    super(stringProperty, providedOptions);
  }
}
equalityExplorer.register('SolveForXText', SolveForXText);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFcXVhbGl0eUV4cGxvcmVyU3RyaW5ncyIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIlJpY2hUZXh0IiwiZXF1YWxpdHlFeHBsb3JlciIsIlNvbHZlRm9yWFRleHQiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsInN0cmluZ1Byb3BlcnR5Iiwic29sdmVGb3JTdHJpbmdQcm9wZXJ0eSIsInZhcmlhYmxlIiwieFN0cmluZ1Byb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTb2x2ZUZvclhUZXh0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiAnU29sdmUgZm9yIHgnIHRleHQgdGhhdCBhcHBlYXJzIGluIGEgY291cGxlIG9mIHBsYWNlcyBpbiB0aGUgJ1NvbHZlIEl0IScgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU3RyaW5ncyBmcm9tICcuLi8uLi9FcXVhbGl0eUV4cGxvcmVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQYXR0ZXJuU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9QYXR0ZXJuU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBSaWNoVGV4dCwgUmljaFRleHRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi8uLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IHR5cGUgU29sdmVGb3JYVGV4dE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFJpY2hUZXh0T3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxSaWNoVGV4dE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbHZlRm9yWFRleHQgZXh0ZW5kcyBSaWNoVGV4dCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBTb2x2ZUZvclhUZXh0T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBzdHJpbmdQcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIEVxdWFsaXR5RXhwbG9yZXJTdHJpbmdzLnNvbHZlRm9yU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgdmFyaWFibGU6IEVxdWFsaXR5RXhwbG9yZXJTdHJpbmdzLnhTdHJpbmdQcm9wZXJ0eVxyXG4gICAgfSwge1xyXG4gICAgICB0YW5kZW06IHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBSaWNoVGV4dC5TVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBzdHJpbmdQcm9wZXJ0eSwgcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnU29sdmVGb3JYVGV4dCcsIFNvbHZlRm9yWFRleHQgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsdUJBQXVCLE1BQU0sa0NBQWtDO0FBQ3RFLE9BQU9DLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixTQUFTQyxRQUFRLFFBQXlCLG1DQUFtQztBQUc3RSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFNeEQsZUFBZSxNQUFNQyxhQUFhLFNBQVNGLFFBQVEsQ0FBQztFQUUzQ0csV0FBV0EsQ0FBRUMsZUFBcUMsRUFBRztJQUUxRCxNQUFNQyxjQUFjLEdBQUcsSUFBSU4scUJBQXFCLENBQUVELHVCQUF1QixDQUFDUSxzQkFBc0IsRUFBRTtNQUNoR0MsUUFBUSxFQUFFVCx1QkFBdUIsQ0FBQ1U7SUFDcEMsQ0FBQyxFQUFFO01BQ0RDLE1BQU0sRUFBRUwsZUFBZSxDQUFDSyxNQUFNLENBQUNDLFlBQVksQ0FBRVYsUUFBUSxDQUFDVywyQkFBNEI7SUFDcEYsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFTixjQUFjLEVBQUVELGVBQWdCLENBQUM7RUFDMUM7QUFDRjtBQUVBSCxnQkFBZ0IsQ0FBQ1csUUFBUSxDQUFFLGVBQWUsRUFBRVYsYUFBYyxDQUFDIn0=