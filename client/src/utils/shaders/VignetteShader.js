// constants
import { SIMPLEX_2D } from '../../constants/application';

// noise function
import { loadNoiseFunc } from '../noise';

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
        loadNoiseFunc(SIMPLEX_2D),
    		"void main() {",
          "vec2 uv = (gl_FragCoord.xy / resolution.xy);",
          "vec2 pos =  uv * (1.0 - uv.yx);",
          'float noise = snoise(512.0 * uv);',
          "float vignette = pos.x * pos.y * 15.0;",
          "vignette = pow(vignette, strength);",
          "vec4 vignetteColor = vec4(color * (1.0 - vignette), (1.0-vignette));",
    			"vec4 tColor = texture2D(tDiffuse, vUv);",
    			"vignetteColor = mix(tColor, vignetteColor, (1.0-vignette));",
          "gl_FragColor = vec4(mix(vignetteColor.rgb, vec3(noise), 0.0175), 1.0);",

    		"}"

    	].join( "\n" )

    }
    resolve(threeInstance);
  });
}
