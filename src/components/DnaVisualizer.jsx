import React, { useState } from 'react';
import { Dna } from 'lucide-react';

const DnaVisualizer = () => {
    const [sequence, setSequence] = useState(`TCCGTTACCTTGTTGCTGAGCNGGNCNTTTT\nTCCGTTACCATGTTGCTGAGCNGGNCNTA\nACCNTTACCATGTTGCTGAGCNGGNCNTTTT`);

    // Color mapping for each base
    const baseColors = {
        'A': '#32CD32', // Lime green
        'T': '#FF6B6B', // Red
        'G': '#FFD700', // Gold
        'C': '#4169E1', // Royal blue
        'N': '#808080', // Gray
    };

    // Legend component
    const Legend = () => (
        <div className="flex flex-wrap gap-4 mb-4">
            {Object.entries(baseColors).map(([base, color]) => (
                <div key={base} className="flex items-center gap-1">
                    <span style={{ color }} className="font-mono font-bold">{base}</span>
                    <span className="text-sm text-gray-600">
                        {base === 'N' ? '(Unknown)' : `(${base === 'A' ? 'Adenine' : base === 'T' ? 'Thymine' : base === 'G' ? 'Guanine' : 'Cytosine'})`}
                    </span>
                </div>
            ))}
        </div>
    );

    // Function to create position markers
    const createPositionMarkers = (maxLength) => {
        const markers = [];
        for (let i = 0; i <= maxLength; i += 10) {
            const markerStyle = {
                position: 'absolute',
                left: `${i * 0.61}em`, // Adjust based on monospace font width
                borderLeft: i === 0 ? 'none' : '1px solid #ddd',
            };

            markers.push(
                <div key={i} className="relative">
                    <div style={markerStyle}>
                        <span className="inline-block -ml-3 text-xs text-gray-500">{i}</span>
                    </div>
                </div>
            );
        }
        return markers;
    };

    // Function to render a single base with its color
    const renderBase = (base, index) => {
        const color = baseColors[base.toUpperCase()] || '#000000';
        return (
            <span
                key={index}
                style={{ color }}
                className="font-mono"
            >
                {base}
            </span>
        );
    };

    // Function to render the sequence with line breaks preserved
    const renderSequence = () => {
        const lines = sequence.split('\n');
        const maxLength = Math.max(...lines.map(line => line.length));

        return (
            <div className="relative">
                {lines.map((line, lineIndex) => (
                    <div key={lineIndex} className="whitespace-pre font-mono">
                        {line.split('').map((base, baseIndex) =>
                            renderBase(base, `${lineIndex}-${baseIndex}`)
                        )}
                    </div>
                ))}

                <div className="h-6 mt-2 relative border-t border-gray-200">
                    {createPositionMarkers(maxLength)}
                </div>
            </div>
        );
    };

    const handleSequenceChange = (e) => {
        setSequence(e.target.value);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Dna className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
                    <h1 className="text-2xl font-bold">DNA Colorizer</h1>
                </div>
                <p className="text-gray-600">
                    Paste your DNA sequence below. The Colorizer supports multiline sequences and will display position markers.
                    Unknown bases (N) are also supported.
                </p>
            </div>

            <div className="space-y-4">
                <Legend />
                <div className="w-full">
                    <textarea
                        value={sequence}
                        onChange={handleSequenceChange}
                        className="w-full h-32 p-2 font-mono border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter DNA sequence..."
                    />
                </div>
                <div className="bg-gray-50 p-4 rounded overflow-x-auto">
                    <div className="min-w-fit">
                        {renderSequence()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DnaVisualizer;