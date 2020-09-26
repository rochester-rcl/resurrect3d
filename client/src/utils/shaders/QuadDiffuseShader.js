/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */
export default function loadQuadDiffuseShader(threeInstance: Object): typeof Promise {
    return new Promise((resolve, reject) => {
        threeInstance.QuadDiffuseShader = {

            uniforms: {
                "u_tlDiffuse": { type: 't', value: null },    // Top-left
                "u_trDiffuse": { type: 't', value: null },    // Top-right
                "u_blDiffuse": { type: 't', value: null },    // Bottom-left
                "u_brDiffuse": { type: 't', value: null },    // Bottom-right
                "u_mouse": { value: new threeInstance.Vector2(0, 0) },
                "u_resolution": { value: new threeInstance.Vector2(0, 0) },
            },

            vertexShader: [

                "varying vec2 vUv;",

                "void main() {",

                    "vUv = uv;",
                    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

                "}"

            ].join( "\n" ),

            fragmentShader: [
                "uniform sampler2D u_tlDiffuse;",
                "uniform sampler2D u_trDiffuse;",
                "uniform sampler2D u_blDiffuse;",
                "uniform sampler2D u_brDiffuse;",
                "uniform vec2 u_mouse;",
                "uniform vec2 u_resolution;",

                "varying vec2 vUv;",

                "void main() {",
                    "vec4 color;",

                    "vec2 uv = gl_FragCoord.xy / u_resolution;",
                    "vec2 offset = uv - u_mouse;",

                    "if (offset.x <= 0.0 && offset.y <= 0.0)",
                        "color = texture2D( u_tlDiffuse, vUv );",
                    "else if (offset.x <= 0.0)",
                        "color = texture2D( u_blDiffuse, vUv );",
                    "else if (offset.x > 0.0 && offset.y <= 0.0)",
                        "color = texture2D( u_trDiffuse, vUv );",
                    "else",
                        "color = texture2D( u_brDiffuse, vUv );",

                    "gl_FragColor = color;",

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