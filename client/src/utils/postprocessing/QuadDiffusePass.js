export default function loadQuadDiffusePass(threeInstance: Object) {
	return new Promise((resolve, reject) => {
		threeInstance.QuadDiffusePass = function (scene, camera, params) 
		{
			if (threeInstance.ShaderPass === undefined)
		        console.error("THREE.QuadDiffusePass depends on THREE.ShaderPass");

		    if ( threeInstance.QuadDiffuseShader === undefined )
		    {
				console.error( "THREE.QuadDiffusePass relies on THREE.QuadDiffuseShader" );
				reject();
		    }

			threeInstance.ShaderPass.call(this, threeInstance.QuadDiffuseShader);

			this.renderToScreen = false;

			const u_enable = (params.u_enable !== undefined) ? params.u_enable : false;
			const u_mouse = (params.u_mouse !== undefined) ? params.u_mouse : new threeInstance.Vector2(0, 0);
			const u_resolution = (params.u_resolution !== undefined) ? params.u_resolution : new threeInstance.Vector2(0, 0);

			this.camera = camera;
      		this.scene = scene;

      		this.uniforms["u_enable"].value = u_enable;
			this.uniforms["u_mouse"].value = u_mouse;
			this.uniforms["u_resolution"].value = u_resolution;
		};

		threeInstance.QuadDiffusePass.prototype = Object.assign(Object.create(threeInstance.ShaderPass.prototype), {
			constructor: threeInstance.QuadDiffusePass,

			render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
		        this.uniforms["tDiffuse"].value = readBuffer.texture;
		        if (this.renderToScreen) {
		          renderer.render(this.scene, this.camera);
		        } else {
		          renderer.render(this.scene, this.camera, writeBuffer, this.clear);
		        }
		    }
		});
		resolve(threeInstance);
	});
}