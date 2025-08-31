import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styled from 'styled-components';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

const BackgroundAnimation = React.forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const particlesRef = useRef([]);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create medical-themed particles
    createMedicalParticles(scene);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      updateParticles();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (renderer && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, []);

  // Create medical-themed particles
  const createMedicalParticles = (scene) => {
    const particles = [];
    
    // DNA helix particles
    for (let i = 0; i < 100; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6, 0.8, 0.6),
        transparent: true,
        opacity: 0.6
      });
      
      const particle = new THREE.Mesh(geometry, material);
      
      // Position in DNA helix pattern
      const t = i * 0.1;
      particle.position.x = Math.cos(t) * 2;
      particle.position.y = Math.sin(t) * 2;
      particle.position.z = t * 0.5 - 10;
      
      // Store original position for animation
      particle.userData = {
        originalX: particle.position.x,
        originalY: particle.position.y,
        originalZ: particle.position.z,
        speed: Math.random() * 0.02 + 0.01,
        amplitude: Math.random() * 0.5 + 0.5
      };
      
      particles.push(particle);
      scene.add(particle);
    }
    
    // Floating medical symbols
    const medicalSymbols = ['🏥', '💊', '🩺', '🩹', '🧬', '🔬'];
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.PlaneGeometry(0.3, 0.3);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.1, 0.7, 0.7),
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      
      const symbol = new THREE.Mesh(geometry, material);
      
      symbol.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      
      symbol.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatAmplitude: Math.random() * 0.5 + 0.5
      };
      
      particles.push(symbol);
      scene.add(symbol);
    }
    
    // Pulse waves (representing heartbeats)
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.RingGeometry(0.5, 1, 32);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0, 0.8, 0.6),
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      
      const pulse = new THREE.Mesh(geometry, material);
      
      pulse.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5
      );
      
      pulse.userData = {
        scale: 1,
        scaleSpeed: Math.random() * 0.02 + 0.01,
        maxScale: Math.random() * 3 + 2
      };
      
      particles.push(pulse);
      scene.add(pulse);
    }
    
    particlesRef.current = particles;
  };

  // Update particle animations
  const updateParticles = () => {
    const time = Date.now() * 0.001;
    
    particlesRef.current.forEach((particle, index) => {
      if (particle.userData.originalX !== undefined) {
        // DNA helix particles
        const t = time * particle.userData.speed + index * 0.1;
        particle.position.x = particle.userData.originalX + Math.sin(t * 2) * particle.userData.amplitude * 0.1;
        particle.position.y = particle.userData.originalY + Math.cos(t * 2) * particle.userData.amplitude * 0.1;
        particle.position.z = particle.userData.originalZ + t * 0.5;
        
        // Reset position when it goes too far
        if (particle.position.z > 10) {
          particle.position.z = -10;
        }
        
        // Fade opacity based on position
        const opacity = Math.max(0, 1 - (particle.position.z + 10) / 20);
        particle.material.opacity = opacity * 0.6;
      } else if (particle.userData.rotationSpeed !== undefined) {
        // Medical symbols
        particle.rotation.z += particle.userData.rotationSpeed;
        particle.position.y += Math.sin(time * particle.userData.floatSpeed) * particle.userData.floatAmplitude * 0.01;
        particle.position.x += Math.cos(time * particle.userData.floatSpeed * 0.7) * particle.userData.floatAmplitude * 0.005;
      } else if (particle.userData.scale !== undefined) {
        // Pulse waves
        particle.userData.scale += particle.userData.scaleSpeed;
        if (particle.userData.scale > particle.userData.maxScale) {
          particle.userData.scale = 1;
        }
        
        particle.scale.setScalar(particle.userData.scale);
        particle.material.opacity = Math.max(0, 0.2 * (1 - particle.userData.scale / particle.userData.maxScale));
      }
    });
  };

  return (
    <BackgroundContainer ref={containerRef} {...props} />
  );
});

BackgroundAnimation.displayName = 'BackgroundAnimation';

export default BackgroundAnimation;
