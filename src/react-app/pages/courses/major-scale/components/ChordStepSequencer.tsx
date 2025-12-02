import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";


const ChordStepSequencer: React.FC<{
    xLen?: number; //x ->
    yLen?: number; //y ^
    subdivision?: string;
    beatsPerChord?: number;
    className?: string;
    onTrigger?: (args: { time: number; x: number, y: number }) => void;
    onBeat?: (args: { time: number; x: number }) => void;
    cellName?: (args: { x: number, y: number }) => React.ReactNode
    chordName?: (args: { x: number }) => React.ReactNode
}> = ({
    xLen = 16,
    yLen = 4,
    subdivision = "8n",
    beatsPerChord = 1,
    className = "",
    onTrigger,
    onBeat,
    cellName = ({ x, y }) => `${x}.${y}`,
    chordName = ({ x }) => `c:${x}`
}) => {
        // ---------- state ----------
        const [matrix, setMatrix] = useState<boolean[][]>([]);
        const [highlighted, setHighlighted] = useState<number>(-1);
        const started = useRef<boolean>(false);
        const containerRef = useRef<HTMLDivElement>(null);

        // ---------- Tone.Sequence ----------
        const seqRef = useRef<Tone.Sequence | null>(null);

        const tick = useCallback(
            (time: number, x: number) => {
                onBeat?.({ time, x })


                let chordStart = x % beatsPerChord == 0


                if (!chordStart)
                    return;


                let chordIndex = Math.trunc(x / beatsPerChord);

                // 高亮当前列
                Tone.getDraw().schedule(() => {
                    if (started.current) setHighlighted(chordIndex);
                }, time);

                // 触发音符
                matrix[chordIndex]?.forEach((filled, yIdx) => {
                    if (filled) {

                        const y = yLen - yIdx - 1
                        // const row = rowIdx; // （顶部部为第 0 行）
                        onTrigger?.({ time, x: chordIndex, y });
                    }
                });
            },
            [matrix, yLen]
        );

        // 创建 / 更新 Sequence
        useEffect(() => {
            if (seqRef.current) seqRef.current.dispose();

            const indices = Array.from({ length: xLen * beatsPerChord }, (_, i) => i);
            seqRef.current = new Tone.Sequence(tick, indices, subdivision).start(0);

            return () => {
                seqRef.current?.dispose();
            };
        }, [xLen, subdivision, tick]);

        // 初始化 matrix
        useEffect(() => {
            const newMatrix = Array.from({ length: xLen }, () =>
                Array.from({ length: yLen }, () => false)
            );
            setMatrix(newMatrix);
        }, [xLen, yLen]);

        // Transport 事件
        useEffect(() => {
            const onStart = () => (started.current = true);
            const onStop = () => {
                started.current = false;
                setHighlighted(-1);
            };
            Tone.getTransport().on("start", onStart);
            Tone.getTransport().on("stop", onStop);
            return () => {
                Tone.getTransport().off("start", onStart);
                Tone.getTransport().off("stop", onStop);
            };
        }, []);

        // // 动态高度（保持正方形格子）
        // useEffect(() => {
        //     if (!containerRef.current) return;
        //     const width = containerRef.current.offsetWidth;
        //     let cell = width / columns;
        //     cell = Math.max(cell, 32) - 12
        //     containerRef.current.style.height = `${cell * rows}px`;
        // }, [columns, rows]);

        // ---------- 交互 ----------
        const toggleCell = (x: number, y: number) => {
            setMatrix((prev) => {
                const copy = prev.map((c) => [...c]);
                copy[x][y] = !copy[x][y];
                return copy;
            });
        };

        const handleMouseDown = (e: React.MouseEvent, x: number, y: number) => {
            e.preventDefault();
            toggleCell(x, y);
        };

        const handleMouseEnter = (e: React.MouseEvent, col: number, row: number) => {
            if (e.buttons === 1) toggleCell(col, row); // 拖拽填充
        };

        // ---------- render ----------
        return (
            <div
                ref={containerRef}
                className={` flex flex-nowrap overflow-x-auto overflow-y-visible whitespace-nowrap gap-0.5 ${className}`}
                id="container"
            >
                {matrix.map((column, x) => (
                    <div
                        key={x}
                        className={`flex-1 flex flex-col gap-0.5 ${x === highlighted ? "bg-orange-300/50 rounded" : ""
                            }`}
                    >
                        {column.map((filled, y) => (
                            <button
                                key={y}
                                className={`w-10 aspect-square
                 flex-1 border border-gray-300 dark:border-gray-400/50 rounded-s-xs
                transition-all duration-100
                ${filled ? "bg-green-500 dark:bg-green-500/60  shadow" : "bg-gray-300 dark:bg-gray-400/50"}
                ${x === highlighted && !filled ? "bg-orange-300" : ""}
              `}
                                onMouseDown={(e) => handleMouseDown(e, x, y)}
                                onMouseEnter={(e) => handleMouseEnter(e, x, y)}
                                aria-pressed={filled}
                            >{cellName?.({ x: x, y: yLen - y - 1 })}</button>
                        ))}
                        <div className="border rounded-xs border-gray-300 text-center">{chordName?.({ x })}</div>
                    </div>

                ))}

            </div >
        );
    };

export default ChordStepSequencer;