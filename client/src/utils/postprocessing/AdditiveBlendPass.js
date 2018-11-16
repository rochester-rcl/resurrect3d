export default function loadAdditiveBlendPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.AdditiveBlendPass = function (tex) {

      threeInstance.Pass.call(this);
      if (threeInstance.AdditiveBlendShader === undefined) {
        let msg = "THREE AdditiveBlendPass relies on THREE.AdditiveBlendShader";
        console.err(msg);
        reject(msg);
      }

      this.uniforms = threeInstance.UniformsUtils.clone(threeInstance.AdditiveBlendShader.uniforms);
      this.renderToScreen = false;
      this.uniforms["tDiffuse2"].value = tex;

      const additiveBlendMaterial = new threeInstance.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: threeInstance.AdditiveBlendShader.vertexShader,
        fragmentShader: threeInstance.AdditiveBlendShader.fragmentShader,
        transparent: true,
      });

      this.camera = new threeInstance.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.scene = new threeInstance.Scene();
			// default is black
			this.scene.background = new threeInstance.Color(0x000000);
      this.quad = new threeInstance.Mesh(new threeInstance.PlaneBufferGeometry(2, 2), null);
      this.quad.material = additiveBlendMaterial;
      this.quad.frustumCulled = false;
      this.scene.add(this.quad);
    };

    threeInstance.AdditiveBlendPass.prototype = Object.assign(Object.create(threeInstance.Pass.prototype), {
      constructor: threeInstance.AdditiveBlendPass,

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
