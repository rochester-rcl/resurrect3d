/**
 * Depth-of-field post-process with bokeh shader
 */

export default function loadBokehPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.BokehPass = function ( scene, camera, params ) {

			threeInstance.Pass.call( this );

			this.scene = scene;
			this.camera = camera;

			var focus = ( params.focus !== undefined ) ? params.focus : 1.0;
			var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
			var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.025;
			var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;

			// render targets

			var width = params.width || window.innerWidth || 1;
			var height = params.height || window.innerHeight || 1;

			this.renderTargetColor = new threeInstance.WebGLRenderTarget( width, height, {
				minFilter: threeInstance.LinearFilter,
				magFilter: threeInstance.LinearFilter,
				format: threeInstance.RGBFormat
			} );
			this.renderTargetColor.texture.name = "BokehPass.color";

			this.renderTargetDepth = this.renderTargetColor.clone();
			this.renderTargetDepth.texture.name = "BokehPass.depth";

			// depth material

			this.materialDepth = new threeInstance.MeshDepthMaterial();

			// bokeh material

			if ( threeInstance.BokehShader === undefined ) {

				console.error( "threeInstance.BokehPass relies on threeInstance.BokehShader" );

			}

			var bokehShader = threeInstance.BokehShader;
			var bokehUniforms = threeInstance.UniformsUtils.clone( bokehShader.uniforms );

			bokehUniforms[ "tDepth" ].value = this.renderTargetDepth.texture;

			bokehUniforms[ "focus" ].value = focus;
			bokehUniforms[ "aspect" ].value = aspect;
			bokehUniforms[ "aperture" ].value = aperture;
			bokehUniforms[ "maxblur" ].value = maxblur;

			this.materialBokeh = new threeInstance.ShaderMaterial( {
				uniforms: bokehUniforms,
				vertexShader: bokehShader.vertexShader,
				fragmentShader: bokehShader.fragmentShader
			} );

			this.uniforms = bokehUniforms;
			this.needsSwap = false;

			this.camera2 = new threeInstance.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
			this.scene2  = new threeInstance.Scene();

			this.quad2 = new threeInstance.Mesh( new threeInstance.PlaneBufferGeometry( 2, 2 ), null );
			this.quad2.frustumCulled = false; // Avoid getting clipped
			this.scene2.add( this.quad2 );

		};

		threeInstance.BokehPass.prototype = Object.assign( Object.create( threeInstance.Pass.prototype ), {

			constructor: threeInstance.BokehPass,

			render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

				this.quad2.material = this.materialBokeh;

				// Render depth into texture

				this.scene.overrideMaterial = this.materialDepth;

				renderer.render( this.scene, this.camera, this.renderTargetDepth, true );

				// Render bokeh composite

				this.uniforms[ "tColor" ].value = readBuffer.texture;

				if ( this.renderToScreen ) {

					renderer.render( this.scene2, this.camera2 );

				} else {

					renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );

				}

				this.scene.overrideMaterial = null;

			}

		} );
		resolve(threeInstance);
	});
}
