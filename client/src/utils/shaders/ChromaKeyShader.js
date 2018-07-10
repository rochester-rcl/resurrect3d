export default function loadChromaKeyShader(threeInstance: Object): Promise {
  return new Promise((resolve, reject) => {
    threeInstance.ChromaKeyShader = {
      uniforms: {
        tDiffuse: { value: null },
        chroma: { type: 'c', value: null },
        threshold: { type: 'f', value: 0.5 },
        invert: { type: 'b', value: false },
        enable: { type: 'b', value: false },
      },

      vertexShader: [
				"varying vec2 vUv;",
				"void main() {",
					"vUv = uv;",
					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"}"

			].join( "\n" ),

      fragmentShader: [
				"uniform sampler2D tDiffuse;",
				"uniform vec3 chroma;",
        "uniform float threshold;",
        "uniform bool invert;",
        "uniform bool enable;",
				"varying vec2 vUv;",
				"void main() {",
					// inital setup
					"vec3 color = texture2D(tDiffuse, vUv).rgb;",
          "float subLength = invert ? -length(color-chroma) : length(color-chroma);",
          "float alpha = enable ? (subLength - threshold) * 6.0 : 1.0;",
          "gl_FragColor = vec4(color, alpha);",
				"}"
			].join( "\n" ),

    }
    resolve(threeInstance);
  });
}
