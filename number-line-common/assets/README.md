
Piggy Bank Nodes
================

The nodes that are used to depict piggy banks are a little complicated.  They use an SVG outline shape with a fill and,
in some cases, overlaid graphics to depict shading and decorations on the piggy bank.  Looking through the code will
help a lot in terms of understanding this.  The piggy-bank-outline.svg file was created by exporting the outline in SVG
format from Adobe Illustrator, but it should now be thought of as the "ground truth" for the piggy bank shape.  The SVG
string in this file was copied manually into piggyBankShapes.  Any changes to the shape and overlay graphics will need
to be coordinated between the .svg and .ai files.

