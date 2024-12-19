import React, { useState } from 'react';
import { Dna } from 'lucide-react';

const DnaVisualizer = () => {
    const [sequence, setSequence] = useState(`TCCGTTACCTTGTTGCTGAGCNGGNCNTTTT\nTCCGTTACCATGTTGCTGAGCNGGNCNTA\nACCNTTACCATGTTGCTGAGCNGGNCNTTTT`);
    const [cursorPosition, setCursorPosition] = useState({ line: null, column: null });
    const [selectionStart, setSelectionStart] = useState(null);
    const [selectionEnd, setSelectionEnd] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [colorMode, setColorMode] = useState('background'); // 'text' or 'background'

    // Color mapping for each base
    const baseColors = {
        'A': colorMode === 'text' ? '#32CD32' : '#90EE90', // Lime green
        'T': colorMode === 'text' ? '#FF6B6B' : '#FFB6B6', // Light red
        'G': colorMode === 'text' ? '#FFD700' : '#FFEB9C', // Light gold
        'C': colorMode === 'text' ? '#4169E1' : '#B6C4FF', // Light blue
        'N': colorMode === 'text' ? '#808080' : '#D3D3D3', // Light gray
    };

    // Function to get color for a base, returning white background for unknown bases in background mode
    const getBaseColor = (base) => {
        const upperBase = base.toUpperCase();
        if (colorMode === 'text') {
            return baseColors[upperBase] || '#000000';
        } else {
            return baseColors[upperBase] || '#FFFFFF'; // White background for unknown bases
        }
    };

    // Function to calculate the absolute position in the sequence
    const getAbsolutePosition = (lineIndex, columnIndex) => {
        const lines = sequence.split('\n');
        let position = 0;
        for (let i = 0; i < lineIndex; i++) {
            position += lines[i].length;
        }
        return position + columnIndex;
    };

    // Function to check if a position is within the current selection
    const isPositionSelected = (lineIndex, columnIndex) => {
        if (!selectionStart || !selectionEnd) return false;

        const pos = getAbsolutePosition(lineIndex, columnIndex);
        const startPos = getAbsolutePosition(selectionStart.line, selectionStart.column);
        const endPos = getAbsolutePosition(selectionEnd.line, selectionEnd.column);

        return pos >= Math.min(startPos, endPos) && pos <= Math.max(startPos, endPos);
    };

    // Function to count selected bases
    const getSelectedBasesCount = () => {
        if (!selectionStart || !selectionEnd) return 0;

        const startPos = getAbsolutePosition(selectionStart.line, selectionStart.column);
        const endPos = getAbsolutePosition(selectionEnd.line, selectionEnd.column);

        return Math.abs(endPos - startPos) + 1;
    };

    // Legend component
    const Legend = () => (
        <div className="flex flex-wrap gap-4 mb-4">
            {Object.entries(baseColors).map(([base, color]) => (
                <div key={base} className="flex items-center gap-1">
                    <span
                        style={colorMode === 'text' ? { color } : { backgroundColor: color, color: 'black', padding: '0 4px', borderRadius: '2px' }}
                        className="font-mono font-bold"
                    >
                        {base}
                    </span>
                    <span className="text-sm text-gray-600">
                        {base === 'N' ? '(Unknown)' : `(${base === 'A' ? 'Adenine' : base === 'T' ? 'Thymine' : base === 'G' ? 'Guanine' : 'Cytosine'})`}
                    </span>
                </div>
            ))}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Color mode:</span>
                <button
                    onClick={() => setColorMode(prev => prev === 'text' ? 'background' : 'text')}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors text-sm"
                >
                    {colorMode === 'text' ? 'Text' : 'Background'}
                </button>
            </div>
        </div>
    );

    // Function to create position markers
    const createPositionMarkers = (maxLength) => {
        const markers = [];
        for (let i = 0; i <= maxLength; i += 10) {
            const markerStyle = {
                position: 'absolute',
                left: `${i * 0.61}em`,
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
    const renderBase = (base, lineIndex, columnIndex) => {
        const color = getBaseColor(base);
        const isHighlighted = lineIndex === cursorPosition.line && columnIndex === cursorPosition.column;
        const selected = isPositionSelected(lineIndex, columnIndex);

        return (
            <span
                key={`${lineIndex}-${columnIndex}`}
                style={{
                    ...(colorMode === 'text'
                        ? {
                            color,
                            background: `linear-gradient(${selected ? 'rgba(0, 0, 0, 0.2)' :
                                isHighlighted ? 'rgba(0, 0, 0, 0.1)' :
                                    'transparent'} 45%, transparent 45%, transparent 55%, ${selected ? 'rgba(0, 0, 0, 0.2)' :
                                        isHighlighted ? 'rgba(0, 0, 0, 0.1)' :
                                            'transparent'} 55%)`
                        }
                        : {
                            backgroundColor: color,
                            color: 'black',
                            filter: selected ? 'brightness(0.9)' : isHighlighted ? 'brightness(0.95)' : 'none'
                        }),
                    padding: colorMode === 'background' ? '0 2px' : '0 1px',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
                className="font-mono transition-colors"
                onMouseEnter={() => setCursorPosition({ line: lineIndex, column: columnIndex })}
                onMouseLeave={() => !isSelecting && setCursorPosition({ line: null, column: null })}
                onMouseDown={(e) => {
                    e.preventDefault();
                    setIsSelecting(true);
                    setSelectionStart({ line: lineIndex, column: columnIndex });
                    setSelectionEnd({ line: lineIndex, column: columnIndex });
                }}
                onMouseUp={() => {
                    setIsSelecting(false);
                }}
                onMouseMove={() => {
                    if (isSelecting) {
                        setSelectionEnd({ line: lineIndex, column: columnIndex });
                    }
                }}
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
                        {line.split('').map((base, columnIndex) =>
                            renderBase(base, lineIndex, columnIndex)
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

    // Function to get the complement of a DNA base
    const getComplement = (base) => {
        const complements = {
            'A': 'T',
            'T': 'A',
            'G': 'C',
            'C': 'G',
            'N': 'N',
            'a': 't',
            't': 'a',
            'g': 'c',
            'c': 'g',
            'n': 'n'
        };
        return complements[base] || base;
    };

    // Function to get reverse complement of the sequence
    const getReverseComplement = () => {
        return sequence
            .split('\n')
            .map(line =>
                line
                    .split('')
                    .reverse()
                    .map(base => getComplement(base))
                    .join('')
            )
            .join('\n');
    };

    // Function to reverse the sequence without complementing
    const getReverse = () => {
        return sequence
            .split('\n')
            .map(line =>
                line
                    .split('')
                    .reverse()
                    .join('')
            )
            .join('\n');
    };

    // Handle mouse up event on window
    React.useEffect(() => {
        const handleMouseUp = () => {
            setIsSelecting(false);
        };

        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Dna className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
                    <h1 className="text-2xl font-bold">DNA Colorizer</h1>
                </div>
                <p className="text-gray-600">
                    Paste your DNA sequence below. Hover over bases to see their position.
                    Click and drag to select multiple bases.
                </p>
            </div>

            <div className="space-y-4">
                <Legend />
                <div className="w-full space-y-2">
                    <textarea
                        value={sequence}
                        onChange={handleSequenceChange}
                        className="w-full h-32 p-2 font-mono border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter DNA sequence..."
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSequence('')}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => {
                                const currentSequences = sequence.split('\n');
                                setSequence([...currentSequences, ...currentSequences].join('\n'));
                            }}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                        >
                            Replicate Sequence
                        </button>
                        <button
                            onClick={() => setSequence(getReverseComplement())}
                            className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                        >
                            Reverse Complement
                        </button>
                        <button
                            onClick={() => setSequence(getReverse())}
                            className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded transition-colors"
                        >
                            Reverse
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(sequence);
                                } catch (err) {
                                    console.error('Failed to copy sequence:', err);
                                }
                            }}
                            className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded overflow-x-auto">
                    <div className="min-w-fit">
                        {renderSequence()}
                    </div>
                    <div className="mt-2 h-12 text-sm text-gray-600">
                        <div className="h-6">
                            {cursorPosition.line !== null && (
                                <span>Position: Line {cursorPosition.line + 1}, Column {cursorPosition.column + 1}</span>
                            )}
                        </div>
                        <div className="h-6">
                            {selectionStart && selectionEnd && (
                                <span>Selected bases: {getSelectedBasesCount()}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DnaVisualizer;