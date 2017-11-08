/**
 * EDL Shader Pass
 */

export default function loadBokeh2Pass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.Bokeh2Pass = function (scene, camera, params) {

      if (threeInstance.ShaderPass === undefined) {
        console.error("THREE.EDLPass depends on THREE.ShaderPass");
      }

      if ( threeInstance.Bokeh2Shader === undefined ) {

				console.error( "THREE.Bokeh2Pass relies on THREE.Bokeh2Shader" );

			}

      threeInstance.ShaderPass.call(this, threeInstance.Bokeh2Shader);

			this.renderToScreen = false;

      let textureWidth = params.textureWidth || window.innerWidth || 1;
			let textureHeight = params.textureHeight || window.innerHeight || 1;

      let focalDepth = (params.focalDepth !== undefined) ? params.focalDepth : 1.0;
			let focalLength = (params.focalLength !== undefined) ? params.focalLength : 24.0;
      let fstop = (params.fstop !== undefined) ? params.fstop : 0.9;
      let maxBlur = (params.maxBlur !== undefined) ? params.maxBlur : 1.0;

      this.camera2 = camera;
      this.scene2 = scene;

      this.depthMaterial = new threeInstance.MeshDepthMaterial();
      this.depthMaterial.depthPacking = threeInstance.RGBADepthPacking;
      this.depthMaterial.blending = threeInstance.NoBlending;

      let rtParams = { minFilter: threeInstance.NearestFilter, magFilter: threeInstance.NearestFilter, format: threeInstance.RGBAFormat }
      this.depthRenderTarget = new threeInstance.WebGLRenderTarget(textureWidth, textureHeight, rtParams);

			this.uniforms["tDepth"].value = this.depthRenderTarget.texture;
			this.uniforms["textureHeight"].value = textureHeight;
      this.uniforms["textureWidth"].value = textureWidth;
      this.uniforms["focalDepth"].value = focalDepth;
      this.uniforms["focalLength"].value = focalLength;
      this.uniforms["fstop"].value = fstop;
      this.uniforms["maxblur"].value = maxBlur;

      this.material.defines = {
        RINGS: 3,
        SAMPLES: 4,
      }

		};

		threeInstance.Bokeh2Pass.prototype = Object.assign( Object.create( threeInstance.ShaderPass.prototype ), {

			constructor: threeInstance.Bokeh2Pass,

			render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

				// Render depth into texture

				if (this.enableEDL) {
					this.scene2.overrideMaterial = this.depthMaterial;
	        renderer.render(this.scene2, this.camera2, this.depthRenderTarget, true);
	        this.scene2.overrideMaterial = null;
				}

        threeInstance.ShaderPass.prototype.render.call(this, renderer, writeBuffer, readBuffer, delta, maskActive);
      }
		});
		resolve(threeInstance);
	});
}
