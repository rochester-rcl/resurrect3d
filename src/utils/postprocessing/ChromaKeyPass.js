export default function loadChromaKeyPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.ChromaKeyPass = function (enable: boolean, chroma: threeInstance.Color, threshold: Number, invert: boolean) {

      threeInstance.Pass.call(this);
      if (threeInstance.ChromaKeyShader === undefined) {
        let msg = "THREE ChromaKeyPass relies on THREE.ChromaKeyShader";
        console.err(msg);
        reject(msg);
      }

      this.uniforms = threeInstance.UniformsUtils.clone(threeInstance.ChromaKeyShader.uniforms);
      this.renderToScreen = false;
      this.uniforms["enable"].value = (enable === true || enable === false) ? enable : false;
      this.uniforms["chroma"].value = chroma ? chroma : new threeInstance.Color(0);
      this.uniforms["threshold"].value = threshold ? threshold : 0.5;
      this.uniforms["invert"].value = (invert === true || invert === false) ? invert : false;

      let chromaKeyMaterial = new threeInstance.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: threeInstance.ChromaKeyShader.vertexShader,
        fragmentShader: threeInstance.ChromaKeyShader.fragmentShader,
        transparent: true,
      });

      this.camera = new threeInstance.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.scene = new threeInstance.Scene();
			// default is black
			this.scene.background = new threeInstance.Color(0x000000);
      this.quad = new threeInstance.Mesh(new threeInstance.PlaneBufferGeometry(2, 2), null);
      this.quad.material = chromaKeyMaterial;
      this.quad.frustumCulled = false;
      this.scene.add(this.quad);
    };

    threeInstance.ChromaKeyPass.prototype = Object.assign(Object.create(threeInstance.Pass.prototype), {
      constructor: threeInstance.ChromaKeyPass,

      render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        this.uniforms["tDiffuse"].value = readBuffer.texture;
        if (this.renderToScreen) {
          renderer.render(this.scene, this.camera);
        } else {
          renderer.render(this.scene, this.camera, writeBuffer, this.clear);
        }
      },

			setReplacementColor: function(threeColor) {
				// this.scene.background = threeColor;
			}
    });
    resolve(threeInstance);
  });
}
