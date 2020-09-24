/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */
export default function loadQuadDiffuseShader(threeInstance: Object): typeof Promise {
    return new Promise((resolve, reject) => {
        threeInstance.QuadDiffuseShader = {

            uniforms: {

                "tDiffuse": { value: null },
                "u_tlDiffuse": { type: 't', value: null },    // Top-left
                "u_trDiffuse": { type: 't', value: null },    // Top-right
                "u_blDiffuse": { type: 't', value: null },    // Bottom-left
                "u_brDiffuse": { type: 't', value: null },    // Bottom-right
                "u_uvArray": { type: 'fv', value: [] },
                "u_enable": { type: 'b', value: false },
                "u_mouse": { value: new threeInstance.Vector2(0, 0) },
                "u_resolution": { value: new threeInstance.Vector2(0, 0) },

            },

            vertexShader: [

                "uniform float u_uvArray[172950];",
                "varying vec2 vUv;",

                "void main() {",

                    //"vUv = uv;",
                    "vUv = vec2(u_uvArray[gl_VertexID * 2], u_uvArray[gl_VertexID * 2 + 1]);",
                    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

                "}"

            ].join( "\n" ),

            fragmentShader: [
                "uniform sampler2D tDiffuse;",
                "uniform sampler2D u_tlDiffuse;",
                "uniform sampler2D u_trDiffuse;",
                "uniform sampler2D u_blDiffuse;",
                "uniform sampler2D u_brDiffuse;",
                "uniform bool u_enable;",
                "uniform vec2 u_mouse;",
                "uniform vec2 u_resolution;",

                "varying vec2 vUv;",

                "void main() {",
                    "vec4 texel = texture2D( tDiffuse, vUv );",
                    "vec4 color;",

                    "if (u_enable)",
                    "{",
                        //"vec2 pos = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y) - 0.5;",
                        "vec2 offset = vec2(vUv.x, 1.0 - vUv.y) - u_mouse;",
                        // "vec3 tone;",

                        "if (offset.x <= 0.0 && offset.y <= 0.0)",
                            // "tone = vec3(1.0, 0.5, 0.5);",
                            "color = texture2D( tlDiffuse, vUv );",
                        "else if (offset.x <= 0.0)",
                            // "tone = vec3(0.5, 1.0, 0.5);",
                            "color = texture2D( blDiffuse, vUv );",
                        "else if (offset.x > 0.0 && offset.y <= 0.0)",
                            // "tone = vec3(0.5, 0.5, 1.0);",
                            "color = texture2D( trDiffuse, vUv );",
                        "else",
                            // "tone = vec3(1.0, 1.0, 0.5);",
                            "color = texture2D( brDiffuse, vUv );",

                        // "color = vec4(tone, 1.0) * texel;",
                    "}",
                    "else",
                        "color = texel;",

                    "gl_FragColor = color;",
                    // "gl_FragColor = texture2D( blDiffuse, vUv);",

                "}"

            ].join( "\n" )

        };
        resolve(threeInstance);
    });
}


/*export default function loadQuadDiffuseShader(threeInstance: Object): Promise {
    return new Promise((resolve, reject) => {
        threeInstance.QuadDiffuseShader = {
            uniforms: {
                tDiffuse: { value: null },
                tDiffuse2: { value: null },
                tDiffuse3: { value: null },
                tDiffuse4: { value: null },
                u_enable: { type: 'b', value: false },
                u_mouse: { value: null },
                u_resolution: { value: null }
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
                "uniform sampler2D tDiffuse3;",
                "uniform sampler2D tDiffuse4;",
                "uniform bool u_enable;",
                "uniform vec2 u_mouse;",
                "uniform vec2 u_resolution;",

                "varying vec2 vUv;",

                "void main()",
                "{",
                    "vec2 offset = gl_FragCoord.xy - u_mouse.xy;",
                    "vec3 color = texture2D(tDiffuse, vUv).rgb;",

                    "if (u_enable)",
                    "{",
                        "if (offset.x <= 0.0 && offset.y <= 0.0)",
                            //"tDiffuse = tDiffuse1;",
                            "color = vec3(1.0, 0.0, 0.0);",
                        "else if (offset.x <= 0.0)",
                            //"tDiffuse = tDiffuse2;",
                            "color = vec3(0.0, 1.0, 0.0);",
                        "else if (offset.x > 0.0 && offset.y <= 0.0)",
                            //"tDiffuse = tDiffuse3;",
                            "color = vec3(0.0, 0.0, 1.0);",
                        "else",
                            //"tDiffuse = tDiffuse4;",
                            "color = vec3(1.0, 1.0, 1.0);",

                        "gl_FragColor = vec4(color, 1.0);",
                    "}",
                    "else",
                        "gl_FragColor = vec4(color, 1.0);",
                "}"
            ].join("\n")
        }
        resolve(threeInstance);
    });
}*/