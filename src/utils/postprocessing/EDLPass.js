/**
 * EDL Shader Pass
 */

export default function loadEDLPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.EDLPass = function (scene, camera, params) {

      if (threeInstance.ShaderPass === undefined) {
        console.error("THREE.EDLPass depends on THREE.ShaderPass");
      }

      if ( threeInstance.EDLShader === undefined ) {

				console.error( "THREE.EDLPass relies on THREE.EDLShader" );

			}

      threeInstance.ShaderPass.call(this, threeInstance.EDLShader);

			this.renderToScreen = false;

      let radius = (params.radius !== undefined) ? params.radius : 1.0;
			let edlStrength = (params.edlStrength !== undefined) ? params.edlStrength : 1.0;
      let opacity = (params.opacity !== undefined) ? params.opacity : 1.0;
      let screenWidth = params.screenWidth || window.innerWidth || 1;
			let screenHeight = params.screenHeight || window.innerHeight || 1;
			this.enableEDL = (params.enableEDL !== undefined) ? params.enableEDL : true;

      this.camera2 = camera;
      this.scene2 = scene;

      this.depthMaterial = new threeInstance.MeshDepthMaterial();
      this.depthMaterial.depthPacking = threeInstance.RGBADepthPacking;
      this.depthMaterial.blending = threeInstance.NoBlending;

      let rtParams = { minFilter: threeInstance.NearestFilter, magFilter: threeInstance.NearestFilter, format: threeInstance.RGBAFormat }
      this.depthRenderTarget = new threeInstance.WebGLRenderTarget(screenWidth, screenHeight, rtParams);

			this.uniforms["tDepth"].value = this.depthRenderTarget.texture;
			this.uniforms["radius"].value = radius;
			this.uniforms["edlStrength"].value = edlStrength;
			this.uniforms["opacity"].value = opacity;
      this.uniforms["screenWidth"].value = screenWidth;
      this.uniforms["screenHeight"].value = screenHeight;
			this.uniforms["cameraNear"].value = this.camera2.near;
			this.uniforms["cameraFar"].value = this.camera2.far;

		};

		threeInstance.EDLPass.prototype = Object.assign( Object.create( threeInstance.ShaderPass.prototype ), {

			constructor: threeInstance.EDLPass,

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
