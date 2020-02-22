export default function loadQuadDiffuseShader(threeInstance: Object): Promise {
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
}