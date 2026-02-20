'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface PitchMapProps {
  data: Array<{
    x: number; // -1 to 1 (leg to off)
    y: number; // 0 to 1 (stumps to bowler)
    runs: number;
    isWicket: boolean;
    wicketType?: string;
  }>;
  heatMap?: number[][]; // 5x4 grid
  width?: number;
  height?: number;
}

export function PitchMap({ data, heatMap, width = 400, height = 600 }: PitchMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = 40;
    const pitchWidth = width - 2 * padding;
    const pitchHeight = height - 2 * padding;

    const g = svg.append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    // Draw pitch background
    g.append('rect')
      .attr('width', pitchWidth)
      .attr('height', pitchHeight)
      .attr('fill', '#d4a574')
      .attr('stroke', '#8d6e63')
      .attr('stroke-width', 2)
      .attr('rx', 4);

    // Draw crease lines
    const creaseY = pitchHeight * 0.9;
    g.append('line')
      .attr('x1', 0)
      .attr('y1', creaseY)
      .attr('x2', pitchWidth)
      .attr('y2', creaseY)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    const bowlerCreaseY = pitchHeight * 0.1;
    g.append('line')
      .attr('x1', 0)
      .attr('y1', bowlerCreaseY)
      .attr('x2', pitchWidth)
      .attr('y2', bowlerCreaseY)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Draw stumps
    const stumpsX = pitchWidth / 2;
    const stumpsY = pitchHeight * 0.9;
    [-6, 0, 6].forEach(offset => {
      g.append('line')
        .attr('x1', stumpsX + offset)
        .attr('y1', stumpsY - 15)
        .attr('x2', stumpsX + offset)
        .attr('y2', stumpsY)
        .attr('stroke', '#000')
        .attr('stroke-width', 2);
    });

    // Draw bails
    g.append('line')
      .attr('x1', stumpsX - 8)
      .attr('y1', stumpsY - 15)
      .attr('x2', stumpsX + 8)
      .attr('y2', stumpsY - 15)
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

    // Draw heat map if provided
    if (heatMap && heatMap.length > 0) {
      const maxCount = Math.max(...heatMap.flat());
      const colorScale = d3.scaleLinear<string>()
        .domain([0, maxCount])
        .range(['rgba(59, 130, 246, 0.1)', 'rgba(239, 68, 68, 0.7)']);

      const cellWidth = pitchWidth / 5;
      const cellHeight = pitchHeight / 4;

      heatMap.forEach((row, i) => {
        row.forEach((count, j) => {
          if (count > 0) {
            g.append('rect')
              .attr('x', i * cellWidth)
              .attr('y', j * cellHeight)
              .attr('width', cellWidth)
              .attr('height', cellHeight)
              .attr('fill', colorScale(count))
              .attr('stroke', '#fff')
              .attr('stroke-width', 0.5)
              .append('title')
              .text(`${count} ball${count !== 1 ? 's' : ''}`);
          }
        });
      });
    }

    // Plot individual balls
    data.forEach(ball => {
      const x = ((ball.x + 1) / 2) * pitchWidth; // -1 to 1 -> 0 to pitchWidth
      const y = ball.y * pitchHeight; // 0 to 1 -> 0 to pitchHeight

      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', ball.isWicket ? 7 : 4)
        .attr('fill', ball.isWicket ? '#f44336' : ball.runs >= 4 ? '#4caf50' : '#2196f3')
        .attr('stroke', '#fff')
        .attr('stroke-width', ball.isWicket ? 2 : 1)
        .style('cursor', 'pointer')
        .append('title')
        .text(`${ball.runs} run${ball.runs !== 1 ? 's' : ''}${ball.isWicket ? ` - ${ball.wicketType}` : ''}`);
    });

    // Add labels
    g.append('text')
      .attr('x', pitchWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .text('Bowler End')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333');

    g.append('text')
      .attr('x', pitchWidth / 2)
      .attr('y', pitchHeight + 30)
      .attr('text-anchor', 'middle')
      .text('Batsman End')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333');

    // Add line labels
    g.append('text')
      .attr('x', -30)
      .attr('y', pitchHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90, -30, ${pitchHeight / 2})`)
      .text('Leg')
      .attr('font-size', '12px')
      .attr('fill', '#666');

    g.append('text')
      .attr('x', pitchWidth + 30)
      .attr('y', pitchHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(90, ${pitchWidth + 30}, ${pitchHeight / 2})`)
      .text('Off')
      .attr('font-size', '12px')
      .attr('fill', '#666');

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 100}, 20)`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .text('Legend')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333');

    const legendItems = [
      { label: 'Wicket', color: '#f44336', r: 7 },
      { label: 'Boundary', color: '#4caf50', r: 4 },
      { label: 'Regular', color: '#2196f3', r: 4 },
    ];

    legendItems.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${(i + 1) * 20})`);

      legendRow.append('circle')
        .attr('r', item.r)
        .attr('fill', item.color)
        .attr('stroke', '#fff');

      legendRow.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .text(item.label)
        .attr('font-size', '11px')
        .attr('fill', '#333');
    });

  }, [data, heatMap, width, height]);

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
