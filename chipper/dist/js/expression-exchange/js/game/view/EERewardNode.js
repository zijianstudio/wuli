// Copyright 2017-2022, University of Colorado Boulder

/**
 * The reward that is displayed when all levels have been correctly completed.  For testing, the simulation can be run
 * with the 'showRewardNodeEveryLevel' query parameter to show the reward each time a level is successfully completed.
 *
 * @author John Blanco
 */

import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import StarNode from '../../../../scenery-phet/js/StarNode.js';
import { Text } from '../../../../scenery/js/imports.js';
import RewardNode from '../../../../vegas/js/RewardNode.js';
import CoinTermTypeID from '../../common/enum/CoinTermTypeID.js';
import CoinNodeFactory from '../../common/view/CoinNodeFactory.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const NUMBER_OF_NODES = 60;
const FACE_DIAMETER = 50;
const COIN_RADIUS = 22;
const STAR_OUTER_RADIUS = 20;
const STAR_INNER_RADIUS = STAR_OUTER_RADIUS / 2;
const VARIABLE_FONT = new MathSymbolFont(36);
class EERewardNode extends RewardNode {
  constructor() {
    // add nodes that look like smiley faces, stars, and variables
    const nodes = [new FaceNode(FACE_DIAMETER), new StarNode({
      starShapeOptions: {
        outerRadius: STAR_OUTER_RADIUS,
        innerRadius: STAR_INNER_RADIUS
      }
    }), new Text('x', {
      font: VARIABLE_FONT
    }), new Text('y', {
      font: VARIABLE_FONT
    }), new Text('z', {
      font: VARIABLE_FONT
    })];

    // add a node for each coin type
    CoinTermTypeID.VALUES.forEach(coinTermTypeID => {
      if (coinTermTypeID !== CoinTermTypeID.CONSTANT) {
        nodes.push(CoinNodeFactory.createImageNode(coinTermTypeID, COIN_RADIUS, true));
      }
    });
    super({
      nodes: RewardNode.createRandomNodes(nodes, NUMBER_OF_NODES)
    });
  }
}
expressionExchange.register('EERewardNode', EERewardNode);
export default EERewardNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGYWNlTm9kZSIsIk1hdGhTeW1ib2xGb250IiwiU3Rhck5vZGUiLCJUZXh0IiwiUmV3YXJkTm9kZSIsIkNvaW5UZXJtVHlwZUlEIiwiQ29pbk5vZGVGYWN0b3J5IiwiZXhwcmVzc2lvbkV4Y2hhbmdlIiwiTlVNQkVSX09GX05PREVTIiwiRkFDRV9ESUFNRVRFUiIsIkNPSU5fUkFESVVTIiwiU1RBUl9PVVRFUl9SQURJVVMiLCJTVEFSX0lOTkVSX1JBRElVUyIsIlZBUklBQkxFX0ZPTlQiLCJFRVJld2FyZE5vZGUiLCJjb25zdHJ1Y3RvciIsIm5vZGVzIiwic3RhclNoYXBlT3B0aW9ucyIsIm91dGVyUmFkaXVzIiwiaW5uZXJSYWRpdXMiLCJmb250IiwiVkFMVUVTIiwiZm9yRWFjaCIsImNvaW5UZXJtVHlwZUlEIiwiQ09OU1RBTlQiLCJwdXNoIiwiY3JlYXRlSW1hZ2VOb2RlIiwiY3JlYXRlUmFuZG9tTm9kZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVFUmV3YXJkTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgcmV3YXJkIHRoYXQgaXMgZGlzcGxheWVkIHdoZW4gYWxsIGxldmVscyBoYXZlIGJlZW4gY29ycmVjdGx5IGNvbXBsZXRlZC4gIEZvciB0ZXN0aW5nLCB0aGUgc2ltdWxhdGlvbiBjYW4gYmUgcnVuXHJcbiAqIHdpdGggdGhlICdzaG93UmV3YXJkTm9kZUV2ZXJ5TGV2ZWwnIHF1ZXJ5IHBhcmFtZXRlciB0byBzaG93IHRoZSByZXdhcmQgZWFjaCB0aW1lIGEgbGV2ZWwgaXMgc3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBGYWNlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvRmFjZU5vZGUuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xGb250LmpzJztcclxuaW1wb3J0IFN0YXJOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdGFyTm9kZS5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUmV3YXJkTm9kZSBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9SZXdhcmROb2RlLmpzJztcclxuaW1wb3J0IENvaW5UZXJtVHlwZUlEIGZyb20gJy4uLy4uL2NvbW1vbi9lbnVtL0NvaW5UZXJtVHlwZUlELmpzJztcclxuaW1wb3J0IENvaW5Ob2RlRmFjdG9yeSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Db2luTm9kZUZhY3RvcnkuanMnO1xyXG5pbXBvcnQgZXhwcmVzc2lvbkV4Y2hhbmdlIGZyb20gJy4uLy4uL2V4cHJlc3Npb25FeGNoYW5nZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTlVNQkVSX09GX05PREVTID0gNjA7XHJcbmNvbnN0IEZBQ0VfRElBTUVURVIgPSA1MDtcclxuY29uc3QgQ09JTl9SQURJVVMgPSAyMjtcclxuY29uc3QgU1RBUl9PVVRFUl9SQURJVVMgPSAyMDtcclxuY29uc3QgU1RBUl9JTk5FUl9SQURJVVMgPSBTVEFSX09VVEVSX1JBRElVUyAvIDI7XHJcbmNvbnN0IFZBUklBQkxFX0ZPTlQgPSBuZXcgTWF0aFN5bWJvbEZvbnQoIDM2ICk7XHJcblxyXG5jbGFzcyBFRVJld2FyZE5vZGUgZXh0ZW5kcyBSZXdhcmROb2RlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gYWRkIG5vZGVzIHRoYXQgbG9vayBsaWtlIHNtaWxleSBmYWNlcywgc3RhcnMsIGFuZCB2YXJpYWJsZXNcclxuICAgIGNvbnN0IG5vZGVzID0gW1xyXG4gICAgICBuZXcgRmFjZU5vZGUoIEZBQ0VfRElBTUVURVIgKSxcclxuICAgICAgbmV3IFN0YXJOb2RlKCB7IHN0YXJTaGFwZU9wdGlvbnM6IHsgb3V0ZXJSYWRpdXM6IFNUQVJfT1VURVJfUkFESVVTLCBpbm5lclJhZGl1czogU1RBUl9JTk5FUl9SQURJVVMgfSB9ICksXHJcbiAgICAgIG5ldyBUZXh0KCAneCcsIHsgZm9udDogVkFSSUFCTEVfRk9OVCB9ICksXHJcbiAgICAgIG5ldyBUZXh0KCAneScsIHsgZm9udDogVkFSSUFCTEVfRk9OVCB9ICksXHJcbiAgICAgIG5ldyBUZXh0KCAneicsIHsgZm9udDogVkFSSUFCTEVfRk9OVCB9IClcclxuICAgIF07XHJcblxyXG4gICAgLy8gYWRkIGEgbm9kZSBmb3IgZWFjaCBjb2luIHR5cGVcclxuICAgIENvaW5UZXJtVHlwZUlELlZBTFVFUy5mb3JFYWNoKCBjb2luVGVybVR5cGVJRCA9PiB7XHJcbiAgICAgIGlmICggY29pblRlcm1UeXBlSUQgIT09IENvaW5UZXJtVHlwZUlELkNPTlNUQU5UICkge1xyXG4gICAgICAgIG5vZGVzLnB1c2goIENvaW5Ob2RlRmFjdG9yeS5jcmVhdGVJbWFnZU5vZGUoIGNvaW5UZXJtVHlwZUlELCBDT0lOX1JBRElVUywgdHJ1ZSApICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggeyBub2RlczogUmV3YXJkTm9kZS5jcmVhdGVSYW5kb21Ob2Rlcyggbm9kZXMsIE5VTUJFUl9PRl9OT0RFUyApIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cHJlc3Npb25FeGNoYW5nZS5yZWdpc3RlciggJ0VFUmV3YXJkTm9kZScsIEVFUmV3YXJkTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBFRVJld2FyZE5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxjQUFjLE1BQU0sK0NBQStDO0FBQzFFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLGNBQWMsTUFBTSxxQ0FBcUM7QUFDaEUsT0FBT0MsZUFBZSxNQUFNLHNDQUFzQztBQUNsRSxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7O0FBRTVEO0FBQ0EsTUFBTUMsZUFBZSxHQUFHLEVBQUU7QUFDMUIsTUFBTUMsYUFBYSxHQUFHLEVBQUU7QUFDeEIsTUFBTUMsV0FBVyxHQUFHLEVBQUU7QUFDdEIsTUFBTUMsaUJBQWlCLEdBQUcsRUFBRTtBQUM1QixNQUFNQyxpQkFBaUIsR0FBR0QsaUJBQWlCLEdBQUcsQ0FBQztBQUMvQyxNQUFNRSxhQUFhLEdBQUcsSUFBSVosY0FBYyxDQUFFLEVBQUcsQ0FBQztBQUU5QyxNQUFNYSxZQUFZLFNBQVNWLFVBQVUsQ0FBQztFQUVwQ1csV0FBV0EsQ0FBQSxFQUFHO0lBRVo7SUFDQSxNQUFNQyxLQUFLLEdBQUcsQ0FDWixJQUFJaEIsUUFBUSxDQUFFUyxhQUFjLENBQUMsRUFDN0IsSUFBSVAsUUFBUSxDQUFFO01BQUVlLGdCQUFnQixFQUFFO1FBQUVDLFdBQVcsRUFBRVAsaUJBQWlCO1FBQUVRLFdBQVcsRUFBRVA7TUFBa0I7SUFBRSxDQUFFLENBQUMsRUFDeEcsSUFBSVQsSUFBSSxDQUFFLEdBQUcsRUFBRTtNQUFFaUIsSUFBSSxFQUFFUDtJQUFjLENBQUUsQ0FBQyxFQUN4QyxJQUFJVixJQUFJLENBQUUsR0FBRyxFQUFFO01BQUVpQixJQUFJLEVBQUVQO0lBQWMsQ0FBRSxDQUFDLEVBQ3hDLElBQUlWLElBQUksQ0FBRSxHQUFHLEVBQUU7TUFBRWlCLElBQUksRUFBRVA7SUFBYyxDQUFFLENBQUMsQ0FDekM7O0lBRUQ7SUFDQVIsY0FBYyxDQUFDZ0IsTUFBTSxDQUFDQyxPQUFPLENBQUVDLGNBQWMsSUFBSTtNQUMvQyxJQUFLQSxjQUFjLEtBQUtsQixjQUFjLENBQUNtQixRQUFRLEVBQUc7UUFDaERSLEtBQUssQ0FBQ1MsSUFBSSxDQUFFbkIsZUFBZSxDQUFDb0IsZUFBZSxDQUFFSCxjQUFjLEVBQUViLFdBQVcsRUFBRSxJQUFLLENBQUUsQ0FBQztNQUNwRjtJQUNGLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRTtNQUFFTSxLQUFLLEVBQUVaLFVBQVUsQ0FBQ3VCLGlCQUFpQixDQUFFWCxLQUFLLEVBQUVSLGVBQWdCO0lBQUUsQ0FBRSxDQUFDO0VBQzVFO0FBQ0Y7QUFFQUQsa0JBQWtCLENBQUNxQixRQUFRLENBQUUsY0FBYyxFQUFFZCxZQUFhLENBQUM7QUFDM0QsZUFBZUEsWUFBWSJ9