precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Нормализованные координаты с учетом соотношения сторон
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    // Красный фон флага
    vec3 color = vec3(0.82, 0.04, 0.09); // Точный красный цвет флага СССР
    
    
    vec2 emblemPos = (uv - vec2(0.25, 0.75)) * vec2(4.0, 3.0);
    
    float hammer = 0.0;

    hammer += step(0.3, abs(emblemPos.x - 0.2)) * step(0.05, abs(emblemPos.y + 0.1));
    hammer -= step(0.4, abs(emblemPos.x - 0.2)) * step(0.1, abs(emblemPos.y + 0.1));
    hammer += step(0.02, abs(emblemPos.x + 0.2)) * step(0.3, abs(emblemPos.y - 0.2));
    hammer -= step(0.04, abs(emblemPos.x + 0.2)) * step(0.4, abs(emblemPos.y - 0.2));
    
    float sickle = 0.0;
    float angle = atan(emblemPos.y, emblemPos.x);
    float radius = length(emblemPos);
    if (angle > 0.5 && angle < 2.5 && radius > 0.2 && radius < 0.4) {
        sickle = 1.0;
    }
    
    float star = 0.0;
    vec2 starPos = emblemPos - vec2(0.6, -0.6);
    star += smoothstep(0.08, 0.07, abs(starPos.x + starPos.y));
    star += smoothstep(0.08, 0.07, abs(starPos.x - starPos.y));
    
    float emblem = max(max(hammer, sickle), star);
    
    if (emblem > 0.5) {
        color = mix(color, vec3(0.99, 0.85, 0.1), emblem);
    }
    
    gl_FragColor = vec4(color, 1.0);
}