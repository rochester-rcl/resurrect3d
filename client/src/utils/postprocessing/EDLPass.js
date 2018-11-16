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

      const radius = (params.radius !== undefined) ? params.radius : 1.0;
			const edlStrength = (params.edlStrength !== undefined) ? params.edlStrength : 1.0;
      const opacity = (params.opacity !== undefined) ? params.opacity : 1.0;
      const screenWidth = params.screenWidth || window.innerWidth || 1;
			const screenHeight = params.screenHeight || window.innerHeight || 1;
			const enableEDL = (params.enableEDL !== undefined) ? params.enableEDL : false;
			const onlyEDL = (params.onlyEDL !== undefined) ? params.onlyEDL : false;
			const onlyEDLColor = (params.onlyEDLColor !== undefined) ? params.onlyEDLColor : new threeInstance.Color(0xffffff);
			const useTexture = (params.useTexture !== undefined) ? params.useTexture : false;
      this.camera2 = camera;
      this.scene2 = scene;

      this.depthMaterial = new threeInstance.MeshDepthMaterial();
      this.depthMaterial.depthPacking = threeInstance.RGBADepthPacking;


      let rtParams = { minFilter: threeInstance.LinearFilter, magFilter: threeInstance.LinearFilter, format: threeInstance.RGBAFormat }
      this.depthRenderTarget = new threeInstance.WebGLRenderTarget(screenWidth, screenHeight, rtParams);

			this.uniforms["tDepth"].value = this.depthRenderTarget.texture;
			this.uniforms["radius"].value = radius;
			this.uniforms["edlStrength"].value = edlStrength;
			this.uniforms["opacity"].value = opacity;
      this.uniforms["screenWidth"].value = screenWidth;
      this.uniforms["screenHeight"].value = screenHeight;
			this.uniforms["cameraNear"].value = this.camera2.near;
			this.uniforms["cameraFar"].value = this.camera2.far;
			this.uniforms["onlyEDL"].value = onlyEDL;
			this.uniforms["enableEDL"].value = enableEDL;
			this.uniforms["useTexture"].value = useTexture;
			this.uniforms["onlyEDLColor"].value = onlyEDLColor;

		};

		threeInstance.EDLPass.prototype = Object.assign( Object.create( threeInstance.ShaderPass.prototype ), {

			constructor: threeInstance.EDLPass,

			render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

				// Render depth into texture
				this.scene2.overrideMaterial = this.depthMaterial;
	      renderer.render(this.scene2, this.camera2, this.depthRenderTarget, true);
	      this.scene2.overrideMaterial = null;
				threeInstance.ShaderPass.prototype.render.call(this, renderer, writeBuffer, readBuffer, delta, maskActive);

      },
		});
		resolve(threeInstance);
	});
}
