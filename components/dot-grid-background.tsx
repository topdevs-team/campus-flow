'use client'

import DotGrid from '@/src/components/DotGrid'

export default function DotGridBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-white">
      <DotGrid
        dotSize={1.5}
        gap={25}
        baseColor="#c0c0c0"
        activeColor="#888888"
        proximity={130}
        speedTrigger={80}
        shockRadius={220}
        shockStrength={5}
        resistance={700}
        returnDuration={1.5}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
