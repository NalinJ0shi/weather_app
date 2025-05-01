import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Cloud, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Sun component
function Sun() {
  const sunRef = useRef();
  
  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <mesh ref={sunRef} position={[0, 5, -10]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
      <pointLight color="#FFF" intensity={2} distance={20} />
    </mesh>
  );
}

// Moon component
function Moon() {
  const moonRef = useRef();
  const moonTexture = useTexture('/moon_texture.jpg');
  
  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.002;
    }
  });
  
  return (
    <mesh ref={moonRef} position={[0, 5, -10]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial map={moonTexture} />
    </mesh>
  );
}

// Rain component
function Rain({ count = 200 }) {
  const positions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push(
        Math.random() * 20 - 10,
        Math.random() * 20,
        Math.random() * 20 - 10
      );
    }
    return new Float32Array(positions);
  }, [count]);

  const rainRef = useRef();
  
  useFrame(() => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.2; // Move rain down
        
        // Reset rain drops when they hit the ground
        if (positions[i + 1] < -5) {
          positions[i + 1] = 15;
        }
      }
      
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#aaddff" size={0.1} transparent opacity={0.6} />
    </points>
  );
}

// Snow component
function Snow({ count = 200 }) {
  const positions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push(
        Math.random() * 20 - 10,
        Math.random() * 20,
        Math.random() * 20 - 10
      );
    }
    return new Float32Array(positions);
  }, [count]);

  const snowRef = useRef();
  
  useFrame(() => {
    if (snowRef.current) {
      const positions = snowRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.05; // Move snow down slower than rain
        positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01; // Add wobble effect
        
        // Reset snow flakes when they hit the ground
        if (positions[i + 1] < -5) {
          positions[i + 1] = 15;
          positions[i] = Math.random() * 20 - 10;
          positions[i + 2] = Math.random() * 20 - 10;
        }
      }
      
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={snowRef}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="white" size={0.2} transparent opacity={0.8} />
    </points>
  );
}

// Ground component
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#8eb971" roughness={1} />
    </mesh>
  );
}

// Main WeatherScene component
function WeatherScene({ weather }) {
  if (!weather) return null;
  
  const main = weather.weather[0].main.toLowerCase();
  const temp = weather.main.temp;
  const timeOfDay = getTimeOfDay(weather.dt, weather.sys.sunrise, weather.sys.sunset);
  const windSpeed = weather.wind.speed;
  
  // Determine sky color based on weather and time
  const skyColor = useMemo(() => {
    if (timeOfDay === 'night') return '#001c38';
    if (main === 'clouds') return '#b0c4de';
    if (main === 'rain' || main === 'drizzle') return '#708090';
    if (main === 'thunderstorm') return '#4a5059';
    if (main === 'snow') return '#e6eaef';
    if (main === 'mist' || main === 'fog' || main === 'haze') return '#bebebe';
    return '#87ceeb'; // Clear day
  }, [main, timeOfDay]);
  
  return (
    <div className="w-full h-72 rounded-xl overflow-hidden">
      <Canvas shadows camera={{ position: [0, 2, 10], fov: 60 }}>
        <color attach="background" args={[skyColor]} />
        
        {/* Ambient light */}
        <ambientLight 
          intensity={timeOfDay === 'night' ? 0.3 : 0.7} 
          color={timeOfDay === 'night' ? '#2c3e50' : '#ffffff'} 
        />
        
        {/* Environment lighting */}
        <Environment preset={timeOfDay === 'night' ? 'night' : 'city'} />
        
        {/* Sun or Moon */}
        {timeOfDay === 'night' ? <Moon /> : <Sun />}
        
        {/* Ground */}
        <Ground />
        
        {/* Weather effects */}
        {(main === 'rain' || main === 'drizzle') && <Rain count={300} />}
        {main === 'snow' && <Snow count={200} />}
        
        {/* Clouds based on cloudiness */}
        {weather.clouds && weather.clouds.all > 20 && (
          <>
            <Cloud position={[-4, 2, 0]} speed={0.2} opacity={0.7} />
            <Cloud position={[4, 3, -2]} speed={0.1} opacity={0.5} />
            <Cloud position={[0, 4, -5]} speed={0.3} opacity={0.6} />
          </>
        )}
        
        {/* Stars at night */}
        {timeOfDay === 'night' && <Stars radius={100} depth={50} count={1000} factor={4} />}
        
        {/* Camera controls */}
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} />
      </Canvas>
    </div>
  );
}

// Helper function to determine if it's day or night
function getTimeOfDay(current, sunrise, sunset) {
  if (current < sunrise || current > sunset) {
    return 'night';
  }
  return 'day';
}

export default WeatherScene;