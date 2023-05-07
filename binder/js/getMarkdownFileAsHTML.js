// Copyright 2018-2021, University of Colorado Boulder

/**
 * Get the hand written markdown file for a component. Return the converted HTML from the markdown converted by "marked"
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */


// modules
const fs = require( 'fs' );
const marked = require( 'marked' );

/**
 * This markdown file is converted to HTML with the 'marked' module.
 * @param {string} repo
 * @param {string} component
 * @returns {string} - HTML
 */
module.exports = function( repo, component ) {

  let markdown = '';
  try {
    const m = fs.readFileSync( `${__dirname}/../../${repo}/docs/${component}.md` );
    markdown = marked( m.toString() );

    // Use subdirectory for images, so that different directories can have images of the same name
    // TODO: This may yield false positives, say if code examples have this same term, see https://github.com/phetsims/binder/issues/28
    markdown = markdown.split( '<img src="images/' ).join( `<img src="images/${repo}/` );
  }
  catch( e ) {
    markdown = marked( '# TODO: *documentation*' );
  }

  return markdown;
};
