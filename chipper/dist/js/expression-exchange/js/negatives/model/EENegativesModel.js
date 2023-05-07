// Copyright 2015-2020, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */

import AllowedRepresentations from '../../common/enum/AllowedRepresentations.js';
import CoinTermCreatorSetID from '../../common/enum/CoinTermCreatorSetID.js';
import ExpressionManipulationModel from '../../common/model/ExpressionManipulationModel.js';
import expressionExchange from '../../expressionExchange.js';
class EENegativesModel extends ExpressionManipulationModel {
  /**
   */
  constructor() {
    super({
      coinTermCollection: CoinTermCreatorSetID.VARIABLES,
      allowedRepresentations: AllowedRepresentations.VARIABLES_ONLY
    });
  }
}
expressionExchange.register('EENegativesModel', EENegativesModel);
export default EENegativesModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbGxvd2VkUmVwcmVzZW50YXRpb25zIiwiQ29pblRlcm1DcmVhdG9yU2V0SUQiLCJFeHByZXNzaW9uTWFuaXB1bGF0aW9uTW9kZWwiLCJleHByZXNzaW9uRXhjaGFuZ2UiLCJFRU5lZ2F0aXZlc01vZGVsIiwiY29uc3RydWN0b3IiLCJjb2luVGVybUNvbGxlY3Rpb24iLCJWQVJJQUJMRVMiLCJhbGxvd2VkUmVwcmVzZW50YXRpb25zIiwiVkFSSUFCTEVTX09OTFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVFTmVnYXRpdmVzTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogbWFpbiBtb2RlbCBmb3IgdGhlICdFeHBsb3JlJyBzY3JlZW5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBBbGxvd2VkUmVwcmVzZW50YXRpb25zIGZyb20gJy4uLy4uL2NvbW1vbi9lbnVtL0FsbG93ZWRSZXByZXNlbnRhdGlvbnMuanMnO1xyXG5pbXBvcnQgQ29pblRlcm1DcmVhdG9yU2V0SUQgZnJvbSAnLi4vLi4vY29tbW9uL2VudW0vQ29pblRlcm1DcmVhdG9yU2V0SUQuanMnO1xyXG5pbXBvcnQgRXhwcmVzc2lvbk1hbmlwdWxhdGlvbk1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FeHByZXNzaW9uTWFuaXB1bGF0aW9uTW9kZWwuanMnO1xyXG5pbXBvcnQgZXhwcmVzc2lvbkV4Y2hhbmdlIGZyb20gJy4uLy4uL2V4cHJlc3Npb25FeGNoYW5nZS5qcyc7XHJcblxyXG5jbGFzcyBFRU5lZ2F0aXZlc01vZGVsIGV4dGVuZHMgRXhwcmVzc2lvbk1hbmlwdWxhdGlvbk1vZGVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY29pblRlcm1Db2xsZWN0aW9uOiBDb2luVGVybUNyZWF0b3JTZXRJRC5WQVJJQUJMRVMsXHJcbiAgICAgIGFsbG93ZWRSZXByZXNlbnRhdGlvbnM6IEFsbG93ZWRSZXByZXNlbnRhdGlvbnMuVkFSSUFCTEVTX09OTFlcclxuICAgIH0gKTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG5leHByZXNzaW9uRXhjaGFuZ2UucmVnaXN0ZXIoICdFRU5lZ2F0aXZlc01vZGVsJywgRUVOZWdhdGl2ZXNNb2RlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRUVOZWdhdGl2ZXNNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esc0JBQXNCLE1BQU0sNkNBQTZDO0FBQ2hGLE9BQU9DLG9CQUFvQixNQUFNLDJDQUEyQztBQUM1RSxPQUFPQywyQkFBMkIsTUFBTSxtREFBbUQ7QUFDM0YsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBRTVELE1BQU1DLGdCQUFnQixTQUFTRiwyQkFBMkIsQ0FBQztFQUV6RDtBQUNGO0VBQ0VHLFdBQVdBLENBQUEsRUFBRztJQUVaLEtBQUssQ0FBRTtNQUNMQyxrQkFBa0IsRUFBRUwsb0JBQW9CLENBQUNNLFNBQVM7TUFDbERDLHNCQUFzQixFQUFFUixzQkFBc0IsQ0FBQ1M7SUFDakQsQ0FBRSxDQUFDO0VBRUw7QUFDRjtBQUVBTixrQkFBa0IsQ0FBQ08sUUFBUSxDQUFFLGtCQUFrQixFQUFFTixnQkFBaUIsQ0FBQztBQUVuRSxlQUFlQSxnQkFBZ0IifQ==