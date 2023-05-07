// Copyright 2018-2022, University of Colorado Boulder

/**
 * Combine JSON and MD into an HTML report.
 * @author Sam Reid (PhET Interactive Simulations)
 */


// const getMarkdownFileAsHTML = require( './getMarkdownFileAsHTML' );
const fs = require( 'fs' );
const handlebars = require( 'handlebars' );
const marked = require( 'marked' );
const matter = require( 'gray-matter' ); // eslint-disable-line require-statement-match
const path = require( 'path' );

// const apiUrl = '';
const simsDirectory = path.normalize( `${__dirname}/../..` );

// returns an object with the 'data' and 'content' keys
function processFile( filePath ) {

  // get the front matter object
  const mdObject = matter.read( filePath );
  const pathArray = filePath.split( path.sep );
  const docIdx = pathArray.indexOf( 'doc' );
  const repo = pathArray[ docIdx - 1 ];
  mdObject.content = marked( mdObject.content ).split( '<img src="images/' ).join( `<img src="images/${repo}/` );
  mdObject.repo = repo;
  return mdObject;
}

// responsible for returning a list of all filepaths for files within a `doc` directory for a given sim repo
function getFullDocPaths( repo ) {
  const docDir = path.join( simsDirectory, repo, 'doc' );
  return getFilePathsFromDir( docDir, [] );
}

function getFilePathsFromDir( dir, filelist = [] ) {
  if ( !( dir.includes( 'templates' ) || dir.includes( 'images' ) ) && fs.existsSync( dir ) ) {
    fs.readdirSync( dir ).forEach( file => {
      filelist = fs.statSync( path.join( dir, file ) ).isDirectory()
                 ? getFilePathsFromDir( path.join( dir, file ), filelist )
                 : filelist.concat( path.join( dir, file ) );
    } );
  }
  return filelist;
}

// flattens a multidimensional array
function flatten( arr ) {
  return [].concat( ...arr );
}

// compile and get the given template file
function getHandlebarsTemplate( filename ) {
  const fullPath = path.normalize( `${__dirname}/../templates/${filename}` );
  return handlebars.compile( fs.readFileSync( fullPath, 'utf8' ) );
}

/**
 * The data object has levels like sims=>components=>dataURLs
 * So each simKey is another object
 * @param {Object} data - see `getFromSimInMaster` for more details.
 * @returns {string} - the HTML
 */
const createHTMLString = function( data ) {
  const components = data.components;
  const sims = data.sims;

  // organize the data for the "sims by component" view
  const simsByComponent = Object.keys( components ).map( component => {
    return { name: component, sims: Object.keys( components[ component ] ) };
  } );

  const baseTemplate = getHandlebarsTemplate( 'base.html' );
  const parentComponentTemplate = getHandlebarsTemplate( 'parentComponent.html' );
  const singleComponentTemplate = getHandlebarsTemplate( 'singleComponent.html' );
  const componentsBySimulationTemplate = getHandlebarsTemplate( 'componentsBySimulation.html' );
  const simsByComponentTemplate = getHandlebarsTemplate( 'simsByComponent.html' );
  let contentHTML = '';

  // get list of files in all docs/ directories, excluding binder (can be async)
  const repos = new Set( Object.keys( components ).map( item => item.split( '/' )[ 0 ] ) );
  const documentPaths = flatten( [ ...repos ].map( getFullDocPaths ) );

  const mdData = {};
  for ( const docPath of documentPaths ) {
    const name = path.basename( docPath, '.md' );
    mdData[ name ] = processFile( docPath );
  }

  const parentComponents = Object.values( mdData ).filter( component => component.data.parent );
  // loop over each parent component
  for ( const parent of parentComponents ) {
    let componentsHTML = '';

    for ( const component of parent.data.components ) {
      const repoComponent = `${parent.repo}/${component}`;
      const simObject = components[ repoComponent ];
      const simCount = simObject ? Object.keys( simObject ).length : 0;
      const sims = simObject ?
                   Object.keys( simObject ).map( simName => {
                     return {
                       name: simName,
                       images: simObject[ simName ]
                     };
                   } ) : [];

      let markdown = mdData[ component ] ? mdData[ component ].content : `<p>No markdown content for ${component} yet.</p>`;
      markdown = new handlebars.SafeString( markdown );
      const componentContext = {
        component: component,
        sims: sims,
        simCount: simCount,
        markdown: markdown,
        repo: parent.repo
      };

      componentsHTML += singleComponentTemplate( componentContext );
    }

    contentHTML += parentComponentTemplate( {
      content: new handlebars.SafeString( parent.content ),
      title: parent.data.title,
      id: parent.data.category,
      componentsHTML: new handlebars.SafeString( componentsHTML )
    } );
  }

  contentHTML += componentsBySimulationTemplate( { sims: sims } );

  contentHTML += simsByComponentTemplate( { components: simsByComponent } );

  return baseTemplate( {
    content: contentHTML, parents: parentComponents.map( p => {
      const retObj = p.data;
      retObj.repo = p.repo;
      return retObj;
    } )
  } );
};

// handlebars helper functions
handlebars.registerHelper( 'componentLink', ( repo, component ) => {
  return new handlebars.SafeString(
    `<a href="https://github.com/phetsims/${repo}/blob/master/js/${component}.js">Source Code and Options</a>`
  );
} );

handlebars.registerHelper( 'simPageLink', simName => {
  return new handlebars.SafeString(
    `<a href="https://phet.colorado.edu/en/simulation/${simName}" target="_blank">PhET Simulation Page</a>`
  );
} );

handlebars.registerHelper( 'navList', ( components, repo ) => {
  let itemsHTML = components.map( c => `<li><a href="#${repo}-${c}">${c}</a></li>` ).join( '\n' );
  itemsHTML += '<li><a href="#sims">Sorted By Simulation</a></li>';
  return `<ul class="nav bd-sidenav">${itemsHTML}</ul>`;
} );

/**
 * @param data sim => componentName => [dataURLs]
 * @returns {string}
 */

module.exports = createHTMLString;

// Shortcut to use stored JSON for quick iteration. See getFromSimInMaster for writing of this data file.
const myArgs = process.argv.slice( 2 );
if ( myArgs[ 0 ] && myArgs[ 0 ] === 'json' ) {
  const inputFile = myArgs[ 1 ];
  const report = createHTMLString( JSON.parse( fs.readFileSync( inputFile ) ) );
  console.log( report );
}
