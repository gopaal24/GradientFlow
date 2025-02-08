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

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

// Create a geometry and a material, then combine them into a mesh
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube)

// lights
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

//shaderpass code
const GrainShader = {
    uniforms: {
        'tDiffuse': { value: null },  // Input texture
        'iTime': { value: 0 },        // Time for animation
        'grainIntensity': { value: .1 }, // Adjust grain intensity
        'grainSize': { value: 10.8 }   // Adjust grain size
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

// Create and add the grain effect to your composer
const grainPass = new ShaderPass(GrainShader);
composer.addPass(grainPass);


// Create an animation loop
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getDelta()

    shaderMaterial.uniforms.iTime.value += elapsedTime;
    grainPass.uniforms.iTime.value += elapsedTime;

    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Render the scene from the perspective of the camera
    // renderer.render(scene, camera);
    composer.render()
}

// Start the animation loop
animate();