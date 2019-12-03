/**
 * @author alteredq / http://alteredqualia.com/
 */

export default function loadTexturePass(threeInstance: Object): Promise {
  return new Promise((resolve, reject) => {
    threeInstance.TexturePass = function(map, opacity) {
      threeInstance.Pass.call(this);

      if (threeInstance.CopyShader === undefined)
        console.error("THREE.TexturePass relies on THREE.CopyShader");

      var shader = threeInstance.CopyShader;

      this.map = map;
      this.opacity = opacity !== undefined ? opacity : 1.0;

      this.uniforms = threeInstance.UniformsUtils.clone(shader.uniforms);

      this.material = new threeInstance.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        depthTest: false,
        depthWrite: false
      });

      this.needsSwap = false;

      this.camera = new threeInstance.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.scene = new threeInstance.Scene();

      this.quad = new threeInstance.Mesh(
        new threeInstance.PlaneBufferGeometry(2, 2),
        null
      );
      this.quad.frustumCulled = false; // Avoid getting clipped
      this.scene.add(this.quad);
    };

    threeInstance.TexturePass.prototype = Object.assign(
      Object.create(threeInstance.Pass.prototype),
      {
        constructor: threeInstance.TexturePass,

        render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
          var oldAutoClear = renderer.autoClear;
          renderer.autoClear = false;

          this.quad.material = this.material;

          this.uniforms["opacity"].value = this.opacity;
          this.uniforms["tDiffuse"].value = this.map;
          this.material.transparent = this.opacity < 1.0;

          renderer.render(
            this.scene,
            this.camera,
            this.renderToScreen ? null : readBuffer,
            this.clear
          );

          renderer.autoClear = oldAutoClear;
        }
      }
    );
    resolve(threeInstance);
  });
}
