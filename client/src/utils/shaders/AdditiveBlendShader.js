export default function loadAdditiveBlendShader(threeInstance: Object): Promise {
  return new Promise((resolve, reject) => {
    threeInstance.AdditiveBlendShader = {

    	uniforms: {
    		"tDiffuse": { type: "t", value: null },
    		"tDiffuse2": { type: "t", value: null}
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
    	  "uniform sampler2D tDiffuse2;",
    		"varying vec2 vUv;",
    		"void main() {",
          "vec4 pix1 = texture2D(tDiffuse, vUv);",
          "vec4 pix2 = texture2D(tDiffuse2, vUv);",
          "gl_FragColor = pix1 + pix2;",
    		"}"

    	].join( "\n" )

    }
    resolve(threeInstance);
  });
}
