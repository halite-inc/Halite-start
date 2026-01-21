'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { View, Environment, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'

export function LiquidGlassGlobalCanvas({ eventSource }: { eventSource?: React.RefObject<HTMLElement | null> }) {
  return (
    <Canvas
      className="pointer-events-none fixed inset-0 z-0"
      shadows
      eventSource={eventSource as React.RefObject<HTMLElement>}
      gl={{ alpha: true, antialias: true }}
      orthographic
      camera={{ position: [0, 0, 100], zoom: 100 }}
    >
      <View.Port />
      <directionalLight position={[5, 10, 5]} intensity={4} />
      <ambientLight intensity={0.5} />
      <Environment preset="warehouse" />
    </Canvas>
  )
}

export function LiquidGlassCard({ className, isDark, isHovered }: { className?: string, isDark: boolean, isHovered: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <>
      <div ref={ref} className={`absolute inset-0 rounded-2xl pointer-events-none backdrop-blur-3xl backdrop-saturate-150 ${isDark ? 'bg-white/5' : 'bg-white/10'} ${className || ''}`} />
      <View track={ref as React.MutableRefObject<HTMLElement>}>
         <Scene isDark={isDark} isHovered={isHovered} />
      </View>
    </>
  )
}

function Scene({ isDark, isHovered }: { isDark: boolean, isHovered: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  
  useFrame((state, delta) => {
    if(!mesh.current) return
    easing.damp3(
        mesh.current.scale, 
        isHovered ? [viewport.width, viewport.height, 1] : [viewport.width, viewport.height, 1],
        0.2, 
        delta
    )
  })

  return (
    <mesh ref={mesh}>
        <planeGeometry args={[1, 1]} /> 
        <MeshTransmissionMaterial 
            resolution={1024}
            samples={16}
            thickness={3.5}
            roughness={0.15}
            anisotropy={1.5}
            chromaticAberration={0.06}
            distortion={0.25}
            distortionScale={0.3}
            temporalDistortion={0.2}
            ior={1.6}
            color={isDark ? '#888' : '#fff'}
            clearcoat={1}
            attenuationDistance={0.5}
            attenuationColor={isDark ? '#ffffff' : '#e5e5e5'}
        />
    </mesh>
  )
}
