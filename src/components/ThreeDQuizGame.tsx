import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text as DreiText } from '@react-three/drei';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type Question = {
  q: string;
  options: string[];
  correctIndex: number;
};

interface Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

function SpinningCube() {
  const ref = useRef<any>();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.4;
      ref.current.rotation.y += delta * 0.6;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial />
    </mesh>
  );
}

function OptionBillboard({ text, position, onPick }: { text: string; position: [number, number, number]; onPick: () => void; }) {
  const ref = useRef<any>();
  const [hovered, setHovered] = useState(false);

  return (
    <Float speed={2} floatIntensity={2}>
      <mesh
        ref={ref}
        position={position}
        onClick={(e) => { e.stopPropagation(); onPick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[2.6, 0.8]} />
        <meshStandardMaterial />
        <DreiText fontSize={0.3} position={[0, 0, 0.01]} anchorX="center" anchorY="middle">
          {text}
        </DreiText>
      </mesh>
    </Float>
  );
}

export function ThreeDQuizGame({ onComplete, onBack }: Props) {
  const questions: Question[] = useMemo(() => [
    { q: '5 + 7 = ?', options: ['10', '12', '13', '9'], correctIndex: 1 },
    { q: 'Capital of India?', options: ['Mumbai', 'Kolkata', 'New Delhi', 'Jaipur'], correctIndex: 2 },
    { q: 'H2O is:', options: ['Oxygen', 'Hydrogen', 'Water', 'Helium'], correctIndex: 2 },
    { q: '3 x 4 = ?', options: ['7', '12', '9', '14'], correctIndex: 1 },
  ], []);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  const handlePick = (i: number) => {
    if (finished || !started) return;
    if (i === current.correctIndex) setScore(s => s + 25);
    const next = index + 1;
    if (next >= questions.length) {
      setFinished(true);
      setTimeout(() => onComplete(Math.min(100, score + (i === current.correctIndex ? 25 : 0))), 800);
    } else {
      setIndex(next);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="secondary" onClick={onBack}>← Back to Games</Button>
          <div className="text-sm font-medium">Score: {score}</div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>3D Quiz Arena</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[480px] rounded-2xl overflow-hidden border">
              <Canvas camera={{ position: [0, 2.5, 5], fov: 55 }}>
                <ambientLight intensity={0.9} />
                <directionalLight position={[5, 5, 5]} />
                <SpinningCube />
                {started && !finished && (
                  <>
                    <DreiText position={[0, 1.5, 0]} fontSize={0.35} anchorX="center" anchorY="middle">
                      {current.q}
                    </DreiText>
                    <OptionBillboard text={current.options[0]} position={[-3, -0.2, -0.5]} onPick={() => handlePick(0)} />
                    <OptionBillboard text={current.options[1]} position={[3, -0.2, -0.5]} onPick={() => handlePick(1)} />
                    <OptionBillboard text={current.options[2]} position={[-3, -1.5, -0.5]} onPick={() => handlePick(2)} />
                    <OptionBillboard text={current.options[3]} position={[3, -1.5, -0.5]} onPick={() => handlePick(3)} />
                  </>
                )}
                <OrbitControls enablePan={false} />
              </Canvas>
            </div>

            {!started && !finished && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-gray-600">Click the floating answer boards to answer. 4 questions, 25 points each.</p>
                <Button onClick={() => setStarted(true)}>Start</Button>
              </div>
            )}

            {finished && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-gray-700 font-medium">Great job! Final Score: {score}</p>
                <div className="space-x-2">
                  <Button onClick={() => { setIndex(0); setScore(0); setFinished(false); setStarted(false); }}>Play Again</Button>
                  <Button variant="secondary" onClick={onBack}>Back</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ThreeDQuizGame;
