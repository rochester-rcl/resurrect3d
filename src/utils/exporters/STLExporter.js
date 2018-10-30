/**
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/
 */
// constants
import { STL_EXT } from '../../constants/application';

export default function loadSTLExporter(threeInstance: Object): typeof Promise {
  return new Promise((resolve, reject) => {
    threeInstance.STLExporter = function () {};

    threeInstance.STLExporter.prototype = {

    	constructor: threeInstance.STLExporter,

    	parse: ( function () {

    		var vector = new threeInstance.Vector3();
    		var normalMatrixWorld = new threeInstance.Matrix3();

    		return function parse( scene, name ) {

    			var output = '';

    			output += 'solid exported\n';

    			scene.traverse( function ( object ) {

    				if ( object instanceof threeInstance.Mesh ) {

    					var geometry = object.geometry;
    					var matrixWorld = object.matrixWorld;

    					if ( geometry instanceof threeInstance.BufferGeometry ) {

    						geometry = new threeInstance.Geometry().fromBufferGeometry( geometry );

    					}

    					if ( geometry instanceof threeInstance.Geometry ) {

    						var vertices = geometry.vertices;
    						var faces = geometry.faces;

    						normalMatrixWorld.getNormalMatrix( matrixWorld );

    						for ( var i = 0, l = faces.length; i < l; i ++ ) {

    							var face = faces[ i ];

    							vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

    							output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
    							output += '\t\touter loop\n';

    							var indices = [ face.a, face.b, face.c ];

    							for ( var j = 0; j < 3; j ++ ) {

    								vector.copy( vertices[ indices[ j ] ] ).applyMatrix4( matrixWorld );

    								output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';

    							}

    							output += '\t\tendloop\n';
    							output += '\tendfacet\n';

    						}

    					}

    				}

    			} );

    			output += 'endsolid exported\n';

    			return { stl: { filename: name + STL_EXT, rawData: output } };

    		};

    	}() )

    };
    resolve(threeInstance);
  });
}
