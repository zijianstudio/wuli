// Copyright 2018-2022, University of Colorado Boulder


import { Node } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';

const barMagnetIsString = FaradaysLawStrings.a11y.barMagnetIs;
const fieldStrengthIsString = FaradaysLawStrings.a11y.fieldStrengthIs;
const fieldLinesString = FaradaysLawStrings.a11y.fieldLines;

class MagnetDescriptionNode extends Node {

  constructor( model, describer ) {

    super();

    const fourCoilOnlyDescriptionNode = new Node( { tagName: 'p' } );
    const fourCoilOnlyPolarity = new Node( {
      tagName: 'p',
      innerContent: describer.fourCoilOnlyPolarityDescription
    } );

    const fourCoilOnlyNode = new Node( {
      tagName: 'div',
      children: [ fourCoilOnlyDescriptionNode, fourCoilOnlyPolarity ]
    } );

    const positionItem = new Node( { tagName: 'li' } );
    const twoCoilProximityItem = new Node( { tagName: 'li' } );
    const fourCoilProximityItem = new Node( { tagName: 'li' } );
    const northNode = new Node( { tagName: 'li', innerContent: describer.northPoleSideString } );
    const southNode = new Node( { tagName: 'li', innerContent: describer.southPoleSideString } );

    const twoAndFourCoilNode = new Node( {
      tagName: 'ul',
      labelContent: barMagnetIsString,
      children: [
        positionItem,
        fourCoilProximityItem,
        twoCoilProximityItem,
        northNode,
        southNode
      ]
    } );

    const movementDescriptionNode = new Node( {
      tagName: 'p',
      innerContent: describer.barMagnetHelpText
    } );

    this.addChild( fourCoilOnlyNode );
    this.addChild( twoAndFourCoilNode );
    this.addChild( movementDescriptionNode );

    const fourLoopOnlyStrengthNode = new Node( { tagName: 'p' } );

    const fourLoopFieldStrengthItem = new Node( { tagName: 'li' } );
    const twoLoopFieldStrengthItem = new Node( { tagName: 'li' } );
    const twoLoopStrengthListNode = new Node( {
      tagName: 'ul',
      labelContent: fieldStrengthIsString,
      children: [ fourLoopFieldStrengthItem, twoLoopFieldStrengthItem ]
    } );

    const fieldLinesDescriptionNode = new Node( {
      labelTagName: 'h3',
      labelContent: fieldLinesString,
      tagName: 'div',
      children: [ fourLoopOnlyStrengthNode, twoLoopStrengthListNode ]
    } );

    // observers to update inner content of the PDOM Node
    model.magnet.positionProperty.link( () => {

      // magnet position and coil proximity description content updates
      fourCoilOnlyDescriptionNode.innerContent = describer.fourLoopOnlyMagnetPosition;
      positionItem.innerContent = describer.positionOfPlayAreaString;
      twoCoilProximityItem.innerContent = describer.twoCoilProximityString;
      fourCoilProximityItem.innerContent = describer.fourCoilProximityString;

      // field strength description content updates
      fourLoopOnlyStrengthNode.innerContent = describer.fourLoopOnlyFieldStrength;
      fourLoopFieldStrengthItem.innerContent = describer.fourLoopFieldStrength;
      twoLoopFieldStrengthItem.innerContent = describer.twoLoopFieldStrength;
    } );

    model.topCoilVisibleProperty.link( showTopCoil => {
      fourCoilOnlyNode.visible = !showTopCoil;
      twoAndFourCoilNode.visible = showTopCoil;

      // ensure that the parent node is also visible
      fourLoopOnlyStrengthNode.visible = fieldLinesDescriptionNode.visible && !showTopCoil;
      twoLoopStrengthListNode.visible = fieldLinesDescriptionNode && showTopCoil;
    } );

    model.magnet.orientationProperty.lazyLink( orientation => {

      // N/S orientation change alert
      northNode.innerContent = describer.northPoleSideString;
      southNode.innerContent = describer.southPoleSideString;
      fieldLinesDescriptionNode.descriptionContent = describer.fieldLinesDescription;
      fourCoilOnlyPolarity.innerContent = describer.fourCoilOnlyPolarityDescription;
    } );

    model.magnet.fieldLinesVisibleProperty.link( showLines => {
      fieldLinesDescriptionNode.visible = showLines;
    } );

    this.addChild( fieldLinesDescriptionNode );
  }
}

faradaysLaw.register( 'MagnetDescriptionNode', MagnetDescriptionNode );
export default MagnetDescriptionNode;
