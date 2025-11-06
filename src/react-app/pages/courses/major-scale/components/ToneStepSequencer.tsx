import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";


const ToneStepSequencer: React.FC<{
    columns?: number;
    rows?: number;
    subdivision?: string;
    className?: string;
    onTrigger?: (args: { time: number; row: number }) => void;
}> = ({
    columns = 16,
    rows = 4,
    subdivision = "8n",
    className = "",
    onTrigger
}) => {
        // ---------- state ----------
        const [matrix, setMatrix] = useState<boolean[][]>([]);
        const [highlighted, setHighlighted] = useState<number>(-1);
        const started = useRef<boolean>(false);
        const containerRef = useRef<HTMLDivElement>(null);

        // ---------- Tone.Sequence ----------
        const seqRef = useRef<Tone.Sequence | null>(null);

        const tick = useCallback(
            (time: number, index: number) => {
                // 高亮当前列
                Tone.getDraw().schedule(() => {
                    if (started.current) setHighlighted(index);
                }, time);

                // 触发音符
                matrix[index]?.forEach((filled, rowIdx) => {
                    if (filled) {
                        const row = rows - rowIdx - 1; // 与原版保持相同（底部为第 0 行）
                        // const row = rowIdx; // （顶部部为第 0 行）
                        onTrigger?.({ time, row });
                    }
                });
            },
            [matrix, rows]
        );

        // 创建 / 更新 Sequence
        useEffect(() => {
            if (seqRef.current) seqRef.current.dispose();

            const indices = Array.from({ length: columns }, (_, i) => i);
            seqRef.current = new Tone.Sequence(tick, indices, subdivision).start(0);

            return () => {
                seqRef.current?.dispose();
            };
        }, [columns, subdivision, tick]);

        // 初始化 matrix
        useEffect(() => {
            const newMatrix = Array.from({ length: columns }, () =>
                Array.from({ length: rows }, () => false)
            );
            setMatrix(newMatrix);
        }, [columns, rows]);

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

        // 动态高度（保持正方形格子）
        useEffect(() => {
            if (!containerRef.current) return;
            const width = containerRef.current.offsetWidth;
            const cell = width / columns;
            containerRef.current.style.height = `${cell * rows}px`;
        }, [columns, rows]);

        // ---------- 交互 ----------
        const toggleCell = (col: number, row: number) => {
            setMatrix((prev) => {
                const copy = prev.map((c) => [...c]);
                copy[col][row] = !copy[col][row];
                return copy;
            });
        };

        const handleMouseDown = (e: React.MouseEvent, col: number, row: number) => {
            e.preventDefault();
            toggleCell(col, row);
        };

        const handleMouseEnter = (e: React.MouseEvent, col: number, row: number) => {
            if (e.buttons === 1) toggleCell(col, row); // 拖拽填充
        };

        // ---------- render ----------
        return (
            <div
                ref={containerRef}
                className={`w-full flex ${className}`}
                id="container"
            >
                {matrix.map((column, x) => (
                    <div
                        key={x}
                        className={`flex-1 flex flex-col ${x === highlighted ? "bg-orange-300/50 rounded" : ""
                            }`}
                    >
                        {column.map((filled, y) => (
                            <button
                                key={y}
                                className={`
                m-0.5 flex-1 border border-gray-300 dark:border-gray-400/50 rounded
                transition-all duration-100
                ${filled ? "bg-green-500 dark:bg-green-500/60  shadow" : "bg-gray-300 dark:bg-gray-400/50"}
                ${x === highlighted && !filled ? "bg-orange-300" : ""}
              `}
                                onMouseDown={(e) => handleMouseDown(e, x, y)}
                                onMouseEnter={(e) => handleMouseEnter(e, x, y)}
                                aria-pressed={filled}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    };

export default ToneStepSequencer;