varying vec2 vUv;
uniform vec2 iResolution;
uniform float iTime;

void main()
{
    vec2 uv = vUv;
    uv.x *= iResolution.x/iResolution.y;
    vec3 color = vec3(0.);
    
    for (int i = 0; i < 128; i++) {
        float pha = sin(float(i) * 546.13 + 1.0) * 0.5 + 0.5;
        float siz = pow(sin(float(i) * 651.74 + 5.0) * 0.5 + 0.5, 4.0);
        float pox = sin(float(i) * 321.55 + 4.1) * iResolution.x / iResolution.y;
        float rad = 0.1 + 0.5 * siz + sin(pha + siz) / 4.0;
        vec2 pos = vec2(
            pox + sin(iTime / 15.0 + pha + siz)- 1.0,
            -1.0 - rad + (2.0 + 2.0 * rad) * mod(pha + 0.3 * (iTime / 7.0) * (0.2 + 0.8 * siz), 1.0)
        );
        float dis = length(uv - pos);
        vec3 col = mix(
            vec3(0.194 * sin(iTime / 6.0) + 0.3, 0.2, 0.3 * pha),
            vec3(0.354 * sin(iTime / 9.0) + 0.3, 0.2 * pha, 0.4),
            0.5 + 0.5 * sin(float(i))
        );
        float f = length(uv - pos) / rad;
        f = sqrt(clamp(1.0 + (sin(iTime * siz) * 0.5) * f, 0.0, 1.0));
        color += col.rgb * (1.0 - smoothstep(rad * 0.15, rad, dis));
    }

    vec3 alternateColor = vec3(0.194 * sin(iTime / 6.0) + 0.3, 0.2, 0.3 );
    float blendFactor = smoothstep(.0, 1., length(color));
    color = mix(alternateColor, color, blendFactor);



    gl_FragColor = vec4(color, 1.);
}