// Copyright 2020-2023, University of Colorado Boulder

/**
 * 3D Molecule display that takes up the entire screen
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../../axon/js/EnumerationDeprecatedProperty.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import Property from '../../../../../axon/js/Property.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import ThreeNode from '../../../../../mobius/js/ThreeNode.js';
import EnumerationDeprecated from '../../../../../phet-core/js/EnumerationDeprecated.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import PlayPauseButton from '../../../../../scenery-phet/js/buttons/PlayPauseButton.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Color, PressListener, Rectangle, RichText, Text, VBox } from '../../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Dialog from '../../../../../sun/js/Dialog.js';
import nullSoundPlayer from '../../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import buildAMolecule from '../../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../../BuildAMoleculeStrings.js';
import BAMConstants from '../../BAMConstants.js';
import MoleculeList from '../../model/MoleculeList.js';

// constants
const ViewStyle = EnumerationDeprecated.byKeys(['SPACE_FILL', 'BALL_AND_STICK']);
class Molecule3DDialog extends Dialog {
  /**
   * @param {Property.<CompleteMolecule|null>} completeMoleculeProperty
   */
  constructor(completeMoleculeProperty) {
    // Holds all of the content within the dialog. Dialog needs to be sized to content before content is added.
    const contentWrapper = new Rectangle(0, 0, 300, 340);
    const contentVBox = new VBox({
      children: [contentWrapper],
      spacing: 13
    });
    const title = new Text('', {
      font: new PhetFont(28),
      maxWidth: contentWrapper.width - 20,
      fill: 'white'
    });
    super(contentVBox, {
      fill: 'black',
      xAlign: 'center',
      title: title,
      resize: false,
      closeButtonColor: 'white'
    });

    // @public {Property.<CompleteMolecule|null>}
    this.completeMoleculeProperty = completeMoleculeProperty;

    // @public {BooleanProperty} Property used for playing/pausing a rotating molecule
    this.isPlayingProperty = new BooleanProperty(true);

    // @public {BooleanProperty}
    this.userControlledProperty = new BooleanProperty(false);

    // @public {EnumerationDeprecatedProperty} View styles for space filled and ball and stick views.
    this.viewStyleProperty = new EnumerationDeprecatedProperty(ViewStyle, ViewStyle.SPACE_FILL);
    const playPauseButton = new PlayPauseButton(this.isPlayingProperty, {
      radius: 15,
      valueOffSoundPlayer: nullSoundPlayer,
      valueOnSoundPlayer: nullSoundPlayer,
      baseColor: Color.ORANGE
    });

    // Reads out general formula for displayed molecule.
    const formulaText = new RichText('', {
      font: new PhetFont(18),
      fill: 'rgb(187, 187, 187)'
    });

    // Update formula text for displayed molecule.
    completeMoleculeProperty.link(completeMolecule => {
      if (completeMolecule) {
        title.setString(StringUtils.fillIn(BuildAMoleculeStrings.moleculeNamePattern, {
          display: completeMolecule.getDisplayName()
        }));
        formulaText.setString(completeMolecule.getGeneralFormulaFragment());
      }
    });

    /**
     * Build and add atom mesh to container.
     * @param {CompleteMolecule} completeMolecule
     * @param {Object3D} container
     * @param {boolean} requiresAtomOffset
     * @param {boolean} scaledRadius
     * @param {Array.<Color>} [colorSet]
     *
     * @private
     */
    const buildAtomMesh = (completeMolecule, container, requiresAtomOffset, scaledRadius, colorSet) => {
      for (let i = 0; i < completeMolecule.atoms.length; i++) {
        const atom = completeMolecule.atoms[i];

        // Handle parameters for icon vs non-icon build
        const radius = scaledRadius ? 0.35 : atom.covalentRadius / 80;
        const offset = requiresAtomOffset ? -0.5 + i : 0;
        const color = colorSet ? Color.toColor(colorSet[i]).toNumber() : Color.toColor(atom.element.color).toNumber();
        const iconMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 30, 24), new THREE.MeshLambertMaterial({
          color: color
        }));
        container.add(iconMesh);
        iconMesh.position.set(atom.x3d + offset, atom.y3d, atom.z3d);
      }
    };

    /**
     * Build and add atom mesh to container.
     * @param {CompleteMolecule} completeMolecule
     * @param {Object3D} container
     * @param {boolean} requiresBondOffset
     * @param {boolean} meshThickness
     *
     * @private
     */
    const buildBondMesh = (completeMolecule, container, requiresBondOffset, meshThickness) => {
      completeMolecule.bonds.forEach(bond => {
        let originOffset = -0.25;
        let displacement = 0;

        // If a bond has a high order we need to adjust the bond mesh in the y-axis
        for (let i = 0; i < bond.order; i++) {
          // Offset for single bond
          if (bond.order === 1) {
            originOffset = 0;
            displacement = 0;
          }
          // Offset for double bond
          else if (bond.order === 2) {
            originOffset = -0.25;
            displacement = 0.5;
          }
          // Offset for triple bond
          else if (bond.order === 3) {
            originOffset = -0.25;
            displacement = 0.25;
          }
          // Handle building bonds for ball and stick icon (O2)
          if (requiresBondOffset) {
            originOffset = -0.5;
            displacement = 1;
          }

          // Establish parameters for bond mesh
          const bondAPosition = new Vector3(bond.a.x3d, bond.a.y3d, bond.a.z3d);
          const bondBPosition = new Vector3(bond.b.x3d, bond.b.y3d, bond.b.z3d);
          const distance = bondAPosition.distance(bondBPosition);
          const bondMesh = new THREE.Mesh(new THREE.CylinderGeometry(meshThickness, meshThickness, distance, 32, false), new THREE.MeshLambertMaterial({
            color: Color.gray
          }));

          // Vector3
          const cylinderDefaultOrientation = Vector3.Y_UNIT;
          const neededOrientation = bondAPosition.minus(bondBPosition).normalized();

          // Matrix3
          const matrix = Matrix3.rotateAToB(cylinderDefaultOrientation, neededOrientation);

          // Vector3
          const midpointBetweenAtoms = bondAPosition.average(bondBPosition);
          container.add(bondMesh);

          // Enforce a manual update to the bondMesh matrix.
          bondMesh.matrixAutoUpdate = false;
          bondMesh.matrix.set(matrix.m00(), matrix.m01(), matrix.m02(), midpointBetweenAtoms.x, matrix.m10(), matrix.m11(), matrix.m12(), midpointBetweenAtoms.y + originOffset + i * displacement, matrix.m20(), matrix.m21(), matrix.m22(), midpointBetweenAtoms.z, 0, 0, 0, 1);
        }
      });
    };

    // Construct icons from MoleculeList.O2, see https://github.com/phetsims/build-a-molecule/issues/139.
    // Options for ThreeNode icons.
    const iconOptions = {
      cursor: 'pointer',
      cameraPosition: new Vector3(0, 0, 5)
    };
    const colorSet = [new Color(159, 102, 218), new Color(255, 255, 255)];

    // Create a Space Filled icon and representation
    const spaceFilledIcon = new ThreeNode(50, 50, iconOptions);
    const spaceFilledScene = spaceFilledIcon.stage.threeScene;
    const spaceFilledContainer = new THREE.Object3D();
    spaceFilledScene.add(spaceFilledContainer);
    buildAtomMesh(MoleculeList.O2, spaceFilledContainer, false, false, colorSet);

    // Listener to change the view style to the space filled representation
    spaceFilledIcon.addInputListener(new PressListener({
      press: () => {
        this.viewStyleProperty.value = ViewStyle.SPACE_FILL;
      }
    }));

    // Create a Ball and Stick icon and representation
    const ballAndStickIcon = new ThreeNode(50, 50, {
      cursor: 'pointer',
      cameraPosition: new Vector3(0, 0, 7)
    });
    const ballAndStickScene = ballAndStickIcon.stage.threeScene;
    const ballAndStickContainer = new THREE.Object3D();
    ballAndStickScene.add(ballAndStickContainer);
    buildAtomMesh(MoleculeList.O2, ballAndStickContainer, true, false, colorSet);
    buildBondMesh(MoleculeList.O2, ballAndStickContainer, true, 0.2);

    // Updates the view style to the ball and stick representation
    ballAndStickIcon.addInputListener(new PressListener({
      press: () => {
        this.viewStyleProperty.value = ViewStyle.BALL_AND_STICK;
      }
    }));

    // Construct 3D view of moleculeNode
    const moleculeNode = new ThreeNode(300, 200, {
      cameraPosition: new Vector3(0, 0, 7)
    });
    const moleculeContainer = new THREE.Object3D();
    const moleculeScene = moleculeNode.stage.threeScene;
    moleculeScene.add(moleculeContainer);

    // Handle the each 3D representation based on the current view style
    Multilink.multilink([this.viewStyleProperty, completeMoleculeProperty], (viewStyle, completeMolecule) => {
      if (completeMolecule) {
        // Remove all previous mesh elements if they exists from a previous build
        while (moleculeContainer.children.length > 0) {
          moleculeContainer.remove(moleculeContainer.children[0]);
        }

        // Handle building mesh for space fill representation
        if (viewStyle === ViewStyle.SPACE_FILL && completeMolecule) {
          buildAtomMesh(completeMolecule, moleculeContainer, false, false);
        }

        // Handle building mesh for ball and stick representation
        else {
          buildAtomMesh(completeMolecule, moleculeContainer, false, true);
          buildBondMesh(completeMolecule, moleculeContainer, false, 0.1);
        }
      }
    });

    // Create toggle buttons for scene selection
    const toggleButtonsContent = [{
      value: ViewStyle.SPACE_FILL,
      createNode: () => spaceFilledIcon
    }, {
      value: ViewStyle.BALL_AND_STICK,
      createNode: () => ballAndStickIcon
    }];

    // Create the icons for scene selection
    const sceneRadioButtonGroup = new RectangularRadioButtonGroup(this.viewStyleProperty, toggleButtonsContent, {
      orientation: 'horizontal',
      spacing: 30,
      radioButtonOptions: {
        xMargin: 5,
        baseColor: 'black',
        cornerRadius: BAMConstants.CORNER_RADIUS,
        buttonAppearanceStrategyOptions: {
          selectedStroke: 'yellow',
          deselectedStroke: 'white',
          selectedLineWidth: 1,
          deselectedLineWidth: 0.5,
          deselectedButtonOpacity: 0.25
        }
      }
    });

    // Create and add lights to each scene for main molecule node and icons. Lights taken from MoleculeShapesScreenView.js
    const ambientLight = new THREE.AmbientLight(0x191919); // closest to 0.1 like the original shader
    moleculeScene.add(ambientLight);
    spaceFilledScene.add(ambientLight.clone());
    ballAndStickScene.add(ambientLight.clone());
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8 * 0.9);
    sunLight.position.set(-1.0, 0.5, 2.0);
    moleculeScene.add(sunLight);
    spaceFilledScene.add(sunLight.clone());
    ballAndStickScene.add(sunLight.clone());
    const moonLight = new THREE.DirectionalLight(0xffffff, 0.6 * 0.9);
    moonLight.position.set(2.0, -1.0, 1.0);
    moleculeScene.add(moonLight);
    spaceFilledScene.add(moonLight.clone());
    ballAndStickScene.add(moonLight.clone());

    // Correct the ordering of the dialogs children
    this.isShowingProperty.link(isShowing => {
      // Set the order of children for the VBox
      if (isShowing) {
        contentVBox.removeAllChildren();
        contentVBox.children = [formulaText, moleculeNode, sceneRadioButtonGroup, playPauseButton];
      } else {
        contentVBox.removeAllChildren();
      }
    });

    // @private {Property.<THREE.Quaternion>} Update matrix of the 3D representation
    this.quaternionProperty = new Property(new THREE.Quaternion());
    this.quaternionProperty.link(quaternion => {
      // Copy the new value into the Three object's quaternion and update the matrices.
      moleculeContainer.quaternion.copy(quaternion);
      moleculeContainer.updateMatrix();
      moleculeContainer.updateMatrixWorld();
    });

    // @private {ThreeNode}
    this.moleculeNode = moleculeNode;

    // @private {ThreeNode}
    this.spaceFilledIcon = spaceFilledIcon;

    // @private {ThreeNode}
    this.ballAndStickIcon = ballAndStickIcon;
    let lastGlobalPoint = null;

    // Handles user input to rotate molecule
    const pressListener = new PressListener({
      press: event => {
        this.userControlledProperty.value = true;
        lastGlobalPoint = event.pointer.point.copy();

        // mark the Intent of this pointer listener to indicate that we want to drag and therefore NOT
        // pan while zoomed in
        event.pointer.reserveForDrag();
      },
      drag: event => {
        const delta = event.pointer.point.minus(lastGlobalPoint);
        lastGlobalPoint = event.pointer.point.copy();

        // Compensate for the size of the sim screen by scaling the amount we rotate in THREE.Euler
        const scale = 1 / (100 * window.phet.joist.sim.scaleProperty.value);
        const newQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(delta.y * scale, delta.x * scale, 0));
        newQuaternion.multiply(this.quaternionProperty.value);
        this.quaternionProperty.value = newQuaternion;
      },
      release: () => {
        this.userControlledProperty.value = false;
      }
    });
    moleculeNode.addInputListener(pressListener);
  }

  /**
   * @param {number} dt
   * @public
   */
  step(dt) {
    if (this.isPlayingProperty.value && !this.userControlledProperty.value) {
      // Define a quaternion that is offset by a rotation determined by theta.
      // Multiply the rotated quaternion by the previous quaternion of the THREE object and render it with its new
      // quaternion
      const theta = Math.PI / 6 * dt;
      const newQuaternion = new THREE.Quaternion();
      newQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), theta);
      newQuaternion.multiply(this.quaternionProperty.value);
      this.quaternionProperty.value = newQuaternion;
    }
    this.render();
  }

  /**
   * Render each ThreeNode scene
   *
   * @private
   */
  render() {
    // Main molecule
    this.moleculeNode.layout();
    this.moleculeNode.render(undefined);

    // Space filled icon
    this.spaceFilledIcon.layout();
    this.spaceFilledIcon.render(undefined);

    // Ball and stick icon
    this.ballAndStickIcon.layout();
    this.ballAndStickIcon.render(undefined);
  }
}
buildAMolecule.register('Molecule3DDialog', Molecule3DDialog);
export default Molecule3DDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIlByb3BlcnR5IiwiTWF0cml4MyIsIlZlY3RvcjMiLCJUaHJlZU5vZGUiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJTdHJpbmdVdGlscyIsIlBsYXlQYXVzZUJ1dHRvbiIsIlBoZXRGb250IiwiQ29sb3IiLCJQcmVzc0xpc3RlbmVyIiwiUmVjdGFuZ2xlIiwiUmljaFRleHQiLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsIkRpYWxvZyIsIm51bGxTb3VuZFBsYXllciIsImJ1aWxkQU1vbGVjdWxlIiwiQnVpbGRBTW9sZWN1bGVTdHJpbmdzIiwiQkFNQ29uc3RhbnRzIiwiTW9sZWN1bGVMaXN0IiwiVmlld1N0eWxlIiwiYnlLZXlzIiwiTW9sZWN1bGUzRERpYWxvZyIsImNvbnN0cnVjdG9yIiwiY29tcGxldGVNb2xlY3VsZVByb3BlcnR5IiwiY29udGVudFdyYXBwZXIiLCJjb250ZW50VkJveCIsImNoaWxkcmVuIiwic3BhY2luZyIsInRpdGxlIiwiZm9udCIsIm1heFdpZHRoIiwid2lkdGgiLCJmaWxsIiwieEFsaWduIiwicmVzaXplIiwiY2xvc2VCdXR0b25Db2xvciIsImlzUGxheWluZ1Byb3BlcnR5IiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInZpZXdTdHlsZVByb3BlcnR5IiwiU1BBQ0VfRklMTCIsInBsYXlQYXVzZUJ1dHRvbiIsInJhZGl1cyIsInZhbHVlT2ZmU291bmRQbGF5ZXIiLCJ2YWx1ZU9uU291bmRQbGF5ZXIiLCJiYXNlQ29sb3IiLCJPUkFOR0UiLCJmb3JtdWxhVGV4dCIsImxpbmsiLCJjb21wbGV0ZU1vbGVjdWxlIiwic2V0U3RyaW5nIiwiZmlsbEluIiwibW9sZWN1bGVOYW1lUGF0dGVybiIsImRpc3BsYXkiLCJnZXREaXNwbGF5TmFtZSIsImdldEdlbmVyYWxGb3JtdWxhRnJhZ21lbnQiLCJidWlsZEF0b21NZXNoIiwiY29udGFpbmVyIiwicmVxdWlyZXNBdG9tT2Zmc2V0Iiwic2NhbGVkUmFkaXVzIiwiY29sb3JTZXQiLCJpIiwiYXRvbXMiLCJsZW5ndGgiLCJhdG9tIiwiY292YWxlbnRSYWRpdXMiLCJvZmZzZXQiLCJjb2xvciIsInRvQ29sb3IiLCJ0b051bWJlciIsImVsZW1lbnQiLCJpY29uTWVzaCIsIlRIUkVFIiwiTWVzaCIsIlNwaGVyZUdlb21ldHJ5IiwiTWVzaExhbWJlcnRNYXRlcmlhbCIsImFkZCIsInBvc2l0aW9uIiwic2V0IiwieDNkIiwieTNkIiwiejNkIiwiYnVpbGRCb25kTWVzaCIsInJlcXVpcmVzQm9uZE9mZnNldCIsIm1lc2hUaGlja25lc3MiLCJib25kcyIsImZvckVhY2giLCJib25kIiwib3JpZ2luT2Zmc2V0IiwiZGlzcGxhY2VtZW50Iiwib3JkZXIiLCJib25kQVBvc2l0aW9uIiwiYSIsImJvbmRCUG9zaXRpb24iLCJiIiwiZGlzdGFuY2UiLCJib25kTWVzaCIsIkN5bGluZGVyR2VvbWV0cnkiLCJncmF5IiwiY3lsaW5kZXJEZWZhdWx0T3JpZW50YXRpb24iLCJZX1VOSVQiLCJuZWVkZWRPcmllbnRhdGlvbiIsIm1pbnVzIiwibm9ybWFsaXplZCIsIm1hdHJpeCIsInJvdGF0ZUFUb0IiLCJtaWRwb2ludEJldHdlZW5BdG9tcyIsImF2ZXJhZ2UiLCJtYXRyaXhBdXRvVXBkYXRlIiwibTAwIiwibTAxIiwibTAyIiwieCIsIm0xMCIsIm0xMSIsIm0xMiIsInkiLCJtMjAiLCJtMjEiLCJtMjIiLCJ6IiwiaWNvbk9wdGlvbnMiLCJjdXJzb3IiLCJjYW1lcmFQb3NpdGlvbiIsInNwYWNlRmlsbGVkSWNvbiIsInNwYWNlRmlsbGVkU2NlbmUiLCJzdGFnZSIsInRocmVlU2NlbmUiLCJzcGFjZUZpbGxlZENvbnRhaW5lciIsIk9iamVjdDNEIiwiTzIiLCJhZGRJbnB1dExpc3RlbmVyIiwicHJlc3MiLCJ2YWx1ZSIsImJhbGxBbmRTdGlja0ljb24iLCJiYWxsQW5kU3RpY2tTY2VuZSIsImJhbGxBbmRTdGlja0NvbnRhaW5lciIsIkJBTExfQU5EX1NUSUNLIiwibW9sZWN1bGVOb2RlIiwibW9sZWN1bGVDb250YWluZXIiLCJtb2xlY3VsZVNjZW5lIiwibXVsdGlsaW5rIiwidmlld1N0eWxlIiwicmVtb3ZlIiwidG9nZ2xlQnV0dG9uc0NvbnRlbnQiLCJjcmVhdGVOb2RlIiwic2NlbmVSYWRpb0J1dHRvbkdyb3VwIiwib3JpZW50YXRpb24iLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJ4TWFyZ2luIiwiY29ybmVyUmFkaXVzIiwiQ09STkVSX1JBRElVUyIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMiLCJzZWxlY3RlZFN0cm9rZSIsImRlc2VsZWN0ZWRTdHJva2UiLCJzZWxlY3RlZExpbmVXaWR0aCIsImRlc2VsZWN0ZWRMaW5lV2lkdGgiLCJkZXNlbGVjdGVkQnV0dG9uT3BhY2l0eSIsImFtYmllbnRMaWdodCIsIkFtYmllbnRMaWdodCIsImNsb25lIiwic3VuTGlnaHQiLCJEaXJlY3Rpb25hbExpZ2h0IiwibW9vbkxpZ2h0IiwiaXNTaG93aW5nUHJvcGVydHkiLCJpc1Nob3dpbmciLCJyZW1vdmVBbGxDaGlsZHJlbiIsInF1YXRlcm5pb25Qcm9wZXJ0eSIsIlF1YXRlcm5pb24iLCJxdWF0ZXJuaW9uIiwiY29weSIsInVwZGF0ZU1hdHJpeCIsInVwZGF0ZU1hdHJpeFdvcmxkIiwibGFzdEdsb2JhbFBvaW50IiwicHJlc3NMaXN0ZW5lciIsImV2ZW50IiwicG9pbnRlciIsInBvaW50IiwicmVzZXJ2ZUZvckRyYWciLCJkcmFnIiwiZGVsdGEiLCJzY2FsZSIsIndpbmRvdyIsInBoZXQiLCJqb2lzdCIsInNpbSIsInNjYWxlUHJvcGVydHkiLCJuZXdRdWF0ZXJuaW9uIiwic2V0RnJvbUV1bGVyIiwiRXVsZXIiLCJtdWx0aXBseSIsInJlbGVhc2UiLCJzdGVwIiwiZHQiLCJ0aGV0YSIsIk1hdGgiLCJQSSIsInNldEZyb21BeGlzQW5nbGUiLCJyZW5kZXIiLCJsYXlvdXQiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vbGVjdWxlM0REaWFsb2cuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogM0QgTW9sZWN1bGUgZGlzcGxheSB0aGF0IHRha2VzIHVwIHRoZSBlbnRpcmUgc2NyZWVuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XHJcbmltcG9ydCBUaHJlZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vLi4vbW9iaXVzL2pzL1RocmVlTm9kZS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgUGxheVBhdXNlQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1BsYXlQYXVzZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgUHJlc3NMaXN0ZW5lciwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IERpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcclxuaW1wb3J0IG51bGxTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9udWxsU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgYnVpbGRBTW9sZWN1bGUgZnJvbSAnLi4vLi4vLi4vYnVpbGRBTW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgQnVpbGRBTW9sZWN1bGVTdHJpbmdzIGZyb20gJy4uLy4uLy4uL0J1aWxkQU1vbGVjdWxlU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCQU1Db25zdGFudHMgZnJvbSAnLi4vLi4vQkFNQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlTGlzdCBmcm9tICcuLi8uLi9tb2RlbC9Nb2xlY3VsZUxpc3QuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFZpZXdTdHlsZSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1NQQUNFX0ZJTEwnLCAnQkFMTF9BTkRfU1RJQ0snIF0gKTtcclxuXHJcbmNsYXNzIE1vbGVjdWxlM0REaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPENvbXBsZXRlTW9sZWN1bGV8bnVsbD59IGNvbXBsZXRlTW9sZWN1bGVQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb21wbGV0ZU1vbGVjdWxlUHJvcGVydHkgKSB7XHJcblxyXG4gICAgLy8gSG9sZHMgYWxsIG9mIHRoZSBjb250ZW50IHdpdGhpbiB0aGUgZGlhbG9nLiBEaWFsb2cgbmVlZHMgdG8gYmUgc2l6ZWQgdG8gY29udGVudCBiZWZvcmUgY29udGVudCBpcyBhZGRlZC5cclxuICAgIGNvbnN0IGNvbnRlbnRXcmFwcGVyID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMzAwLCAzNDAgKTtcclxuICAgIGNvbnN0IGNvbnRlbnRWQm94ID0gbmV3IFZCb3goIHsgY2hpbGRyZW46IFsgY29udGVudFdyYXBwZXIgXSwgc3BhY2luZzogMTMgfSApO1xyXG4gICAgY29uc3QgdGl0bGUgPSBuZXcgVGV4dCggJycsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyOCApLFxyXG4gICAgICBtYXhXaWR0aDogY29udGVudFdyYXBwZXIud2lkdGggLSAyMCxcclxuICAgICAgZmlsbDogJ3doaXRlJ1xyXG4gICAgfSApO1xyXG4gICAgc3VwZXIoIGNvbnRlbnRWQm94LCB7XHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIHhBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgcmVzaXplOiBmYWxzZSxcclxuICAgICAgY2xvc2VCdXR0b25Db2xvcjogJ3doaXRlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxDb21wbGV0ZU1vbGVjdWxlfG51bGw+fVxyXG4gICAgdGhpcy5jb21wbGV0ZU1vbGVjdWxlUHJvcGVydHkgPSBjb21wbGV0ZU1vbGVjdWxlUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Qm9vbGVhblByb3BlcnR5fSBQcm9wZXJ0eSB1c2VkIGZvciBwbGF5aW5nL3BhdXNpbmcgYSByb3RhdGluZyBtb2xlY3VsZVxyXG4gICAgdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtCb29sZWFuUHJvcGVydHl9XHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5fSBWaWV3IHN0eWxlcyBmb3Igc3BhY2UgZmlsbGVkIGFuZCBiYWxsIGFuZCBzdGljayB2aWV3cy5cclxuICAgIHRoaXMudmlld1N0eWxlUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIFZpZXdTdHlsZSwgVmlld1N0eWxlLlNQQUNFX0ZJTEwgKTtcclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ1dHRvbiA9IG5ldyBQbGF5UGF1c2VCdXR0b24oIHRoaXMuaXNQbGF5aW5nUHJvcGVydHksIHtcclxuICAgICAgcmFkaXVzOiAxNSxcclxuICAgICAgdmFsdWVPZmZTb3VuZFBsYXllcjogbnVsbFNvdW5kUGxheWVyLFxyXG4gICAgICB2YWx1ZU9uU291bmRQbGF5ZXI6IG51bGxTb3VuZFBsYXllcixcclxuICAgICAgYmFzZUNvbG9yOiBDb2xvci5PUkFOR0VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSZWFkcyBvdXQgZ2VuZXJhbCBmb3JtdWxhIGZvciBkaXNwbGF5ZWQgbW9sZWN1bGUuXHJcbiAgICBjb25zdCBmb3JtdWxhVGV4dCA9IG5ldyBSaWNoVGV4dCggJycsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxOCApLFxyXG4gICAgICBmaWxsOiAncmdiKDE4NywgMTg3LCAxODcpJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBmb3JtdWxhIHRleHQgZm9yIGRpc3BsYXllZCBtb2xlY3VsZS5cclxuICAgIGNvbXBsZXRlTW9sZWN1bGVQcm9wZXJ0eS5saW5rKCBjb21wbGV0ZU1vbGVjdWxlID0+IHtcclxuICAgICAgaWYgKCBjb21wbGV0ZU1vbGVjdWxlICkge1xyXG4gICAgICAgIHRpdGxlLnNldFN0cmluZyggU3RyaW5nVXRpbHMuZmlsbEluKCBCdWlsZEFNb2xlY3VsZVN0cmluZ3MubW9sZWN1bGVOYW1lUGF0dGVybiwge1xyXG4gICAgICAgICAgZGlzcGxheTogY29tcGxldGVNb2xlY3VsZS5nZXREaXNwbGF5TmFtZSgpXHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgICAgZm9ybXVsYVRleHQuc2V0U3RyaW5nKCBjb21wbGV0ZU1vbGVjdWxlLmdldEdlbmVyYWxGb3JtdWxhRnJhZ21lbnQoKSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCdWlsZCBhbmQgYWRkIGF0b20gbWVzaCB0byBjb250YWluZXIuXHJcbiAgICAgKiBAcGFyYW0ge0NvbXBsZXRlTW9sZWN1bGV9IGNvbXBsZXRlTW9sZWN1bGVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0M0R9IGNvbnRhaW5lclxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSByZXF1aXJlc0F0b21PZmZzZXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2NhbGVkUmFkaXVzXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxDb2xvcj59IFtjb2xvclNldF1cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBjb25zdCBidWlsZEF0b21NZXNoID0gKCBjb21wbGV0ZU1vbGVjdWxlLCBjb250YWluZXIsIHJlcXVpcmVzQXRvbU9mZnNldCwgc2NhbGVkUmFkaXVzLCBjb2xvclNldCApID0+IHtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29tcGxldGVNb2xlY3VsZS5hdG9tcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBhdG9tID0gY29tcGxldGVNb2xlY3VsZS5hdG9tc1sgaSBdO1xyXG5cclxuICAgICAgICAvLyBIYW5kbGUgcGFyYW1ldGVycyBmb3IgaWNvbiB2cyBub24taWNvbiBidWlsZFxyXG4gICAgICAgIGNvbnN0IHJhZGl1cyA9IHNjYWxlZFJhZGl1cyA/IDAuMzUgOiBhdG9tLmNvdmFsZW50UmFkaXVzIC8gODA7XHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gcmVxdWlyZXNBdG9tT2Zmc2V0ID8gKCAtMC41ICkgKyAoIGkgKSA6IDA7XHJcbiAgICAgICAgY29uc3QgY29sb3IgPSBjb2xvclNldCA/IENvbG9yLnRvQ29sb3IoIGNvbG9yU2V0WyBpIF0gKS50b051bWJlcigpIDogQ29sb3IudG9Db2xvciggYXRvbS5lbGVtZW50LmNvbG9yICkudG9OdW1iZXIoKTtcclxuICAgICAgICBjb25zdCBpY29uTWVzaCA9IG5ldyBUSFJFRS5NZXNoKCBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoIHJhZGl1cywgMzAsIDI0ICksIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKCB7XHJcbiAgICAgICAgICBjb2xvcjogY29sb3JcclxuICAgICAgICB9ICkgKTtcclxuICAgICAgICBjb250YWluZXIuYWRkKCBpY29uTWVzaCApO1xyXG4gICAgICAgIGljb25NZXNoLnBvc2l0aW9uLnNldCggYXRvbS54M2QgKyBvZmZzZXQsIGF0b20ueTNkLCBhdG9tLnozZCApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQnVpbGQgYW5kIGFkZCBhdG9tIG1lc2ggdG8gY29udGFpbmVyLlxyXG4gICAgICogQHBhcmFtIHtDb21wbGV0ZU1vbGVjdWxlfSBjb21wbGV0ZU1vbGVjdWxlXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdDNEfSBjb250YWluZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVxdWlyZXNCb25kT2Zmc2V0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1lc2hUaGlja25lc3NcclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBjb25zdCBidWlsZEJvbmRNZXNoID0gKCBjb21wbGV0ZU1vbGVjdWxlLCBjb250YWluZXIsIHJlcXVpcmVzQm9uZE9mZnNldCwgbWVzaFRoaWNrbmVzcyApID0+IHtcclxuICAgICAgY29tcGxldGVNb2xlY3VsZS5ib25kcy5mb3JFYWNoKCBib25kID0+IHtcclxuICAgICAgICBsZXQgb3JpZ2luT2Zmc2V0ID0gLTAuMjU7XHJcbiAgICAgICAgbGV0IGRpc3BsYWNlbWVudCA9IDA7XHJcblxyXG4gICAgICAgIC8vIElmIGEgYm9uZCBoYXMgYSBoaWdoIG9yZGVyIHdlIG5lZWQgdG8gYWRqdXN0IHRoZSBib25kIG1lc2ggaW4gdGhlIHktYXhpc1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJvbmQub3JkZXI7IGkrKyApIHtcclxuXHJcbiAgICAgICAgICAvLyBPZmZzZXQgZm9yIHNpbmdsZSBib25kXHJcbiAgICAgICAgICBpZiAoIGJvbmQub3JkZXIgPT09IDEgKSB7XHJcbiAgICAgICAgICAgIG9yaWdpbk9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgIGRpc3BsYWNlbWVudCA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBPZmZzZXQgZm9yIGRvdWJsZSBib25kXHJcbiAgICAgICAgICBlbHNlIGlmICggYm9uZC5vcmRlciA9PT0gMiApIHtcclxuICAgICAgICAgICAgb3JpZ2luT2Zmc2V0ID0gLTAuMjU7XHJcbiAgICAgICAgICAgIGRpc3BsYWNlbWVudCA9IDAuNTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIE9mZnNldCBmb3IgdHJpcGxlIGJvbmRcclxuICAgICAgICAgIGVsc2UgaWYgKCBib25kLm9yZGVyID09PSAzICkge1xyXG4gICAgICAgICAgICBvcmlnaW5PZmZzZXQgPSAtMC4yNTtcclxuICAgICAgICAgICAgZGlzcGxhY2VtZW50ID0gMC4yNTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIEhhbmRsZSBidWlsZGluZyBib25kcyBmb3IgYmFsbCBhbmQgc3RpY2sgaWNvbiAoTzIpXHJcbiAgICAgICAgICBpZiAoIHJlcXVpcmVzQm9uZE9mZnNldCApIHtcclxuICAgICAgICAgICAgb3JpZ2luT2Zmc2V0ID0gLTAuNTtcclxuICAgICAgICAgICAgZGlzcGxhY2VtZW50ID0gMTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBFc3RhYmxpc2ggcGFyYW1ldGVycyBmb3IgYm9uZCBtZXNoXHJcbiAgICAgICAgICBjb25zdCBib25kQVBvc2l0aW9uID0gbmV3IFZlY3RvcjMoIGJvbmQuYS54M2QsIGJvbmQuYS55M2QsIGJvbmQuYS56M2QgKTtcclxuICAgICAgICAgIGNvbnN0IGJvbmRCUG9zaXRpb24gPSBuZXcgVmVjdG9yMyggYm9uZC5iLngzZCwgYm9uZC5iLnkzZCwgYm9uZC5iLnozZCApO1xyXG4gICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBib25kQVBvc2l0aW9uLmRpc3RhbmNlKCBib25kQlBvc2l0aW9uICk7XHJcbiAgICAgICAgICBjb25zdCBib25kTWVzaCA9IG5ldyBUSFJFRS5NZXNoKFxyXG4gICAgICAgICAgICBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSggbWVzaFRoaWNrbmVzcywgbWVzaFRoaWNrbmVzcywgZGlzdGFuY2UsIDMyLCBmYWxzZSApLFxyXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCggeyBjb2xvcjogQ29sb3IuZ3JheSB9IClcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgLy8gVmVjdG9yM1xyXG4gICAgICAgICAgY29uc3QgY3lsaW5kZXJEZWZhdWx0T3JpZW50YXRpb24gPSBWZWN0b3IzLllfVU5JVDtcclxuICAgICAgICAgIGNvbnN0IG5lZWRlZE9yaWVudGF0aW9uID0gYm9uZEFQb3NpdGlvbi5taW51cyggYm9uZEJQb3NpdGlvbiApLm5vcm1hbGl6ZWQoKTtcclxuXHJcbiAgICAgICAgICAvLyBNYXRyaXgzXHJcbiAgICAgICAgICBjb25zdCBtYXRyaXggPSBNYXRyaXgzLnJvdGF0ZUFUb0IoIGN5bGluZGVyRGVmYXVsdE9yaWVudGF0aW9uLCBuZWVkZWRPcmllbnRhdGlvbiApO1xyXG5cclxuICAgICAgICAgIC8vIFZlY3RvcjNcclxuICAgICAgICAgIGNvbnN0IG1pZHBvaW50QmV0d2VlbkF0b21zID0gYm9uZEFQb3NpdGlvbi5hdmVyYWdlKCBib25kQlBvc2l0aW9uICk7XHJcbiAgICAgICAgICBjb250YWluZXIuYWRkKCBib25kTWVzaCApO1xyXG5cclxuICAgICAgICAgIC8vIEVuZm9yY2UgYSBtYW51YWwgdXBkYXRlIHRvIHRoZSBib25kTWVzaCBtYXRyaXguXHJcbiAgICAgICAgICBib25kTWVzaC5tYXRyaXhBdXRvVXBkYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICBib25kTWVzaC5tYXRyaXguc2V0KFxyXG4gICAgICAgICAgICBtYXRyaXgubTAwKCksIG1hdHJpeC5tMDEoKSwgbWF0cml4Lm0wMigpLCBtaWRwb2ludEJldHdlZW5BdG9tcy54LFxyXG4gICAgICAgICAgICBtYXRyaXgubTEwKCksIG1hdHJpeC5tMTEoKSwgbWF0cml4Lm0xMigpLCBtaWRwb2ludEJldHdlZW5BdG9tcy55ICsgb3JpZ2luT2Zmc2V0ICsgKCBpICkgKiBkaXNwbGFjZW1lbnQsXHJcbiAgICAgICAgICAgIG1hdHJpeC5tMjAoKSwgbWF0cml4Lm0yMSgpLCBtYXRyaXgubTIyKCksIG1pZHBvaW50QmV0d2VlbkF0b21zLnosXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENvbnN0cnVjdCBpY29ucyBmcm9tIE1vbGVjdWxlTGlzdC5PMiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9idWlsZC1hLW1vbGVjdWxlL2lzc3Vlcy8xMzkuXHJcbiAgICAvLyBPcHRpb25zIGZvciBUaHJlZU5vZGUgaWNvbnMuXHJcbiAgICBjb25zdCBpY29uT3B0aW9ucyA9IHtcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIGNhbWVyYVBvc2l0aW9uOiBuZXcgVmVjdG9yMyggMCwgMCwgNSApXHJcbiAgICB9O1xyXG4gICAgY29uc3QgY29sb3JTZXQgPSBbIG5ldyBDb2xvciggMTU5LCAxMDIsIDIxOCApLCBuZXcgQ29sb3IoIDI1NSwgMjU1LCAyNTUgKSBdO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIFNwYWNlIEZpbGxlZCBpY29uIGFuZCByZXByZXNlbnRhdGlvblxyXG4gICAgY29uc3Qgc3BhY2VGaWxsZWRJY29uID0gbmV3IFRocmVlTm9kZSggNTAsIDUwLCBpY29uT3B0aW9ucyApO1xyXG4gICAgY29uc3Qgc3BhY2VGaWxsZWRTY2VuZSA9IHNwYWNlRmlsbGVkSWNvbi5zdGFnZS50aHJlZVNjZW5lO1xyXG4gICAgY29uc3Qgc3BhY2VGaWxsZWRDb250YWluZXIgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgIHNwYWNlRmlsbGVkU2NlbmUuYWRkKCBzcGFjZUZpbGxlZENvbnRhaW5lciApO1xyXG4gICAgYnVpbGRBdG9tTWVzaCggTW9sZWN1bGVMaXN0Lk8yLCBzcGFjZUZpbGxlZENvbnRhaW5lciwgZmFsc2UsIGZhbHNlLCBjb2xvclNldCApO1xyXG5cclxuICAgIC8vIExpc3RlbmVyIHRvIGNoYW5nZSB0aGUgdmlldyBzdHlsZSB0byB0aGUgc3BhY2UgZmlsbGVkIHJlcHJlc2VudGF0aW9uXHJcbiAgICBzcGFjZUZpbGxlZEljb24uYWRkSW5wdXRMaXN0ZW5lciggbmV3IFByZXNzTGlzdGVuZXIoIHtcclxuICAgICAgcHJlc3M6ICgpID0+IHtcclxuICAgICAgICB0aGlzLnZpZXdTdHlsZVByb3BlcnR5LnZhbHVlID0gVmlld1N0eWxlLlNQQUNFX0ZJTEw7XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIEJhbGwgYW5kIFN0aWNrIGljb24gYW5kIHJlcHJlc2VudGF0aW9uXHJcbiAgICBjb25zdCBiYWxsQW5kU3RpY2tJY29uID0gbmV3IFRocmVlTm9kZSggNTAsIDUwLCB7XHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICBjYW1lcmFQb3NpdGlvbjogbmV3IFZlY3RvcjMoIDAsIDAsIDcgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYmFsbEFuZFN0aWNrU2NlbmUgPSBiYWxsQW5kU3RpY2tJY29uLnN0YWdlLnRocmVlU2NlbmU7XHJcbiAgICBjb25zdCBiYWxsQW5kU3RpY2tDb250YWluZXIgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuICAgIGJhbGxBbmRTdGlja1NjZW5lLmFkZCggYmFsbEFuZFN0aWNrQ29udGFpbmVyICk7XHJcbiAgICBidWlsZEF0b21NZXNoKCBNb2xlY3VsZUxpc3QuTzIsIGJhbGxBbmRTdGlja0NvbnRhaW5lciwgdHJ1ZSwgZmFsc2UsIGNvbG9yU2V0ICk7XHJcbiAgICBidWlsZEJvbmRNZXNoKCBNb2xlY3VsZUxpc3QuTzIsIGJhbGxBbmRTdGlja0NvbnRhaW5lciwgdHJ1ZSwgMC4yICk7XHJcblxyXG4gICAgLy8gVXBkYXRlcyB0aGUgdmlldyBzdHlsZSB0byB0aGUgYmFsbCBhbmQgc3RpY2sgcmVwcmVzZW50YXRpb25cclxuICAgIGJhbGxBbmRTdGlja0ljb24uYWRkSW5wdXRMaXN0ZW5lciggbmV3IFByZXNzTGlzdGVuZXIoIHtcclxuICAgICAgcHJlc3M6ICgpID0+IHtcclxuICAgICAgICB0aGlzLnZpZXdTdHlsZVByb3BlcnR5LnZhbHVlID0gVmlld1N0eWxlLkJBTExfQU5EX1NUSUNLO1xyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBDb25zdHJ1Y3QgM0QgdmlldyBvZiBtb2xlY3VsZU5vZGVcclxuICAgIGNvbnN0IG1vbGVjdWxlTm9kZSA9IG5ldyBUaHJlZU5vZGUoIDMwMCwgMjAwLCB7XHJcbiAgICAgIGNhbWVyYVBvc2l0aW9uOiBuZXcgVmVjdG9yMyggMCwgMCwgNyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBtb2xlY3VsZUNvbnRhaW5lciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgY29uc3QgbW9sZWN1bGVTY2VuZSA9IG1vbGVjdWxlTm9kZS5zdGFnZS50aHJlZVNjZW5lO1xyXG4gICAgbW9sZWN1bGVTY2VuZS5hZGQoIG1vbGVjdWxlQ29udGFpbmVyICk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBlYWNoIDNEIHJlcHJlc2VudGF0aW9uIGJhc2VkIG9uIHRoZSBjdXJyZW50IHZpZXcgc3R5bGVcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgdGhpcy52aWV3U3R5bGVQcm9wZXJ0eSwgY29tcGxldGVNb2xlY3VsZVByb3BlcnR5IF0sICggdmlld1N0eWxlLCBjb21wbGV0ZU1vbGVjdWxlICkgPT4ge1xyXG4gICAgICBpZiAoIGNvbXBsZXRlTW9sZWN1bGUgKSB7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbGwgcHJldmlvdXMgbWVzaCBlbGVtZW50cyBpZiB0aGV5IGV4aXN0cyBmcm9tIGEgcHJldmlvdXMgYnVpbGRcclxuICAgICAgICB3aGlsZSAoIG1vbGVjdWxlQ29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgICBtb2xlY3VsZUNvbnRhaW5lci5yZW1vdmUoIG1vbGVjdWxlQ29udGFpbmVyLmNoaWxkcmVuWyAwIF0gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBidWlsZGluZyBtZXNoIGZvciBzcGFjZSBmaWxsIHJlcHJlc2VudGF0aW9uXHJcbiAgICAgICAgaWYgKCB2aWV3U3R5bGUgPT09IFZpZXdTdHlsZS5TUEFDRV9GSUxMICYmIGNvbXBsZXRlTW9sZWN1bGUgKSB7XHJcbiAgICAgICAgICBidWlsZEF0b21NZXNoKCBjb21wbGV0ZU1vbGVjdWxlLCBtb2xlY3VsZUNvbnRhaW5lciwgZmFsc2UsIGZhbHNlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBIYW5kbGUgYnVpbGRpbmcgbWVzaCBmb3IgYmFsbCBhbmQgc3RpY2sgcmVwcmVzZW50YXRpb25cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGJ1aWxkQXRvbU1lc2goIGNvbXBsZXRlTW9sZWN1bGUsIG1vbGVjdWxlQ29udGFpbmVyLCBmYWxzZSwgdHJ1ZSApO1xyXG4gICAgICAgICAgYnVpbGRCb25kTWVzaCggY29tcGxldGVNb2xlY3VsZSwgbW9sZWN1bGVDb250YWluZXIsIGZhbHNlLCAwLjEgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdG9nZ2xlIGJ1dHRvbnMgZm9yIHNjZW5lIHNlbGVjdGlvblxyXG4gICAgY29uc3QgdG9nZ2xlQnV0dG9uc0NvbnRlbnQgPSBbIHtcclxuICAgICAgdmFsdWU6IFZpZXdTdHlsZS5TUEFDRV9GSUxMLFxyXG4gICAgICBjcmVhdGVOb2RlOiAoKSA9PiBzcGFjZUZpbGxlZEljb25cclxuICAgIH0sIHtcclxuICAgICAgdmFsdWU6IFZpZXdTdHlsZS5CQUxMX0FORF9TVElDSyxcclxuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gYmFsbEFuZFN0aWNrSWNvblxyXG4gICAgfSBdO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgaWNvbnMgZm9yIHNjZW5lIHNlbGVjdGlvblxyXG4gICAgY29uc3Qgc2NlbmVSYWRpb0J1dHRvbkdyb3VwID0gbmV3IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCggdGhpcy52aWV3U3R5bGVQcm9wZXJ0eSwgdG9nZ2xlQnV0dG9uc0NvbnRlbnQsIHtcclxuICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgc3BhY2luZzogMzAsXHJcbiAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHhNYXJnaW46IDUsXHJcbiAgICAgICAgYmFzZUNvbG9yOiAnYmxhY2snLFxyXG4gICAgICAgIGNvcm5lclJhZGl1czogQkFNQ29uc3RhbnRzLkNPUk5FUl9SQURJVVMsXHJcbiAgICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uczoge1xyXG4gICAgICAgICAgc2VsZWN0ZWRTdHJva2U6ICd5ZWxsb3cnLFxyXG4gICAgICAgICAgZGVzZWxlY3RlZFN0cm9rZTogJ3doaXRlJyxcclxuICAgICAgICAgIHNlbGVjdGVkTGluZVdpZHRoOiAxLFxyXG4gICAgICAgICAgZGVzZWxlY3RlZExpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgZGVzZWxlY3RlZEJ1dHRvbk9wYWNpdHk6IDAuMjVcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCBsaWdodHMgdG8gZWFjaCBzY2VuZSBmb3IgbWFpbiBtb2xlY3VsZSBub2RlIGFuZCBpY29ucy4gTGlnaHRzIHRha2VuIGZyb20gTW9sZWN1bGVTaGFwZXNTY3JlZW5WaWV3LmpzXHJcbiAgICBjb25zdCBhbWJpZW50TGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KCAweDE5MTkxOSApOyAvLyBjbG9zZXN0IHRvIDAuMSBsaWtlIHRoZSBvcmlnaW5hbCBzaGFkZXJcclxuICAgIG1vbGVjdWxlU2NlbmUuYWRkKCBhbWJpZW50TGlnaHQgKTtcclxuICAgIHNwYWNlRmlsbGVkU2NlbmUuYWRkKCBhbWJpZW50TGlnaHQuY2xvbmUoKSApO1xyXG4gICAgYmFsbEFuZFN0aWNrU2NlbmUuYWRkKCBhbWJpZW50TGlnaHQuY2xvbmUoKSApO1xyXG5cclxuICAgIGNvbnN0IHN1bkxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoIDB4ZmZmZmZmLCAwLjggKiAwLjkgKTtcclxuICAgIHN1bkxpZ2h0LnBvc2l0aW9uLnNldCggLTEuMCwgMC41LCAyLjAgKTtcclxuICAgIG1vbGVjdWxlU2NlbmUuYWRkKCBzdW5MaWdodCApO1xyXG4gICAgc3BhY2VGaWxsZWRTY2VuZS5hZGQoIHN1bkxpZ2h0LmNsb25lKCkgKTtcclxuICAgIGJhbGxBbmRTdGlja1NjZW5lLmFkZCggc3VuTGlnaHQuY2xvbmUoKSApO1xyXG5cclxuICAgIGNvbnN0IG1vb25MaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KCAweGZmZmZmZiwgMC42ICogMC45ICk7XHJcbiAgICBtb29uTGlnaHQucG9zaXRpb24uc2V0KCAyLjAsIC0xLjAsIDEuMCApO1xyXG4gICAgbW9sZWN1bGVTY2VuZS5hZGQoIG1vb25MaWdodCApO1xyXG4gICAgc3BhY2VGaWxsZWRTY2VuZS5hZGQoIG1vb25MaWdodC5jbG9uZSgpICk7XHJcbiAgICBiYWxsQW5kU3RpY2tTY2VuZS5hZGQoIG1vb25MaWdodC5jbG9uZSgpICk7XHJcblxyXG4gICAgLy8gQ29ycmVjdCB0aGUgb3JkZXJpbmcgb2YgdGhlIGRpYWxvZ3MgY2hpbGRyZW5cclxuICAgIHRoaXMuaXNTaG93aW5nUHJvcGVydHkubGluayggaXNTaG93aW5nID0+IHtcclxuXHJcbiAgICAgIC8vIFNldCB0aGUgb3JkZXIgb2YgY2hpbGRyZW4gZm9yIHRoZSBWQm94XHJcbiAgICAgIGlmICggaXNTaG93aW5nICkge1xyXG4gICAgICAgIGNvbnRlbnRWQm94LnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgICAgY29udGVudFZCb3guY2hpbGRyZW4gPSBbIGZvcm11bGFUZXh0LCBtb2xlY3VsZU5vZGUsIHNjZW5lUmFkaW9CdXR0b25Hcm91cCwgcGxheVBhdXNlQnV0dG9uIF07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29udGVudFZCb3gucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48VEhSRUUuUXVhdGVybmlvbj59IFVwZGF0ZSBtYXRyaXggb2YgdGhlIDNEIHJlcHJlc2VudGF0aW9uXHJcbiAgICB0aGlzLnF1YXRlcm5pb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IFRIUkVFLlF1YXRlcm5pb24oKSApO1xyXG4gICAgdGhpcy5xdWF0ZXJuaW9uUHJvcGVydHkubGluayggcXVhdGVybmlvbiA9PiB7XHJcblxyXG4gICAgICAvLyBDb3B5IHRoZSBuZXcgdmFsdWUgaW50byB0aGUgVGhyZWUgb2JqZWN0J3MgcXVhdGVybmlvbiBhbmQgdXBkYXRlIHRoZSBtYXRyaWNlcy5cclxuICAgICAgbW9sZWN1bGVDb250YWluZXIucXVhdGVybmlvbi5jb3B5KCBxdWF0ZXJuaW9uICk7XHJcbiAgICAgIG1vbGVjdWxlQ29udGFpbmVyLnVwZGF0ZU1hdHJpeCgpO1xyXG4gICAgICBtb2xlY3VsZUNvbnRhaW5lci51cGRhdGVNYXRyaXhXb3JsZCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtUaHJlZU5vZGV9XHJcbiAgICB0aGlzLm1vbGVjdWxlTm9kZSA9IG1vbGVjdWxlTm9kZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VGhyZWVOb2RlfVxyXG4gICAgdGhpcy5zcGFjZUZpbGxlZEljb24gPSBzcGFjZUZpbGxlZEljb247XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1RocmVlTm9kZX1cclxuICAgIHRoaXMuYmFsbEFuZFN0aWNrSWNvbiA9IGJhbGxBbmRTdGlja0ljb247XHJcbiAgICBsZXQgbGFzdEdsb2JhbFBvaW50ID0gbnVsbDtcclxuXHJcbiAgICAvLyBIYW5kbGVzIHVzZXIgaW5wdXQgdG8gcm90YXRlIG1vbGVjdWxlXHJcbiAgICBjb25zdCBwcmVzc0xpc3RlbmVyID0gbmV3IFByZXNzTGlzdGVuZXIoIHtcclxuICAgICAgcHJlc3M6IGV2ZW50ID0+IHtcclxuICAgICAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgIGxhc3RHbG9iYWxQb2ludCA9IGV2ZW50LnBvaW50ZXIucG9pbnQuY29weSgpO1xyXG5cclxuICAgICAgICAvLyBtYXJrIHRoZSBJbnRlbnQgb2YgdGhpcyBwb2ludGVyIGxpc3RlbmVyIHRvIGluZGljYXRlIHRoYXQgd2Ugd2FudCB0byBkcmFnIGFuZCB0aGVyZWZvcmUgTk9UXHJcbiAgICAgICAgLy8gcGFuIHdoaWxlIHpvb21lZCBpblxyXG4gICAgICAgIGV2ZW50LnBvaW50ZXIucmVzZXJ2ZUZvckRyYWcoKTtcclxuICAgICAgfSxcclxuICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRlbHRhID0gZXZlbnQucG9pbnRlci5wb2ludC5taW51cyggbGFzdEdsb2JhbFBvaW50ICk7XHJcbiAgICAgICAgbGFzdEdsb2JhbFBvaW50ID0gZXZlbnQucG9pbnRlci5wb2ludC5jb3B5KCk7XHJcblxyXG4gICAgICAgIC8vIENvbXBlbnNhdGUgZm9yIHRoZSBzaXplIG9mIHRoZSBzaW0gc2NyZWVuIGJ5IHNjYWxpbmcgdGhlIGFtb3VudCB3ZSByb3RhdGUgaW4gVEhSRUUuRXVsZXJcclxuICAgICAgICBjb25zdCBzY2FsZSA9IDEgLyAoIDEwMCAqIHdpbmRvdy5waGV0LmpvaXN0LnNpbS5zY2FsZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgY29uc3QgbmV3UXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCkuc2V0RnJvbUV1bGVyKCBuZXcgVEhSRUUuRXVsZXIoIGRlbHRhLnkgKiBzY2FsZSwgZGVsdGEueCAqIHNjYWxlLCAwICkgKTtcclxuICAgICAgICBuZXdRdWF0ZXJuaW9uLm11bHRpcGx5KCB0aGlzLnF1YXRlcm5pb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICAgIHRoaXMucXVhdGVybmlvblByb3BlcnR5LnZhbHVlID0gbmV3UXVhdGVybmlvbjtcclxuICAgICAgfSxcclxuICAgICAgcmVsZWFzZTogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBtb2xlY3VsZU5vZGUuYWRkSW5wdXRMaXN0ZW5lciggcHJlc3NMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgaWYgKCB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICYmICF0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAvLyBEZWZpbmUgYSBxdWF0ZXJuaW9uIHRoYXQgaXMgb2Zmc2V0IGJ5IGEgcm90YXRpb24gZGV0ZXJtaW5lZCBieSB0aGV0YS5cclxuICAgICAgLy8gTXVsdGlwbHkgdGhlIHJvdGF0ZWQgcXVhdGVybmlvbiBieSB0aGUgcHJldmlvdXMgcXVhdGVybmlvbiBvZiB0aGUgVEhSRUUgb2JqZWN0IGFuZCByZW5kZXIgaXQgd2l0aCBpdHMgbmV3XHJcbiAgICAgIC8vIHF1YXRlcm5pb25cclxuICAgICAgY29uc3QgdGhldGEgPSBNYXRoLlBJIC8gNiAqIGR0O1xyXG4gICAgICBjb25zdCBuZXdRdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcclxuICAgICAgbmV3UXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKCBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMSwgMCApLCB0aGV0YSApO1xyXG4gICAgICBuZXdRdWF0ZXJuaW9uLm11bHRpcGx5KCB0aGlzLnF1YXRlcm5pb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICB0aGlzLnF1YXRlcm5pb25Qcm9wZXJ0eS52YWx1ZSA9IG5ld1F1YXRlcm5pb247XHJcbiAgICB9XHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVuZGVyIGVhY2ggVGhyZWVOb2RlIHNjZW5lXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlbmRlcigpIHtcclxuXHJcbiAgICAvLyBNYWluIG1vbGVjdWxlXHJcbiAgICB0aGlzLm1vbGVjdWxlTm9kZS5sYXlvdXQoKTtcclxuICAgIHRoaXMubW9sZWN1bGVOb2RlLnJlbmRlciggdW5kZWZpbmVkICk7XHJcblxyXG4gICAgLy8gU3BhY2UgZmlsbGVkIGljb25cclxuICAgIHRoaXMuc3BhY2VGaWxsZWRJY29uLmxheW91dCgpO1xyXG4gICAgdGhpcy5zcGFjZUZpbGxlZEljb24ucmVuZGVyKCB1bmRlZmluZWQgKTtcclxuXHJcbiAgICAvLyBCYWxsIGFuZCBzdGljayBpY29uXHJcbiAgICB0aGlzLmJhbGxBbmRTdGlja0ljb24ubGF5b3V0KCk7XHJcbiAgICB0aGlzLmJhbGxBbmRTdGlja0ljb24ucmVuZGVyKCB1bmRlZmluZWQgKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQU1vbGVjdWxlLnJlZ2lzdGVyKCAnTW9sZWN1bGUzRERpYWxvZycsIE1vbGVjdWxlM0REaWFsb2cgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9sZWN1bGUzRERpYWxvZzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sMkNBQTJDO0FBQ3ZFLE9BQU9DLDZCQUE2QixNQUFNLHlEQUF5RDtBQUNuRyxPQUFPQyxTQUFTLE1BQU0scUNBQXFDO0FBQzNELE9BQU9DLFFBQVEsTUFBTSxvQ0FBb0M7QUFDekQsT0FBT0MsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MscUJBQXFC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