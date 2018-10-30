/**
 * Bokeh2 Shader Pass
 */

export default function loadGaussianPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.GaussianPass = function (params) {

      if (threeInstance.ShaderPass === undefined) {
        console.error("THREE.GaussianPass depends on THREE.ShaderPass");
      }

      if ( threeInstance.HorizontalBlurShader === undefined || threeInstance.VerticalBlurShader === undefined ) {

				console.error( "THREE.GaussianPass relies on THREE.HorizontalBlurShader and THREE.VerticalBlurShader!" );

			}

			let rtParams = { minFilter: threeInstance.LinearFilter, magFilter: threeInstance.LinearFilter, format: threeInstance.RGBAFormat }
      this.pass1RenderTarget = new threeInstance.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParams);

      threeInstance.ShaderPass.call(this, threeInstance.VerticalBlurShader);

			let h = (params.h !== undefined) ? params.h : 1 / 512.0;
			let v = (params.v !== undefined) ? params.v : 1 / 512.0;
			this.renderToScreen = false;

			this.uniforms["v"].value = v;

			this.horizontalBlurUniforms = threeInstance.UniformsUtils.clone(threeInstance.HorizontalBlurShader.uniforms);
			this.horizontalBlurUniforms["h"].value = h;

			this.horizontalBlurMaterial = new threeInstance.ShaderMaterial({
				uniforms: this.horizontalBlurUniforms,
				vertexShader: threeInstance.HorizontalBlurShader.vertexShader,
				fragmentShader: threeInstance.HorizontalBlurShader.fragmentShader,
			});

			this.verticalBlurMaterial = new threeInstance.ShaderMaterial({
				uniforms: this.uniforms,
				vertexShader: threeInstance.VerticalBlurShader.vertexShader,
				fragmentShader: threeInstance.VerticalBlurShader.fragmentShader,
			});

			this.camera = new threeInstance.OrthographicCamera(-1, 1, 1, -1, 0, 1);
			this.scene  = new threeInstance.Scene();

			this.quad = new threeInstance.Mesh( new threeInstance.PlaneBufferGeometry( 2, 2 ), null );
			this.quad.frustumCulled = false; // Avoid getting clipped
			this.scene.add( this.quad );

		};

		threeInstance.GaussianPass.prototype = Object.assign( Object.create( threeInstance.ShaderPass.prototype ), {

			constructor: threeInstance.GaussianPass,

			render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {
				// Render horizontal pass to texture
				this.horizontalBlurUniforms["tDiffuse"].value = readBuffer.texture;
				this.quad.material = this.horizontalBlurMaterial;
	      renderer.render(this.scene, this.camera, this.pass1RenderTarget, true);
				this.uniforms["tDiffuse"].value = this.pass1RenderTarget.texture;
				this.quad.material = this.verticalBlurMaterial;
        threeInstance.ShaderPass.prototype.render.call(this, renderer, writeBuffer, readBuffer, delta, maskActive);
      }
		});
		resolve(threeInstance);
	});
}
