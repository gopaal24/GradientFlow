import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

async function loadShader(url){
    const response = await fetch(url);
    return await response.text();
}

const vertexShader = await loadShader("./shader/vertex.glsl")
const fragmentShader = await loadShader("./shader/fragment.glsl")

const clock = new THREE.Clock();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

const ambient = new THREE.AmbientLight();
scene.add(ambient)

const dir = new THREE.DirectionalLight();
scene.add(dir)

const shaderMaterial = new THREE.ShaderMaterial({
    uniforms:{
        iResolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
        iTime: {value: 0}
    },
    vertexShader,
    fragmentShader
})

const plane = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth/20, window.innerHeight/20), shaderMaterial);
plane.position.z = -10
scene.add(plane)

const GrainShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'iTime': { value: 0 },
        'grainIntensity': { value: 0.06 },
        'grainSize': { value: 1.8 }
    },

    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float iTime;
        uniform float grainIntensity;
        uniform float grainSize;
        varying vec2 vUv;

        // Random function
        float random(vec2 p) {
            vec2 k1 = vec2(
                23.14069263277926,
                2.665144142690225
            );
            return fract(
                cos(dot(p, k1)) * 12345.6789
            );
        }

        void main() {
            // Get the original color
            vec4 originalColor = texture2D(tDiffuse, vUv);
            
            // Create noise
            vec2 uvNoise = vUv;
            uvNoise *= grainSize; // Scale UV for grain size
            uvNoise += iTime;     // Animate noise
            
            float noise = random(uvNoise) * grainIntensity;
            
            // Mix noise with original color
            vec3 grainColor = originalColor.rgb + vec3(noise);
            
            gl_FragColor = vec4(grainColor, originalColor.a);
        }
    `
};

const grainPass = new ShaderPass(GrainShader);
composer.addPass(grainPass);


function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getDelta()

    shaderMaterial.uniforms.iTime.value += elapsedTime;
    grainPass.uniforms.iTime.value += elapsedTime;

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    composer.render()
}

animate();