'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WagonWheelProps {
  data: Array<{
    angle: number;
    distance: number;
    runs: number;
    zone?: string;
    batsman?: string;
    bowler?: string;
  }>;
  width?: number;
  height?: number;
}

export function WagonWheel({ data, width = 500, height = 500 }: WagonWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous

    const radius = Math.min(width, height) / 2 - 40;
    const center = { x: width / 2, y: height / 2 };

    // Create cricket field circles
    const g = svg.append('g')
      .attr('transform', `translate(${center.x}, ${center.y})`);

    // Draw field boundary
    g.append('circle')
      .attr('r', radius)
      .attr('fill', '#e8f5e9')
      .attr('stroke', '#2e7d32')
      .attr('stroke-width', 2);

    // Draw 30-yard circle
    g.append('circle')
      .attr('r', radius * 0.6)
      .attr('fill', 'none')
      .attr('stroke', '#66bb6a')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5');

    // Draw pitch
    g.append('rect')
      .attr('x', -10)
      .attr('y', -radius * 0.15)
      .attr('width', 20)
      .attr('height', radius * 0.3)
      .attr('fill', '#d4a574')
      .attr('stroke', '#8d6e63');

    // Color scale based on runs
    const colorScale = d3.scaleOrdinal<number, string>()
      .domain([0, 1, 2, 3, 4, 6])
      .range(['#9e9e9e', '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0']);

    // Plot shots
    data.forEach(shot => {
      const angleRad = (shot.angle - 90) * (Math.PI / 180); // Adjust to SVG coordinates
      const dist = (shot.distance / 100) * radius;
      const x = Math.cos(angleRad) * dist;
      const y = Math.sin(angleRad) * dist;

      // Draw line from center to shot
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', colorScale(shot.runs))
        .attr('stroke-width', 2)
        .attr('opacity', 0.5);

      // Draw shot marker
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 5)
        .attr('fill', colorScale(shot.runs))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .append('title')
        .text(`${shot.runs} run${shot.runs !== 1 ? 's' : ''}${shot.batsman ? ` - ${shot.batsman}` : ''}`);
    });

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(20, ${height - 100})`);

    [0, 1, 2, 3, 4, 6].forEach((runs, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow.append('circle')
        .attr('r', 5)
        .attr('fill', colorScale(runs));

      legendRow.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .text(`${runs} run${runs !== 1 ? 's' : ''}`)
        .attr('font-size', '12px')
        .attr('fill', '#333');
    });

    // Add field labels
    const labels = [
      { text: 'Cover', angle: 45, r: radius * 0.85 },
      { text: 'Mid-Off', angle: 15, r: radius * 0.85 },
      { text: 'Straight', angle: 0, r: radius * 0.9 },
      { text: 'Mid-On', angle: -15, r: radius * 0.85 },
      { text: 'Mid-Wicket', angle: -45, r: radius * 0.85 },
      { text: 'Square Leg', angle: -90, r: radius * 0.85 },
      { text: 'Fine Leg', angle: -135, r: radius * 0.85 },
      { text: 'Third Man', angle: 135, r: radius * 0.85 },
    ];

    labels.forEach(label => {
      const angleRad = (label.angle - 90) * (Math.PI / 180);
      const x = Math.cos(angleRad) * label.r;
      const y = Math.sin(angleRad) * label.r;

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .attr('font-weight', 'bold')
        .text(label.text);
    });

  }, [data, width, height]);

  return (
    <div className="flex justify-center">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}
      />
    </div>
  );
}
