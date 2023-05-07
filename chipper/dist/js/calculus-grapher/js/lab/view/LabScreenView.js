// Copyright 2020-2023, University of Colorado Boulder

/**
 * LabScreenView is the top-level view for the 'Lab' screen. This class adds no additional functionality, but is
 * provided for completeness of the ScreenView class hierarchy.
 *
 * @author Martin Veillette
 */

import calculusGrapher from '../../calculusGrapher.js';
import CalculusGrapherScreenView from '../../common/view/CalculusGrapherScreenView.js';
export default class LabScreenView extends CalculusGrapherScreenView {
  constructor(model, providedOptions) {
    super(model, providedOptions);
  }
}
calculusGrapher.register('LabScreenView', LabScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYWxjdWx1c0dyYXBoZXIiLCJDYWxjdWx1c0dyYXBoZXJTY3JlZW5WaWV3IiwiTGFiU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJwcm92aWRlZE9wdGlvbnMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxhYlNjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTGFiU2NyZWVuVmlldyBpcyB0aGUgdG9wLWxldmVsIHZpZXcgZm9yIHRoZSAnTGFiJyBzY3JlZW4uIFRoaXMgY2xhc3MgYWRkcyBubyBhZGRpdGlvbmFsIGZ1bmN0aW9uYWxpdHksIGJ1dCBpc1xyXG4gKiBwcm92aWRlZCBmb3IgY29tcGxldGVuZXNzIG9mIHRoZSBTY3JlZW5WaWV3IGNsYXNzIGhpZXJhcmNoeS5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgY2FsY3VsdXNHcmFwaGVyIGZyb20gJy4uLy4uL2NhbGN1bHVzR3JhcGhlci5qcyc7XHJcbmltcG9ydCBDYWxjdWx1c0dyYXBoZXJTY3JlZW5WaWV3LCB7IENhbGN1bHVzR3JhcGhlclNjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQ2FsY3VsdXNHcmFwaGVyU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBMYWJNb2RlbCBmcm9tICcuLi9tb2RlbC9MYWJNb2RlbC5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgTGFiU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgUGlja1JlcXVpcmVkPENhbGN1bHVzR3JhcGhlclNjcmVlblZpZXdPcHRpb25zLCAnZ3JhcGhTZXRSYWRpb0J1dHRvbkdyb3VwSXRlbXMnIHwgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGFiU2NyZWVuVmlldyBleHRlbmRzIENhbGN1bHVzR3JhcGhlclNjcmVlblZpZXcge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBMYWJNb2RlbCwgcHJvdmlkZWRPcHRpb25zOiBMYWJTY3JlZW5WaWV3T3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBtb2RlbCwgcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5jYWxjdWx1c0dyYXBoZXIucmVnaXN0ZXIoICdMYWJTY3JlZW5WaWV3JywgTGFiU2NyZWVuVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MseUJBQXlCLE1BQTRDLGdEQUFnRDtBQVE1SCxlQUFlLE1BQU1DLGFBQWEsU0FBU0QseUJBQXlCLENBQUM7RUFFNURFLFdBQVdBLENBQUVDLEtBQWUsRUFBRUMsZUFBcUMsRUFBRztJQUMzRSxLQUFLLENBQUVELEtBQUssRUFBRUMsZUFBZ0IsQ0FBQztFQUNqQztBQUNGO0FBRUFMLGVBQWUsQ0FBQ00sUUFBUSxDQUFFLGVBQWUsRUFBRUosYUFBYyxDQUFDIn0=