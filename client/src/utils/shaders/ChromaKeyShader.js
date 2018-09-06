export default function loadChromaKeyShader(threeInstance: Object): Promise {
  return new Promise((resolve, reject) => {
    threeInstance.ChromaKeyShader = {
      uniforms: {
        tDiffuse: { value: null },
        chroma: { type: 'c', value: null },
        threshold: { type: 'f', value: 0.5 },
        invert: { type: 'b', value: false },
        enable: { type: 'b', value: false },
        replacementColor: { type: 'c', value: new threeInstance.Color(0x000000)}
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
        "uniform vec3 replacementColor;",
				"varying vec2 vUv;",
				"void main() {",
					// inital setup
					"vec3 color = texture2D(tDiffuse, vUv).rgb;",
          "float subLength = invert ? -length(color-chroma) : length(color-chroma);",
          "float alpha = (subLength - threshold) * 20.0;",
          "subLength = enable ? subLength : 1.0;",
          "gl_FragColor = subLength < threshold ? vec4(-mix(color, replacementColor, alpha), 1.0) : vec4(color, 1.0);",
				"}"
			].join( "\n" ),

    }
    resolve(threeInstance);
  });
}
