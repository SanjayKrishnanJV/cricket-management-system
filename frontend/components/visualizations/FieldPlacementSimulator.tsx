'use client';

import { useState } from 'react';
import Draggable from 'react-draggable';

interface FieldPosition {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  x: number; // -1 to 1
  y: number; // -1 to 1
}

interface FieldPlacementSimulatorProps {
  players?: Array<{ id: string; name: string }>;
  initialPositions?: FieldPosition[];
  onSave?: (positions: FieldPosition[]) => void;
}

const DEFAULT_POSITIONS = [
  { position: 'Wicket Keeper', x: 0, y: 0.95 },
  { position: 'Slip 1', x: 0.15, y: 0.92 },
  { position: 'Slip 2', x: 0.25, y: 0.9 },
  { position: 'Point', x: 0.7, y: 0.7 },
  { position: 'Cover', x: 0.5, y: 0.5 },
  { position: 'Mid Off', x: 0.2, y: 0.3 },
  { position: 'Mid On', x: -0.2, y: 0.3 },
  { position: 'Mid Wicket', x: -0.5, y: 0.5 },
  { position: 'Square Leg', x: -0.7, y: 0.7 },
  { position: 'Fine Leg', x: -0.25, y: 0.9 },
  { position: 'Third Man', x: 0.35, y: 0.88 },
];

export function FieldPlacementSimulator({
  players = [],
  initialPositions,
  onSave,
}: FieldPlacementSimulatorProps) {
  const [positions, setPositions] = useState<FieldPosition[]>(() => {
    if (initialPositions) return initialPositions;

    // Initialize with default positions
    return DEFAULT_POSITIONS.slice(0, 11).map((pos, i) => ({
      id: `pos-${i}`,
      playerId: players[i]?.id || '',
      playerName: players[i]?.name || pos.position,
      position: pos.position,
      x: pos.x,
      y: pos.y,
    }));
  });

  const fieldWidth = 500;
  const fieldHeight = 500;
  const radius = fieldWidth / 2 - 20;

  const handleDrag = (id: string, e: any, data: any) => {
    const centerX = fieldWidth / 2;
    const centerY = fieldHeight / 2;

    // Convert pixel position back to normalized coordinates
    const newX = (data.x - centerX) / radius;
    const newY = (data.y - centerY) / radius;

    // Constrain to circular boundary
    const distance = Math.sqrt(newX * newX + newY * newY);
    const constrainedX = distance > 1 ? newX / distance : newX;
    const constrainedY = distance > 1 ? newY / distance : newY;

    setPositions(prev =>
      prev.map(pos =>
        pos.id === id ? { ...pos, x: constrainedX, y: constrainedY } : pos
      )
    );
  };

  const handlePlayerChange = (id: string, playerId: string) => {
    const player = players.find(p => p.id === playerId);
    setPositions(prev =>
      prev.map(pos =>
        pos.id === id
          ? { ...pos, playerId, playerName: player?.name || pos.position }
          : pos
      )
    );
  };

  const handleSave = () => {
    if (onSave) onSave(positions);
  };

  return (
    <div className="space-y-6">
      <div className="relative mx-auto" style={{ width: fieldWidth, height: fieldHeight }}>
        {/* Cricket Field Background */}
        <svg width={fieldWidth} height={fieldHeight} className="absolute inset-0">
          {/* Outer boundary */}
          <circle
            cx={fieldWidth / 2}
            cy={fieldHeight / 2}
            r={radius}
            fill="#e8f5e9"
            stroke="#2e7d32"
            strokeWidth={3}
          />
          {/* 30-yard circle */}
          <circle
            cx={fieldWidth / 2}
            cy={fieldHeight / 2}
            r={radius * 0.6}
            fill="none"
            stroke="#66bb6a"
            strokeDasharray="5,5"
          />
          {/* Pitch */}
          <rect
            x={fieldWidth / 2 - 12}
            y={fieldHeight / 2 - 50}
            width={24}
            height={100}
            fill="#d4a574"
            stroke="#8d6e63"
            strokeWidth={2}
          />
        </svg>

        {/* Draggable Fielders */}
        {positions.map(pos => {
          // Convert normalized coordinates to pixel positions
          const pixelX = pos.x * radius + fieldWidth / 2;
          const pixelY = pos.y * radius + fieldHeight / 2;

          return (
            <Draggable
              key={pos.id}
              position={{ x: pixelX, y: pixelY }}
              onStop={(e, data) => handleDrag(pos.id, e, data)}
              bounds="parent"
            >
              <div
                className="absolute cursor-move"
                style={{
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xs font-bold shadow-lg hover:bg-blue-700 transition-colors">
                  {pos.playerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="text-xs text-center mt-1 bg-white px-2 py-1 rounded shadow-sm max-w-[80px] truncate">
                  {pos.position}
                </div>
              </div>
            </Draggable>
          );
        })}
      </div>

      {/* Player Assignment */}
      {players.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3 text-gray-900">Assign Players</h3>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {positions.map(pos => (
              <div key={pos.id} className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 w-24 truncate">
                  {pos.position}:
                </label>
                <select
                  value={pos.playerId}
                  onChange={(e) => handlePlayerChange(pos.id, e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Player</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
        >
          Save Field Placement
        </button>
        <button
          onClick={() => setPositions(DEFAULT_POSITIONS.slice(0, 11).map((pos, i) => ({
            id: `pos-${i}`,
            playerId: players[i]?.id || '',
            playerName: players[i]?.name || pos.position,
            position: pos.position,
            x: pos.x,
            y: pos.y,
          })))}
          className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Reset to Default
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Drag fielders to position them on the field. Fielders are automatically constrained within the boundary circle.
        </p>
      </div>
    </div>
  );
}
