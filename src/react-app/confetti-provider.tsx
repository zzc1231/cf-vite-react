// src/confetti/ConfettiProvider.tsx
import React, { createContext, useContext, useRef, useCallback } from 'react';
import Realistic from 'react-canvas-confetti/dist/presets/realistic';
import { TCanvasConfettiInstance, TPresetInstanceProps } from 'react-canvas-confetti/dist/types';


const ConfettiContext = createContext<((opts?: any) => void) | null>(null);

export const ConfettiProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const confettiRef = useRef<TCanvasConfettiInstance | null>(null);

    const fire = useCallback((overrideOptions?: any) => {
        if (confettiRef.current) {
            confettiRef.current({
                particleCount: 180,
                ticks: 500,
                spread: 80,
                drift: 0,
                angle: 50,
                origin: { y: 0.4, x: -0.2 },
                ...overrideOptions, // 支持覆盖
            });
        }
    }, []);

    const presetProps: TPresetInstanceProps = {
        globalOptions: {
            useWorker: true,
            resize: true,
        },
        // autorun: false, // 禁止自动播放
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999,
        },
        onInit: ({ confetti }) => {
            confettiRef.current = confetti;
        },
        decorateOptions: (options) => ({
            ...options,
            // 增强随机性
            startVelocity: options.startVelocity ?? 45 + (Math.random() - 0.5) * 45,     // 25~45
            gravity: options.gravity ?? 1 + (Math.random() - 0.5) * 0.6,         // 0.3~0.6
            decay: options.decay ?? 0.92 + Math.random() * 0.06,         // 0.92~0.98
            drift: options.drift ?? (Math.random() - 0.5) * 0.4,         // -0.2 ~ 0.2
            ticks: options.ticks ?? 400 + Math.floor((Math.random() - 0.5) * 300), // 400~700
            scalar: options.scalar ?? 0.8 + Math.random() * 0.4,          // 0.8~1.6
        }),
    };

    return (
        <ConfettiContext.Provider value={fire}>
            {children}
            <Realistic {...presetProps} />
        </ConfettiContext.Provider>
    );
};

export const useConfetti = (): ((opts?: any) => void) => {
    const fire = useContext(ConfettiContext);
    if (!fire) {
        throw new Error('useConfetti must be used after <ConfettiProvider /> is mounted');
    }
    return fire;
};