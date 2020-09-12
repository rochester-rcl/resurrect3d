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
			const tlDiffuse = (params.tlDiffuse !== undefined) ? params.tlDiffuse : null;
			const trDiffuse = (params.trDiffuse !== undefined) ? params.trDiffuse : null;
			const blDiffuse = (params.blDiffuse !== undefined) ? params.blDiffuse : null;
			const brDiffuse = (params.brDiffuse !== undefined) ? params.brDiffuse : null;

			this.camera = camera;
      		this.scene = scene;

      		this.uniforms["u_enable"].value = u_enable;
			this.uniforms["u_mouse"].value = u_mouse;
			this.uniforms["u_resolution"].value = u_resolution;
			this.uniforms["tlDiffuse"].value = tlDiffuse;
			this.uniforms["trDiffuse"].value = trDiffuse;
			this.uniforms["blDiffuse"].value = blDiffuse;
			this.uniforms["brDiffuse"].value = brDiffuse;
		};

		threeInstance.QuadDiffusePass.prototype = Object.assign(Object.create(threeInstance.ShaderPass.prototype), {
			constructor: threeInstance.QuadDiffusePass,

			render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
		        this.uniforms["tDiffuse"].value = readBuffer.texture;
		        console.log(readBuffer.texture);

	        	this.uniforms["tlDiffuse"] = this.uniforms["tlDiffuse"] ? this.uniforms["tlDiffuse"] : readBuffer.texture;
		        this.uniforms["trDiffuse"] = this.uniforms["trDiffuse"] ? this.uniforms["trDiffuse"] : readBuffer.texture;
		        this.uniforms["blDiffuse"] = this.uniforms["blDiffuse"] ? this.uniforms["blDiffuse"] : readBuffer.texture;
		        this.uniforms["brDiffuse"] = this.uniforms["brDiffuse"] ? this.uniforms["brDiffuse"] : readBuffer.texture;

		        console.log(this.uniforms);

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