// Copyright 2013-2022, University of Colorado Boulder

/**
 * main view class for the simulation
 *
 * @author Vasily Shakhov (Mlearner)
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import balloonGreen_png from '../../../images/balloonGreen_png.js';
import balloonYellow_png from '../../../images/balloonYellow_png.js';
import carrier002_wav from '../../../sounds/carrier002_wav.js';
import balloonsAndStaticElectricity from '../../balloonsAndStaticElectricity.js';
import BASEA11yStrings from '../BASEA11yStrings.js';
import BASEQueryParameters from '../BASEQueryParameters.js';
import BalloonNode from './BalloonNode.js';
import BalloonRubbingSoundGenerator from './BalloonRubbingSoundGenerator.js';
import BASESummaryNode from './BASESummaryNode.js';
import ChargeDeflectionSoundGenerator from './ChargeDeflectionSoundGenerator.js';
import ControlPanel from './ControlPanel.js';
import PlayAreaGridNode from './PlayAreaGridNode.js';
import SweaterNode from './SweaterNode.js';
import TetherNode from './TetherNode.js';
import WallNode from './WallNode.js';
const greenBalloonLabelString = BASEA11yStrings.greenBalloonLabel.value;
const yellowBalloonLabelString = BASEA11yStrings.yellowBalloonLabel.value;

// constants
const BALLOON_TIE_POINT_HEIGHT = 14; // empirically determined

class BASEView extends ScreenView {
  /**
   * @param {BASEModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      layoutBounds: new Bounds2(0, 0, 768, 504),
      tandem: tandem
    });
    const sweaterNode = new SweaterNode(model, tandem.createTandem('sweaterNode'));

    // @public (for QUnit tests)
    this.wallNode = new WallNode(model, this.layoutBounds.height, tandem.createTandem('wall'));
    this.addChild(sweaterNode);
    this.addChild(this.wallNode);

    // Show black to the right side of the wall so it doesn't look like empty space over there.
    this.addChild(new Rectangle(model.wall.x + this.wallNode.wallNode.width, 0, 1000, 1000, {
      fill: 'black',
      tandem: tandem.createTandem('spaceToRightOfWall')
    }));

    // Add black to the left of the screen to match the black region to the right of the wall
    const maxX = this.layoutBounds.maxX - model.wall.x - this.wallNode.wallNode.width;
    this.addChild(new Rectangle(maxX - 1000, 0, 1000, 1000, {
      fill: 'black',
      tandem: tandem.createTandem('spaceToLeftOfWall')
    }));
    const controlPanel = new ControlPanel(model, this, tandem.createTandem('controlPanel'));

    // @private - sound generator for the deflection of the charges in the wall, never disposed
    this.chargeDeflectionSoundGenerator = new ChargeDeflectionSoundGenerator(model.wall, model.balloons, {
      initialOutputLevel: 0.3,
      enableControlProperties: [new DerivedProperty([model.showChargesProperty], showCharges => showCharges === 'all')]
    });
    soundManager.addSoundGenerator(this.chargeDeflectionSoundGenerator);
    this.yellowBalloonNode = new BalloonNode(model.yellowBalloon, balloonYellow_png, model, yellowBalloonLabelString, greenBalloonLabelString, this.layoutBounds, tandem.createTandem('yellowBalloonNode'), {
      labelContent: yellowBalloonLabelString,
      pointerDrag: () => {
        this.chargeDeflectionSoundGenerator.balloonDraggedByPointer(model.yellowBalloon);
      },
      keyboardDrag: () => {
        this.chargeDeflectionSoundGenerator.balloonDraggedByKeyboard(model.yellowBalloon);
      }
    });
    const tetherAnchorPoint = new Vector2(model.yellowBalloon.positionProperty.get().x + 30,
    // a bit to the side of directly below the starting position
    this.layoutBounds.height);
    this.yellowBalloonTetherNode = new TetherNode(model.yellowBalloon, tetherAnchorPoint, new Vector2(this.yellowBalloonNode.width / 2, this.yellowBalloonNode.height - BALLOON_TIE_POINT_HEIGHT), tandem.createTandem('yellowBalloonTetherNode'));
    this.greenBalloonNode = new BalloonNode(model.greenBalloon, balloonGreen_png, model, greenBalloonLabelString, yellowBalloonLabelString, this.layoutBounds, tandem.createTandem('greenBalloonNode'), {
      labelContent: greenBalloonLabelString,
      balloonVelocitySoundGeneratorOptions: {
        basisSound: carrier002_wav
      },
      balloonRubbingSoundGeneratorOptions: {
        centerFrequency: BalloonRubbingSoundGenerator.DEFAULT_CENTER_FREQUENCY * 1.25
      },
      pointerDrag: () => {
        this.chargeDeflectionSoundGenerator.balloonDraggedByPointer(model.greenBalloon);
      },
      keyboardDrag: () => {
        this.chargeDeflectionSoundGenerator.balloonDraggedByKeyboard(model.greenBalloon);
      }
    });
    this.greenBalloonTetherNode = new TetherNode(model.greenBalloon, tetherAnchorPoint, new Vector2(this.greenBalloonNode.width / 2, this.greenBalloonNode.height - BALLOON_TIE_POINT_HEIGHT), tandem.createTandem('greenBalloonTetherNode'));

    // created after all other view objects so we can access each describer
    const screenSummaryNode = new BASESummaryNode(model, this.yellowBalloonNode, this.greenBalloonNode, this.wallNode, tandem.createTandem('screenSummaryNode'));
    this.setScreenSummaryContent(screenSummaryNode);

    // @private {Node} - layer on which the green balloon resides.
    this.greenBalloonLayerNode = new Node({
      children: [this.greenBalloonTetherNode, this.greenBalloonNode]
    });
    this.addChild(this.greenBalloonLayerNode);

    // @private {Node} - layer on which the yellow balloon resides.
    this.yellowBalloonLayerNode = new Node({
      children: [this.yellowBalloonTetherNode, this.yellowBalloonNode]
    });
    this.addChild(this.yellowBalloonLayerNode);

    // Only show the selected balloon(s)
    model.greenBalloon.isVisibleProperty.link(isVisible => {
      this.greenBalloonNode.visible = isVisible;
      this.greenBalloonTetherNode.visible = isVisible;
    });
    this.addChild(controlPanel);

    // Make sure that we start with the correct z-order for the balloons.
    this.setDefaultBalloonZOrder();

    // When one of the balloons is picked up, move its content and cue nodes to the front.
    Multilink.multilink([model.yellowBalloon.isDraggedProperty, model.greenBalloon.isDraggedProperty], (yellowDragged, greenDragged) => {
      if (yellowDragged) {
        this.yellowBalloonLayerNode.moveToFront();
      } else if (greenDragged) {
        this.greenBalloonLayerNode.moveToFront();
      }
    });

    // pdom - assign components to the appropriate sections and specify order
    this.pdomPlayAreaNode.pdomOrder = [sweaterNode, this.yellowBalloonLayerNode, this.greenBalloonLayerNode, this.wallNode];
    this.pdomControlAreaNode.pdomOrder = [controlPanel];

    //--------------------------------------------------------------------------
    // debugging
    //--------------------------------------------------------------------------

    // visualise regions of the play area
    if (BASEQueryParameters.showGrid) {
      this.addChild(new PlayAreaGridNode(this.layoutBounds, tandem.createTandem('playAreaGridNode')));
    }
  }

  /**
   * Step the view.
   * @param {number} dt
   * @public
   */
  step(dt) {
    this.greenBalloonNode.step(dt);
    this.yellowBalloonNode.step(dt);
  }

  /**
   * Set the default layering of the balloons, generally used to restore initial view state.
   * @public
   */
  setDefaultBalloonZOrder() {
    this.yellowBalloonLayerNode.moveToFront();
  }

  /**
   * Custom layout function for this view. It is most natural for this simulation for the view to
   * be held on the bottom of the navigation bar so that the balloon's tether and wall are always cut
   * off by the navigation bar, see #77.
   *
   * @param {Bounds2} viewBounds
   * @public (joist-internal)
   * @override
   */
  layout(viewBounds) {
    this.resetTransform();
    const scale = this.getLayoutScale(viewBounds);
    const width = viewBounds.width;
    const height = viewBounds.height;
    this.setScaleMagnitude(scale);
    let dx = 0;
    let offsetY = 0;

    // Move to bottom vertically (custom for this sim)
    if (scale === width / this.layoutBounds.width) {
      offsetY = height / scale - this.layoutBounds.height;
    }

    // center horizontally (default behavior for ScreenView)
    else if (scale === height / this.layoutBounds.height) {
      dx = (width - this.layoutBounds.width * scale) / 2 / scale;
    }
    this.translate(dx + viewBounds.left / scale, offsetY);

    // update the visible bounds of the screen view
    this.visibleBoundsProperty.set(new Bounds2(-dx, -offsetY, width / scale - dx, height / scale - offsetY));
  }
}
balloonsAndStaticElectricity.register('BASEView', BASEView);
export default BASEView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJCb3VuZHMyIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJOb2RlIiwiUmVjdGFuZ2xlIiwic291bmRNYW5hZ2VyIiwiYmFsbG9vbkdyZWVuX3BuZyIsImJhbGxvb25ZZWxsb3dfcG5nIiwiY2FycmllcjAwMl93YXYiLCJiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5IiwiQkFTRUExMXlTdHJpbmdzIiwiQkFTRVF1ZXJ5UGFyYW1ldGVycyIsIkJhbGxvb25Ob2RlIiwiQmFsbG9vblJ1YmJpbmdTb3VuZEdlbmVyYXRvciIsIkJBU0VTdW1tYXJ5Tm9kZSIsIkNoYXJnZURlZmxlY3Rpb25Tb3VuZEdlbmVyYXRvciIsIkNvbnRyb2xQYW5lbCIsIlBsYXlBcmVhR3JpZE5vZGUiLCJTd2VhdGVyTm9kZSIsIlRldGhlck5vZGUiLCJXYWxsTm9kZSIsImdyZWVuQmFsbG9vbkxhYmVsU3RyaW5nIiwiZ3JlZW5CYWxsb29uTGFiZWwiLCJ2YWx1ZSIsInllbGxvd0JhbGxvb25MYWJlbFN0cmluZyIsInllbGxvd0JhbGxvb25MYWJlbCIsIkJBTExPT05fVElFX1BPSU5UX0hFSUdIVCIsIkJBU0VWaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImxheW91dEJvdW5kcyIsInN3ZWF0ZXJOb2RlIiwiY3JlYXRlVGFuZGVtIiwid2FsbE5vZGUiLCJoZWlnaHQiLCJhZGRDaGlsZCIsIndhbGwiLCJ4Iiwid2lkdGgiLCJmaWxsIiwibWF4WCIsImNvbnRyb2xQYW5lbCIsImNoYXJnZURlZmxlY3Rpb25Tb3VuZEdlbmVyYXRvciIsImJhbGxvb25zIiwiaW5pdGlhbE91dHB1dExldmVsIiwiZW5hYmxlQ29udHJvbFByb3BlcnRpZXMiLCJzaG93Q2hhcmdlc1Byb3BlcnR5Iiwic2hvd0NoYXJnZXMiLCJhZGRTb3VuZEdlbmVyYXRvciIsInllbGxvd0JhbGxvb25Ob2RlIiwieWVsbG93QmFsbG9vbiIsImxhYmVsQ29udGVudCIsInBvaW50ZXJEcmFnIiwiYmFsbG9vbkRyYWdnZWRCeVBvaW50ZXIiLCJrZXlib2FyZERyYWciLCJiYWxsb29uRHJhZ2dlZEJ5S2V5Ym9hcmQiLCJ0ZXRoZXJBbmNob3JQb2ludCIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJ5ZWxsb3dCYWxsb29uVGV0aGVyTm9kZSIsImdyZWVuQmFsbG9vbk5vZGUiLCJncmVlbkJhbGxvb24iLCJiYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvck9wdGlvbnMiLCJiYXNpc1NvdW5kIiwiYmFsbG9vblJ1YmJpbmdTb3VuZEdlbmVyYXRvck9wdGlvbnMiLCJjZW50ZXJGcmVxdWVuY3kiLCJERUZBVUxUX0NFTlRFUl9GUkVRVUVOQ1kiLCJncmVlbkJhbGxvb25UZXRoZXJOb2RlIiwic2NyZWVuU3VtbWFyeU5vZGUiLCJzZXRTY3JlZW5TdW1tYXJ5Q29udGVudCIsImdyZWVuQmFsbG9vbkxheWVyTm9kZSIsImNoaWxkcmVuIiwieWVsbG93QmFsbG9vbkxheWVyTm9kZSIsImlzVmlzaWJsZVByb3BlcnR5IiwibGluayIsImlzVmlzaWJsZSIsInZpc2libGUiLCJzZXREZWZhdWx0QmFsbG9vblpPcmRlciIsIm11bHRpbGluayIsImlzRHJhZ2dlZFByb3BlcnR5IiwieWVsbG93RHJhZ2dlZCIsImdyZWVuRHJhZ2dlZCIsIm1vdmVUb0Zyb250IiwicGRvbVBsYXlBcmVhTm9kZSIsInBkb21PcmRlciIsInBkb21Db250cm9sQXJlYU5vZGUiLCJzaG93R3JpZCIsInN0ZXAiLCJkdCIsImxheW91dCIsInZpZXdCb3VuZHMiLCJyZXNldFRyYW5zZm9ybSIsInNjYWxlIiwiZ2V0TGF5b3V0U2NhbGUiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImR4Iiwib2Zmc2V0WSIsInRyYW5zbGF0ZSIsImxlZnQiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJBU0VWaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIG1haW4gdmlldyBjbGFzcyBmb3IgdGhlIHNpbXVsYXRpb25cclxuICpcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHNvdW5kTWFuYWdlciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZE1hbmFnZXIuanMnO1xyXG5pbXBvcnQgYmFsbG9vbkdyZWVuX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvYmFsbG9vbkdyZWVuX3BuZy5qcyc7XHJcbmltcG9ydCBiYWxsb29uWWVsbG93X3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvYmFsbG9vblllbGxvd19wbmcuanMnO1xyXG5pbXBvcnQgY2FycmllcjAwMl93YXYgZnJvbSAnLi4vLi4vLi4vc291bmRzL2NhcnJpZXIwMDJfd2F2LmpzJztcclxuaW1wb3J0IGJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkgZnJvbSAnLi4vLi4vYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eS5qcyc7XHJcbmltcG9ydCBCQVNFQTExeVN0cmluZ3MgZnJvbSAnLi4vQkFTRUExMXlTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJBU0VRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vQkFTRVF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBCYWxsb29uTm9kZSBmcm9tICcuL0JhbGxvb25Ob2RlLmpzJztcclxuaW1wb3J0IEJhbGxvb25SdWJiaW5nU291bmRHZW5lcmF0b3IgZnJvbSAnLi9CYWxsb29uUnViYmluZ1NvdW5kR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IEJBU0VTdW1tYXJ5Tm9kZSBmcm9tICcuL0JBU0VTdW1tYXJ5Tm9kZS5qcyc7XHJcbmltcG9ydCBDaGFyZ2VEZWZsZWN0aW9uU291bmRHZW5lcmF0b3IgZnJvbSAnLi9DaGFyZ2VEZWZsZWN0aW9uU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgQ29udHJvbFBhbmVsIGZyb20gJy4vQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IFBsYXlBcmVhR3JpZE5vZGUgZnJvbSAnLi9QbGF5QXJlYUdyaWROb2RlLmpzJztcclxuaW1wb3J0IFN3ZWF0ZXJOb2RlIGZyb20gJy4vU3dlYXRlck5vZGUuanMnO1xyXG5pbXBvcnQgVGV0aGVyTm9kZSBmcm9tICcuL1RldGhlck5vZGUuanMnO1xyXG5pbXBvcnQgV2FsbE5vZGUgZnJvbSAnLi9XYWxsTm9kZS5qcyc7XHJcblxyXG5jb25zdCBncmVlbkJhbGxvb25MYWJlbFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5ncmVlbkJhbGxvb25MYWJlbC52YWx1ZTtcclxuY29uc3QgeWVsbG93QmFsbG9vbkxhYmVsU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnllbGxvd0JhbGxvb25MYWJlbC52YWx1ZTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCQUxMT09OX1RJRV9QT0lOVF9IRUlHSFQgPSAxNDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuY2xhc3MgQkFTRVZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCQVNFTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGxheW91dEJvdW5kczogbmV3IEJvdW5kczIoIDAsIDAsIDc2OCwgNTA0ICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc3dlYXRlck5vZGUgPSBuZXcgU3dlYXRlck5vZGUoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3dlYXRlck5vZGUnICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChmb3IgUVVuaXQgdGVzdHMpXHJcbiAgICB0aGlzLndhbGxOb2RlID0gbmV3IFdhbGxOb2RlKCBtb2RlbCwgdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2FsbCcgKSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHN3ZWF0ZXJOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLndhbGxOb2RlICk7XHJcblxyXG4gICAgLy8gU2hvdyBibGFjayB0byB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgd2FsbCBzbyBpdCBkb2Vzbid0IGxvb2sgbGlrZSBlbXB0eSBzcGFjZSBvdmVyIHRoZXJlLlxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZShcclxuICAgICAgbW9kZWwud2FsbC54ICsgdGhpcy53YWxsTm9kZS53YWxsTm9kZS53aWR0aCxcclxuICAgICAgMCxcclxuICAgICAgMTAwMCxcclxuICAgICAgMTAwMCxcclxuICAgICAgeyBmaWxsOiAnYmxhY2snLCB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGFjZVRvUmlnaHRPZldhbGwnICkgfVxyXG4gICAgKSApO1xyXG5cclxuICAgIC8vIEFkZCBibGFjayB0byB0aGUgbGVmdCBvZiB0aGUgc2NyZWVuIHRvIG1hdGNoIHRoZSBibGFjayByZWdpb24gdG8gdGhlIHJpZ2h0IG9mIHRoZSB3YWxsXHJcbiAgICBjb25zdCBtYXhYID0gdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIG1vZGVsLndhbGwueCAtIHRoaXMud2FsbE5vZGUud2FsbE5vZGUud2lkdGg7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgUmVjdGFuZ2xlKFxyXG4gICAgICBtYXhYIC0gMTAwMCxcclxuICAgICAgMCxcclxuICAgICAgMTAwMCxcclxuICAgICAgMTAwMCxcclxuICAgICAgeyBmaWxsOiAnYmxhY2snLCB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGFjZVRvTGVmdE9mV2FsbCcgKSB9XHJcbiAgICApICk7XHJcblxyXG4gICAgY29uc3QgY29udHJvbFBhbmVsID0gbmV3IENvbnRyb2xQYW5lbCggbW9kZWwsIHRoaXMsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250cm9sUGFuZWwnICkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHNvdW5kIGdlbmVyYXRvciBmb3IgdGhlIGRlZmxlY3Rpb24gb2YgdGhlIGNoYXJnZXMgaW4gdGhlIHdhbGwsIG5ldmVyIGRpc3Bvc2VkXHJcbiAgICB0aGlzLmNoYXJnZURlZmxlY3Rpb25Tb3VuZEdlbmVyYXRvciA9IG5ldyBDaGFyZ2VEZWZsZWN0aW9uU291bmRHZW5lcmF0b3IoXHJcbiAgICAgIG1vZGVsLndhbGwsXHJcbiAgICAgIG1vZGVsLmJhbGxvb25zLFxyXG4gICAgICB7XHJcbiAgICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjMsXHJcblxyXG4gICAgICAgIGVuYWJsZUNvbnRyb2xQcm9wZXJ0aWVzOiBbXHJcbiAgICAgICAgICBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIG1vZGVsLnNob3dDaGFyZ2VzUHJvcGVydHkgXSwgc2hvd0NoYXJnZXMgPT4gc2hvd0NoYXJnZXMgPT09ICdhbGwnIClcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIHRoaXMuY2hhcmdlRGVmbGVjdGlvblNvdW5kR2VuZXJhdG9yICk7XHJcblxyXG4gICAgdGhpcy55ZWxsb3dCYWxsb29uTm9kZSA9IG5ldyBCYWxsb29uTm9kZShcclxuICAgICAgbW9kZWwueWVsbG93QmFsbG9vbixcclxuICAgICAgYmFsbG9vblllbGxvd19wbmcsXHJcbiAgICAgIG1vZGVsLFxyXG4gICAgICB5ZWxsb3dCYWxsb29uTGFiZWxTdHJpbmcsXHJcbiAgICAgIGdyZWVuQmFsbG9vbkxhYmVsU3RyaW5nLFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcyxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3llbGxvd0JhbGxvb25Ob2RlJyApLFxyXG4gICAgICB7XHJcbiAgICAgICAgbGFiZWxDb250ZW50OiB5ZWxsb3dCYWxsb29uTGFiZWxTdHJpbmcsXHJcbiAgICAgICAgcG9pbnRlckRyYWc6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY2hhcmdlRGVmbGVjdGlvblNvdW5kR2VuZXJhdG9yLmJhbGxvb25EcmFnZ2VkQnlQb2ludGVyKCBtb2RlbC55ZWxsb3dCYWxsb29uICk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZXlib2FyZERyYWc6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY2hhcmdlRGVmbGVjdGlvblNvdW5kR2VuZXJhdG9yLmJhbGxvb25EcmFnZ2VkQnlLZXlib2FyZCggbW9kZWwueWVsbG93QmFsbG9vbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIGNvbnN0IHRldGhlckFuY2hvclBvaW50ID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgIG1vZGVsLnllbGxvd0JhbGxvb24ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICsgMzAsIC8vIGEgYml0IHRvIHRoZSBzaWRlIG9mIGRpcmVjdGx5IGJlbG93IHRoZSBzdGFydGluZyBwb3NpdGlvblxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHRcclxuICAgICk7XHJcbiAgICB0aGlzLnllbGxvd0JhbGxvb25UZXRoZXJOb2RlID0gbmV3IFRldGhlck5vZGUoXHJcbiAgICAgIG1vZGVsLnllbGxvd0JhbGxvb24sXHJcbiAgICAgIHRldGhlckFuY2hvclBvaW50LFxyXG4gICAgICBuZXcgVmVjdG9yMiggdGhpcy55ZWxsb3dCYWxsb29uTm9kZS53aWR0aCAvIDIsIHRoaXMueWVsbG93QmFsbG9vbk5vZGUuaGVpZ2h0IC0gQkFMTE9PTl9USUVfUE9JTlRfSEVJR0hUICksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd5ZWxsb3dCYWxsb29uVGV0aGVyTm9kZScgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZ3JlZW5CYWxsb29uTm9kZSA9IG5ldyBCYWxsb29uTm9kZShcclxuICAgICAgbW9kZWwuZ3JlZW5CYWxsb29uLFxyXG4gICAgICBiYWxsb29uR3JlZW5fcG5nLFxyXG4gICAgICBtb2RlbCxcclxuICAgICAgZ3JlZW5CYWxsb29uTGFiZWxTdHJpbmcsXHJcbiAgICAgIHllbGxvd0JhbGxvb25MYWJlbFN0cmluZyxcclxuICAgICAgdGhpcy5sYXlvdXRCb3VuZHMsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmVlbkJhbGxvb25Ob2RlJyApLFxyXG4gICAgICB7XHJcbiAgICAgICAgbGFiZWxDb250ZW50OiBncmVlbkJhbGxvb25MYWJlbFN0cmluZyxcclxuICAgICAgICBiYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvck9wdGlvbnM6IHsgYmFzaXNTb3VuZDogY2FycmllcjAwMl93YXYgfSxcclxuICAgICAgICBiYWxsb29uUnViYmluZ1NvdW5kR2VuZXJhdG9yT3B0aW9uczoge1xyXG4gICAgICAgICAgY2VudGVyRnJlcXVlbmN5OiBCYWxsb29uUnViYmluZ1NvdW5kR2VuZXJhdG9yLkRFRkFVTFRfQ0VOVEVSX0ZSRVFVRU5DWSAqIDEuMjVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBvaW50ZXJEcmFnOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNoYXJnZURlZmxlY3Rpb25Tb3VuZEdlbmVyYXRvci5iYWxsb29uRHJhZ2dlZEJ5UG9pbnRlciggbW9kZWwuZ3JlZW5CYWxsb29uICk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZXlib2FyZERyYWc6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY2hhcmdlRGVmbGVjdGlvblNvdW5kR2VuZXJhdG9yLmJhbGxvb25EcmFnZ2VkQnlLZXlib2FyZCggbW9kZWwuZ3JlZW5CYWxsb29uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgdGhpcy5ncmVlbkJhbGxvb25UZXRoZXJOb2RlID0gbmV3IFRldGhlck5vZGUoXHJcbiAgICAgIG1vZGVsLmdyZWVuQmFsbG9vbixcclxuICAgICAgdGV0aGVyQW5jaG9yUG9pbnQsXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB0aGlzLmdyZWVuQmFsbG9vbk5vZGUud2lkdGggLyAyLCB0aGlzLmdyZWVuQmFsbG9vbk5vZGUuaGVpZ2h0IC0gQkFMTE9PTl9USUVfUE9JTlRfSEVJR0hUICksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmVlbkJhbGxvb25UZXRoZXJOb2RlJyApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZWQgYWZ0ZXIgYWxsIG90aGVyIHZpZXcgb2JqZWN0cyBzbyB3ZSBjYW4gYWNjZXNzIGVhY2ggZGVzY3JpYmVyXHJcbiAgICBjb25zdCBzY3JlZW5TdW1tYXJ5Tm9kZSA9IG5ldyBCQVNFU3VtbWFyeU5vZGUoIG1vZGVsLCB0aGlzLnllbGxvd0JhbGxvb25Ob2RlLCB0aGlzLmdyZWVuQmFsbG9vbk5vZGUsIHRoaXMud2FsbE5vZGUsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzY3JlZW5TdW1tYXJ5Tm9kZScgKSApO1xyXG4gICAgdGhpcy5zZXRTY3JlZW5TdW1tYXJ5Q29udGVudCggc2NyZWVuU3VtbWFyeU5vZGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX0gLSBsYXllciBvbiB3aGljaCB0aGUgZ3JlZW4gYmFsbG9vbiByZXNpZGVzLlxyXG4gICAgdGhpcy5ncmVlbkJhbGxvb25MYXllck5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyB0aGlzLmdyZWVuQmFsbG9vblRldGhlck5vZGUsIHRoaXMuZ3JlZW5CYWxsb29uTm9kZSBdIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZ3JlZW5CYWxsb29uTGF5ZXJOb2RlICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9IC0gbGF5ZXIgb24gd2hpY2ggdGhlIHllbGxvdyBiYWxsb29uIHJlc2lkZXMuXHJcbiAgICB0aGlzLnllbGxvd0JhbGxvb25MYXllck5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyB0aGlzLnllbGxvd0JhbGxvb25UZXRoZXJOb2RlLCB0aGlzLnllbGxvd0JhbGxvb25Ob2RlIF0gfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy55ZWxsb3dCYWxsb29uTGF5ZXJOb2RlICk7XHJcblxyXG4gICAgLy8gT25seSBzaG93IHRoZSBzZWxlY3RlZCBiYWxsb29uKHMpXHJcbiAgICBtb2RlbC5ncmVlbkJhbGxvb24uaXNWaXNpYmxlUHJvcGVydHkubGluayggaXNWaXNpYmxlID0+IHtcclxuICAgICAgdGhpcy5ncmVlbkJhbGxvb25Ob2RlLnZpc2libGUgPSBpc1Zpc2libGU7XHJcbiAgICAgIHRoaXMuZ3JlZW5CYWxsb29uVGV0aGVyTm9kZS52aXNpYmxlID0gaXNWaXNpYmxlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvbnRyb2xQYW5lbCApO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHdlIHN0YXJ0IHdpdGggdGhlIGNvcnJlY3Qgei1vcmRlciBmb3IgdGhlIGJhbGxvb25zLlxyXG4gICAgdGhpcy5zZXREZWZhdWx0QmFsbG9vblpPcmRlcigpO1xyXG5cclxuICAgIC8vIFdoZW4gb25lIG9mIHRoZSBiYWxsb29ucyBpcyBwaWNrZWQgdXAsIG1vdmUgaXRzIGNvbnRlbnQgYW5kIGN1ZSBub2RlcyB0byB0aGUgZnJvbnQuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIG1vZGVsLnllbGxvd0JhbGxvb24uaXNEcmFnZ2VkUHJvcGVydHksIG1vZGVsLmdyZWVuQmFsbG9vbi5pc0RyYWdnZWRQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHllbGxvd0RyYWdnZWQsIGdyZWVuRHJhZ2dlZCApID0+IHtcclxuICAgICAgICBpZiAoIHllbGxvd0RyYWdnZWQgKSB7XHJcbiAgICAgICAgICB0aGlzLnllbGxvd0JhbGxvb25MYXllck5vZGUubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGdyZWVuRHJhZ2dlZCApIHtcclxuICAgICAgICAgIHRoaXMuZ3JlZW5CYWxsb29uTGF5ZXJOb2RlLm1vdmVUb0Zyb250KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIHBkb20gLSBhc3NpZ24gY29tcG9uZW50cyB0byB0aGUgYXBwcm9wcmlhdGUgc2VjdGlvbnMgYW5kIHNwZWNpZnkgb3JkZXJcclxuICAgIHRoaXMucGRvbVBsYXlBcmVhTm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIHN3ZWF0ZXJOb2RlLFxyXG4gICAgICB0aGlzLnllbGxvd0JhbGxvb25MYXllck5vZGUsXHJcbiAgICAgIHRoaXMuZ3JlZW5CYWxsb29uTGF5ZXJOb2RlLFxyXG4gICAgICB0aGlzLndhbGxOb2RlXHJcbiAgICBdO1xyXG4gICAgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlLnBkb21PcmRlciA9IFsgY29udHJvbFBhbmVsIF07XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gZGVidWdnaW5nXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gdmlzdWFsaXNlIHJlZ2lvbnMgb2YgdGhlIHBsYXkgYXJlYVxyXG4gICAgaWYgKCBCQVNFUXVlcnlQYXJhbWV0ZXJzLnNob3dHcmlkICkge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgUGxheUFyZWFHcmlkTm9kZSggdGhpcy5sYXlvdXRCb3VuZHMsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbGF5QXJlYUdyaWROb2RlJyApICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXAgdGhlIHZpZXcuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5ncmVlbkJhbGxvb25Ob2RlLnN0ZXAoIGR0ICk7XHJcbiAgICB0aGlzLnllbGxvd0JhbGxvb25Ob2RlLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGRlZmF1bHQgbGF5ZXJpbmcgb2YgdGhlIGJhbGxvb25zLCBnZW5lcmFsbHkgdXNlZCB0byByZXN0b3JlIGluaXRpYWwgdmlldyBzdGF0ZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0RGVmYXVsdEJhbGxvb25aT3JkZXIoKSB7XHJcbiAgICB0aGlzLnllbGxvd0JhbGxvb25MYXllck5vZGUubW92ZVRvRnJvbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEN1c3RvbSBsYXlvdXQgZnVuY3Rpb24gZm9yIHRoaXMgdmlldy4gSXQgaXMgbW9zdCBuYXR1cmFsIGZvciB0aGlzIHNpbXVsYXRpb24gZm9yIHRoZSB2aWV3IHRvXHJcbiAgICogYmUgaGVsZCBvbiB0aGUgYm90dG9tIG9mIHRoZSBuYXZpZ2F0aW9uIGJhciBzbyB0aGF0IHRoZSBiYWxsb29uJ3MgdGV0aGVyIGFuZCB3YWxsIGFyZSBhbHdheXMgY3V0XHJcbiAgICogb2ZmIGJ5IHRoZSBuYXZpZ2F0aW9uIGJhciwgc2VlICM3Ny5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gdmlld0JvdW5kc1xyXG4gICAqIEBwdWJsaWMgKGpvaXN0LWludGVybmFsKVxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGxheW91dCggdmlld0JvdW5kcyApIHtcclxuICAgIHRoaXMucmVzZXRUcmFuc2Zvcm0oKTtcclxuXHJcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuZ2V0TGF5b3V0U2NhbGUoIHZpZXdCb3VuZHMgKTtcclxuICAgIGNvbnN0IHdpZHRoID0gdmlld0JvdW5kcy53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHZpZXdCb3VuZHMuaGVpZ2h0O1xyXG4gICAgdGhpcy5zZXRTY2FsZU1hZ25pdHVkZSggc2NhbGUgKTtcclxuXHJcbiAgICBsZXQgZHggPSAwO1xyXG4gICAgbGV0IG9mZnNldFkgPSAwO1xyXG5cclxuICAgIC8vIE1vdmUgdG8gYm90dG9tIHZlcnRpY2FsbHkgKGN1c3RvbSBmb3IgdGhpcyBzaW0pXHJcbiAgICBpZiAoIHNjYWxlID09PSB3aWR0aCAvIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICkge1xyXG4gICAgICBvZmZzZXRZID0gKCBoZWlnaHQgLyBzY2FsZSAtIHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNlbnRlciBob3Jpem9udGFsbHkgKGRlZmF1bHQgYmVoYXZpb3IgZm9yIFNjcmVlblZpZXcpXHJcbiAgICBlbHNlIGlmICggc2NhbGUgPT09IGhlaWdodCAvIHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodCApIHtcclxuICAgICAgZHggPSAoIHdpZHRoIC0gdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggKiBzY2FsZSApIC8gMiAvIHNjYWxlO1xyXG4gICAgfVxyXG4gICAgdGhpcy50cmFuc2xhdGUoIGR4ICsgdmlld0JvdW5kcy5sZWZ0IC8gc2NhbGUsIG9mZnNldFkgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHZpc2libGUgYm91bmRzIG9mIHRoZSBzY3JlZW4gdmlld1xyXG4gICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkuc2V0KCBuZXcgQm91bmRzMiggLWR4LCAtb2Zmc2V0WSwgd2lkdGggLyBzY2FsZSAtIGR4LCBoZWlnaHQgLyBzY2FsZSAtIG9mZnNldFkgKSApO1xyXG4gIH1cclxufVxyXG5cclxuYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eS5yZWdpc3RlciggJ0JBU0VWaWV3JywgQkFTRVZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgQkFTRVZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELFNBQVNDLElBQUksRUFBRUMsU0FBUyxRQUFRLG1DQUFtQztBQUNuRSxPQUFPQyxZQUFZLE1BQU0sc0NBQXNDO0FBQy9ELE9BQU9DLGdCQUFnQixNQUFNLHFDQUFxQztBQUNsRSxPQUFPQyxpQkFBaUIsTUFBTSxzQ0FBc0M7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLG1DQUFtQztBQUM5RCxPQUFPQyw0QkFBNEIsTUFBTSx1Q0FBdUM7QUFDaEYsT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUNuRCxPQUFPQyxtQkFBbUIsTUFBTSwyQkFBMkI7QUFDM0QsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFP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