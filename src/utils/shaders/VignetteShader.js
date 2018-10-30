export default function loadVignetteShader(threeInstance: Object): Promise {
  return new Promise((resolve, reject) => {
    threeInstance.VignetteShader = {

    	uniforms: {
    		"tDiffuse": { value: null },
    		"strength": { type: 'f', value: 0.5 },
        "resolution": { value: new threeInstance.Vector2()},
        "color": { type: '3vf', value: new threeInstance.Vector3(0.5) },
    	},

    	vertexShader: [

    		"varying vec2 vUv;",

    		"void main() {",

    			"vUv = uv;",
    			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    		"}"

    	].join( "\n" ),

    	fragmentShader: [

        // adapted from
        // simple vignette effect https://www.shadertoy.com/view/lsKSWR

    		"uniform sampler2D tDiffuse;",
    		"uniform float strength;",
        "uniform vec3 color;",
        "uniform vec2 resolution;",
    		"varying vec2 vUv;",

    		"void main() {",

          "vec2 pos = (gl_FragCoord.xy / resolution.xy);",
          "pos *= 1.0 - pos.yx;",
          "float vignette = pos.x * pos.y * 15.0;",
          "vignette = pow(vignette, strength);",
          "vec4 vignetteColor = vec4(color * (1.0 - vignette), (1.0-vignette));",
    			"vec4 tColor = texture2D(tDiffuse, vUv);",

    			"gl_FragColor = mix(tColor, vignetteColor, (1.0-vignette));",

    		"}"

    	].join( "\n" )

    }
    resolve(threeInstance);
  });
}
