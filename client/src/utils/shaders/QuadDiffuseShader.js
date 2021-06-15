/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */
export default function loadQuadDiffuseShader(threeInstance: Object): typeof Promise {
    return new Promise((resolve, reject) => {
        threeInstance.QuadDiffuseShader = {

            uniforms: {
                "u_viewCount": { value: 0 },
                "u_diffuse1": { type: 't', value: null },    // Top-left
                "u_diffuse2": { type: 't', value: null },    // Top-right
                "u_diffuse3": { type: 't', value: null },    // Bottom-left
                "u_diffuse4": { type: 't', value: null },    // Bottom-right
                "u_angle": { value: 0.0 },
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
                "uniform int u_viewCount;",
                "uniform sampler2D u_diffuse1;",
                "uniform sampler2D u_diffuse2;",
                "uniform sampler2D u_diffuse3;",
                "uniform sampler2D u_diffuse4;",
                "uniform float u_angle;",
                "uniform vec2 u_mouse;",    // u_mouse has top-left as (0, 0), bottom-right as (1, 1)
                "uniform vec2 u_resolution;",

                "varying vec2 vUv;",

                "void main() {",
                    "vec4 color;",

                    "if (u_viewCount > 1) {",
                        "float section_angle = 360.0 / float(u_viewCount);",

                        "vec2 uv = gl_FragCoord.xy / u_resolution;",
                        "vec2 offset = vec2(uv.x, 1.0-uv.y) - u_mouse;",

                        "float frag_angle = degrees(atan(-offset.x, offset.y)) + 180.0;",
                        "int section = int(mod(float(u_viewCount) + floor((frag_angle - u_angle) / section_angle), float(u_viewCount)));",
                        // "int section = int(mod(u_viewCount + int(floor((frag_angle - u_angle) / section_angle)), u_viewCount));",

                        "if (section == 0)",
                            "color = texture2D( u_diffuse1, vUv );",
                        "else if (section == 1)",
                            "color = texture2D( u_diffuse2, vUv );",
                        "else if (section == 2)",
                            "color = texture2D( u_diffuse3, vUv );",
                        "else if (section == 3)",
                            "color = texture2D( u_diffuse4, vUv );",
                    "} else {",
                        "color = texture2D( u_diffuse1, vUv );",
                    "}",

                        


                    /* "vec2 uv = gl_FragCoord.xy / u_resolution;",
                    "vec2 offset = vec2(uv.x, 1.0-uv.y) - u_mouse;",

                    "if (offset.x <= 0.0 && offset.y <= 0.0)",
                        "color = texture2D( u_tlDiffuse, vUv );",
                    "else if (offset.x <= 0.0)",
                        "color = texture2D( u_blDiffuse, vUv );",
                    "else if (offset.x > 0.0 && offset.y <= 0.0)",
                        "color = texture2D( u_trDiffuse, vUv );",
                    "else",
                        "color = texture2D( u_brDiffuse, vUv );", */

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