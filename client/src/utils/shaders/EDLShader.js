//
// Algorithm by Christian Boucheny
// shader code taken and adapted from CloudCompare
// Material code adapted from Potree - https://github.com/potree/
// see
// https://github.com/cloudcompare/trunk/tree/master/plugins/qEDL/shaders/EDL
// http://www.kitware.com/source/home/post/9
// https://tel.archives-ouvertes.fr/tel-00438464/document p. 115+ (french)

export default function loadEDLShader(threeInstance: Object): Promise {
  const neighbourCount = 4;
  const neighbours = new Float32Array(neighbourCount * 2);
  for (let i=0; i < neighbourCount; i++) {
    neighbours[2 * i + 0] = Math.cos(2 * i * Math.PI / neighbourCount);
    neighbours[2 * i + 1] = Math.sin(2 * i * Math.PI / neighbourCount);
  }
  return new Promise((resolve, reject) => {
    threeInstance.EDLShader = {
      uniforms: {

        "screenWidth": { type: 'f', 	value: 0 },

		    "screenHeight": { type: 'f', 	value: 0 },

		    "edlStrength": { type: 'f', 	value: 1.0 },

		    "radius": { type: 'f', 	value: 1.0 },

	      "neighbours":	{ type: '2fv', 	value: neighbours },

		    "tDepth": { type: 't', 	value: null },

		    "tDiffuse": { type: 't', 	value: null },

        "cameraNear": { type: 'f', value: null },

        "cameraFar": { type: 'f', value: null },

		    "opacity":	{ type: 'f',	value: 1.0 },

        "onlyEDL": { value: 0 },

        "onlyEDLColor": { type: 'c', value: new threeInstance.Color(0xffffff) },

        "enableEDL": { value: 0 },

        "useTexture": { value: 0 },

      },

      vertexShader: [

				"varying vec2 vUv;",

				"void main() {",

					"vUv = uv;",

					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"}"

			].join( "\n" ),

      fragmentShader: [

        "#define NEIGHBOUR_COUNT " + neighbourCount,

        "#include <packing>",

        "uniform float screenWidth;",

        "uniform float screenHeight;",

        "uniform float cameraNear;",

        "uniform float cameraFar;",

        "uniform vec2 neighbours[NEIGHBOUR_COUNT];",

        "uniform float edlStrength;",

        "uniform float radius;",

        "uniform float opacity;",

        "uniform sampler2D tDiffuse;",

        "uniform sampler2D tDepth;",

        "uniform sampler2D tNormal;",

        "varying vec2 vUv;",

        "uniform vec3 onlyEDLColor;",

        "uniform bool useNormalMap;",

        "uniform bool enableEDL;",

        "uniform bool onlyEDL;",

        "uniform bool useTexture;",

        "float readDepth( const in vec2 coord ) {",

    			"float cameraFarPlusNear = cameraFar + cameraNear;",
    			"float cameraFarMinusNear = cameraFar - cameraNear;",
    			"float cameraCoef = 2.0 * cameraNear;",

    			"float z = unpackRGBAToDepth( texture2D( tDepth, coord ) );",

    			"return cameraCoef / ( cameraFarPlusNear - z * cameraFarMinusNear );",


    		"}",

        "float depthFromGray(const in vec2 coord) {",

          "return 1.0 - texture2D(tDiffuse, coord).g;",

        "}",

        "float grayResponse(float gray) {",

          "vec2 uvRadius = radius / vec2(screenWidth, screenHeight);",

          "float sum = 0.0;",

          "for(int i = 0; i < NEIGHBOUR_COUNT; i++){",

              "vec2 uvNeighbor = vUv + uvRadius * neighbours[i];",

              "float neighbourGray = depthFromGray(uvNeighbor);",

              "if(neighbourGray != 0.0){",

                  "if(gray == 0.0){",

                    "sum += 10.0;",

                    "} else {",

                    "sum += max(0.0, gray - neighbourGray);",
                  "}",

              "}",
          "}",

        "return sum / float(NEIGHBOUR_COUNT);",

       "}",

        "float response(float depth){",

	         "vec2 uvRadius = radius / vec2(screenWidth, screenHeight);",

	         "float sum = 0.0;",

	         "for(int i = 0; i < NEIGHBOUR_COUNT; i++){",

		           "vec2 uvNeighbor = vUv + uvRadius * neighbours[i];",

		           "float neighbourDepth = readDepth(uvNeighbor);",

		           "if(neighbourDepth != 0.0){",

			            "if(depth == 0.0){",

				             "sum += 10.0;",

			              "} else {",

				             "sum += max(0.0, depth - neighbourDepth);",
			         "}",

		       "}",
	       "}",

	        "return sum / float(NEIGHBOUR_COUNT);",

        "}",

        "void main(){",

	         "vec4 color = texture2D(tDiffuse, vUv);",

           "if (enableEDL) {",

  	         "float depth = readDepth(vUv);",

  	         "float res = response(depth);",

             "if (useTexture) {",

                "float gray = depthFromGray(vUv);",

                "res += grayResponse(gray);",

             "}",

  	         "float shade = exp(-res * 300.0 * edlStrength);",

  	         "if(depth == 0.0 && res == 0.0){",

  		           "discard;",

  	         "} else {",

                "if (onlyEDL) {",

                  "gl_FragColor = vec4(onlyEDLColor * shade, opacity);",

                "} else {",

  		            "gl_FragColor = vec4(color.rgb * shade, opacity);",

                "}",

            "}",

  	       "} else {",

              "gl_FragColor = color;",

          "}",
       "}"
     ].join('\n'),
    }
    resolve(threeInstance);
  });
}
