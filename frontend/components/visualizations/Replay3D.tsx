'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

interface Replay3DProps {
  ballData?: {
    trajectory?: Array<{ x: number; y: number; z: number }>;
    speed?: number;
    shotAngle?: number;
    shotDistance?: number;
    runs?: number;
    isWicket?: boolean;
  };
}

function Ball({ trajectory }: { trajectory: THREE.Vector3[] }) {
  const ballRef = useRef<THREE.Mesh>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(true);

  useFrame(() => {
    if (!ballRef.current || !trajectory.length || !animating) return;

    if (currentIndex < trajectory.length - 1) {
      setCurrentIndex(i => i + 1);
      ballRef.current.position.copy(trajectory[currentIndex]);
    } else {
      // Pause at end
      setTimeout(() => {
        setCurrentIndex(0);
        setAnimating(true);
      }, 1000);
      setAnimating(false);
    }
  });

  return (
    <Sphere ref={ballRef} args={[0.07, 32, 32]} position={trajectory[0]}>
      <meshStandardMaterial color="red" />
    </Sphere>
  );
}

function CricketPitch() {
  return (
    <>
      {/* Pitch */}
      <Box args={[0.5, 0.01, 5]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#d4a574" />
      </Box>

      {/* Stumps at batsman end */}
      <group position={[0, 0.3, 2.2]}>
        <Box args={[0.02, 0.6, 0.02]} position={[-0.1, 0, 0]}>
          <meshStandardMaterial color="white" />
        </Box>
        <Box args={[0.02, 0.6, 0.02]} position={[0, 0, 0]}>
          <meshStandardMaterial color="white" />
        </Box>
        <Box args={[0.02, 0.6, 0.02]} position={[0.1, 0, 0]}>
          <meshStandardMaterial color="white" />
        </Box>
        {/* Bails */}
        <Box args={[0.25, 0.02, 0.02]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="white" />
        </Box>
      </group>

      {/* Stumps at bowler end */}
      <group position={[0, 0.3, -2.2]}>
        <Box args={[0.02, 0.6, 0.02]} position={[-0.1, 0, 0]}>
          <meshStandardMaterial color="white" />
        </Box>
        <Box args={[0.02, 0.6, 0.02]} position={[0, 0, 0]}>
          <meshStandardMaterial color="white" />
        </Box>
        <Box args={[0.02, 0.6, 0.02]} position={[0.1, 0, 0]}>
          <meshStandardMaterial color="white" />
        </Box>
        <Box args={[0.25, 0.02, 0.02]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="white" />
        </Box>
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>

      {/* Boundary circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <ringGeometry args={[9.8, 10, 64]} />
        <meshStandardMaterial color="#fff" side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

export function Replay3D({ ballData }: Replay3DProps) {
  const [trajectory, setTrajectory] = useState<THREE.Vector3[]>([]);

  useEffect(() => {
    if (ballData?.trajectory) {
      const points = ballData.trajectory.map(
        p => new THREE.Vector3(p.x, p.y, p.z)
      );
      setTrajectory(points);
    } else {
      // Generate default parabolic trajectory for demo
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 50; i++) {
        const t = i / 50;
        const x = (Math.random() - 0.5) * 0.5; // Slight variation
        const z = -2.2 + t * 4.4; // From bowler to batsman
        const y = 0.5 + Math.sin(t * Math.PI) * 1.5; // Parabolic arc
        points.push(new THREE.Vector3(x, y, z));
      }
      setTrajectory(points);
    }
  }, [ballData]);

  return (
    <div style={{ width: '100%', height: '500px', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [6, 4, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />

        <CricketPitch />

        {trajectory.length > 0 && (
          <>
            <Ball trajectory={trajectory} />
            <Line
              points={trajectory}
              color={ballData?.isWicket ? "#f44336" : ballData?.runs && ballData.runs >= 4 ? "#4caf50" : "#ff9800"}
              lineWidth={3}
            />
          </>
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />

        {/* Grid helper */}
        <gridHelper args={[20, 20, '#ccc', '#eee']} position={[0, -0.01, 0]} />
      </Canvas>

      {/* Info Panel */}
      {ballData && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded shadow-lg">
          <div className="text-sm space-y-1">
            {ballData.speed && <p><strong>Speed:</strong> {ballData.speed} km/h</p>}
            {ballData.runs !== undefined && <p><strong>Runs:</strong> {ballData.runs}</p>}
            {ballData.isWicket && <p className="text-red-600"><strong>WICKET!</strong></p>}
          </div>
        </div>
      )}
    </div>
  );
}
