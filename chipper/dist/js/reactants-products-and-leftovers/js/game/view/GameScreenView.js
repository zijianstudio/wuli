// Copyright 2014-2023, University of Colorado Boulder

/**
 * View for the 'Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import RPALConstants from '../../common/RPALConstants.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import PlayNode from './PlayNode.js';
import ResultsNode from './ResultsNode.js';
import SettingsNode from './SettingsNode.js';
export default class GameScreenView extends ScreenView {
  constructor(model, tandem) {
    super({
      layoutBounds: RPALConstants.SCREEN_VIEW_LAYOUT_BOUNDS,
      tandem: tandem
    });

    // sounds
    const audioPlayer = new GameAudioPlayer();
    const settingsNode = new SettingsNode(model, this.layoutBounds, tandem.createTandem('settingsNode'));
    this.addChild(settingsNode);
    const playNode = new PlayNode(model, this.layoutBounds, this.visibleBoundsProperty, audioPlayer, tandem.createTandem('playNode'));
    this.addChild(playNode);
    this.resultsNode = new ResultsNode(model, this.layoutBounds, audioPlayer, tandem.createTandem('resultsNode'));
    this.addChild(this.resultsNode);
  }

  /**
   * Animation step function.
   * @param dt - time between step calls, in seconds
   */
  step(dt) {
    // animate the reward
    if (this.resultsNode && this.resultsNode.visible) {
      this.resultsNode.step(dt);
    }
    super.step(dt);
  }
}
reactantsProductsAndLeftovers.register('GameScreenView', GameScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwiR2FtZUF1ZGlvUGxheWVyIiwiUlBBTENvbnN0YW50cyIsInJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIiwiUGxheU5vZGUiLCJSZXN1bHRzTm9kZSIsIlNldHRpbmdzTm9kZSIsIkdhbWVTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImxheW91dEJvdW5kcyIsIlNDUkVFTl9WSUVXX0xBWU9VVF9CT1VORFMiLCJhdWRpb1BsYXllciIsInNldHRpbmdzTm9kZSIsImNyZWF0ZVRhbmRlbSIsImFkZENoaWxkIiwicGxheU5vZGUiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJyZXN1bHRzTm9kZSIsInN0ZXAiLCJkdCIsInZpc2libGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdhbWVTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgZm9yIHRoZSAnR2FtZScgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgR2FtZUF1ZGlvUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVBdWRpb1BsYXllci5qcyc7XHJcbmltcG9ydCBSUEFMQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9SUEFMQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIGZyb20gJy4uLy4uL3JlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLmpzJztcclxuaW1wb3J0IEdhbWVNb2RlbCBmcm9tICcuLi9tb2RlbC9HYW1lTW9kZWwuanMnO1xyXG5pbXBvcnQgUGxheU5vZGUgZnJvbSAnLi9QbGF5Tm9kZS5qcyc7XHJcbmltcG9ydCBSZXN1bHRzTm9kZSBmcm9tICcuL1Jlc3VsdHNOb2RlLmpzJztcclxuaW1wb3J0IFNldHRpbmdzTm9kZSBmcm9tICcuL1NldHRpbmdzTm9kZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHJlc3VsdHNOb2RlOiBSZXN1bHRzTm9kZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogR2FtZU1vZGVsLCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBsYXlvdXRCb3VuZHM6IFJQQUxDb25zdGFudHMuU0NSRUVOX1ZJRVdfTEFZT1VUX0JPVU5EUyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzb3VuZHNcclxuICAgIGNvbnN0IGF1ZGlvUGxheWVyID0gbmV3IEdhbWVBdWRpb1BsYXllcigpO1xyXG5cclxuICAgIGNvbnN0IHNldHRpbmdzTm9kZSA9IG5ldyBTZXR0aW5nc05vZGUoIG1vZGVsLCB0aGlzLmxheW91dEJvdW5kcywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NldHRpbmdzTm9kZScgKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2V0dGluZ3NOb2RlICk7XHJcblxyXG4gICAgY29uc3QgcGxheU5vZGUgPSBuZXcgUGxheU5vZGUoIG1vZGVsLCB0aGlzLmxheW91dEJvdW5kcywgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIGF1ZGlvUGxheWVyLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGxheU5vZGUnICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBsYXlOb2RlICk7XHJcblxyXG4gICAgdGhpcy5yZXN1bHRzTm9kZSA9IG5ldyBSZXN1bHRzTm9kZSggbW9kZWwsIHRoaXMubGF5b3V0Qm91bmRzLCBhdWRpb1BsYXllciwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc3VsdHNOb2RlJyApICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnJlc3VsdHNOb2RlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRpb24gc3RlcCBmdW5jdGlvbi5cclxuICAgKiBAcGFyYW0gZHQgLSB0aW1lIGJldHdlZW4gc3RlcCBjYWxscywgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIC8vIGFuaW1hdGUgdGhlIHJld2FyZFxyXG4gICAgaWYgKCB0aGlzLnJlc3VsdHNOb2RlICYmIHRoaXMucmVzdWx0c05vZGUudmlzaWJsZSApIHtcclxuICAgICAgdGhpcy5yZXN1bHRzTm9kZS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG59XHJcblxyXG5yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5yZWdpc3RlciggJ0dhbWVTY3JlZW5WaWV3JywgR2FtZVNjcmVlblZpZXcgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLG9DQUFvQztBQUUzRCxPQUFPQyxlQUFlLE1BQU0seUNBQXlDO0FBQ3JFLE9BQU9DLGFBQWEsTUFBTSwrQkFBK0I7QUFDekQsT0FBT0MsNkJBQTZCLE1BQU0sd0NBQXdDO0FBRWxGLE9BQU9DLFFBQVEsTUFBTSxlQUFlO0FBQ3BDLE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFDMUMsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUU1QyxlQUFlLE1BQU1DLGNBQWMsU0FBU1AsVUFBVSxDQUFDO0VBSTlDUSxXQUFXQSxDQUFFQyxLQUFnQixFQUFFQyxNQUFjLEVBQUc7SUFFckQsS0FBSyxDQUFFO01BQ0xDLFlBQVksRUFBRVQsYUFBYSxDQUFDVSx5QkFBeUI7TUFDckRGLE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNRyxXQUFXLEdBQUcsSUFBSVosZUFBZSxDQUFDLENBQUM7SUFFekMsTUFBTWEsWUFBWSxHQUFHLElBQUlSLFlBQVksQ0FBRUcsS0FBSyxFQUFFLElBQUksQ0FBQ0UsWUFBWSxFQUFFRCxNQUFNLENBQUNLLFlBQVksQ0FBRSxjQUFlLENBQUUsQ0FBQztJQUN4RyxJQUFJLENBQUNDLFFBQVEsQ0FBRUYsWUFBYSxDQUFDO0lBRTdCLE1BQU1HLFFBQVEsR0FBRyxJQUFJYixRQUFRLENBQUVLLEtBQUssRUFBRSxJQUFJLENBQUNFLFlBQVksRUFBRSxJQUFJLENBQUNPLHFCQUFxQixFQUFFTCxXQUFXLEVBQUVILE1BQU0sQ0FBQ0ssWUFBWSxDQUFFLFVBQVcsQ0FBRSxDQUFDO0lBQ3JJLElBQUksQ0FBQ0MsUUFBUSxDQUFFQyxRQUFTLENBQUM7SUFFekIsSUFBSSxDQUFDRSxXQUFXLEdBQUcsSUFBSWQsV0FBVyxDQUFFSSxLQUFLLEVBQUUsSUFBSSxDQUFDRSxZQUFZLEVBQUVFLFdBQVcsRUFBRUgsTUFBTSxDQUFDSyxZQUFZLENBQUUsYUFBYyxDQUFFLENBQUM7SUFDakgsSUFBSSxDQUFDQyxRQUFRLENBQUUsSUFBSSxDQUFDRyxXQUFZLENBQUM7RUFDbkM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDa0JDLElBQUlBLENBQUVDLEVBQVUsRUFBUztJQUV2QztJQUNBLElBQUssSUFBSSxDQUFDRixXQUFXLElBQUksSUFBSSxDQUFDQSxXQUFXLENBQUNHLE9BQU8sRUFBRztNQUNsRCxJQUFJLENBQUNILFdBQVcsQ0FBQ0MsSUFBSSxDQUFFQyxFQUFHLENBQUM7SUFDN0I7SUFFQSxLQUFLLENBQUNELElBQUksQ0FBRUMsRUFBRyxDQUFDO0VBQ2xCO0FBQ0Y7QUFFQWxCLDZCQUE2QixDQUFDb0IsUUFBUSxDQUFFLGdCQUFnQixFQUFFaEIsY0FBZSxDQUFDIn0=