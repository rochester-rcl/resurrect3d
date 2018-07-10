/**
 * @author alteredq / http://alteredqualia.com/
 */

export default function loadShaderPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.ShaderPass = function ( shader, textureID ) {

			threeInstance.Pass.call( this );

			this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

			if ( shader instanceof threeInstance.ShaderMaterial ) {

				this.uniforms = shader.uniforms;

				this.material = shader;

			} else if ( shader ) {

				this.uniforms = threeInstance.UniformsUtils.clone( shader.uniforms );

				this.material = new threeInstance.ShaderMaterial( {

					defines: shader.defines || {},
					uniforms: this.uniforms,
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader

				} );

			}

			this.camera = new threeInstance.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
			this.scene = new threeInstance.Scene();

			this.quad = new threeInstance.Mesh( new threeInstance.PlaneBufferGeometry( 2, 2 ), null );
			this.quad.frustumCulled = false; // Avoid getting clipped
			this.scene.add( this.quad );

		};

		threeInstance.ShaderPass.prototype = Object.assign( Object.create( threeInstance.Pass.prototype ), {

			constructor: threeInstance.ShaderPass,

			render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

				if ( this.uniforms[ this.textureID ] ) {

					this.uniforms[ this.textureID ].value = readBuffer.texture;

				}

				this.quad.material = this.material;

				if ( this.renderToScreen ) {

					renderer.render( this.scene, this.camera );

				} else {

					renderer.render( this.scene, this.camera, writeBuffer, this.clear );

				}

			}

		} );
		resolve(threeInstance);
	});
}
