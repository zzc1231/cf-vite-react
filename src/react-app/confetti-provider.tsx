
import Realistic from "react-canvas-confetti/dist/presets/realistic";

let realisticInstance: any = null;

export const ConfettiProvider = () => {
    return (
        <Realistic
            onInit={(instance: any) => {
                realisticInstance = instance.conductor;
            }}
            style={{
                position: 'fixed',
                width: '100%',
                height: '100%',
                zIndex: 99999,
                pointerEvents: 'none',
            }}
        />
    );
};

interface ConfettiOptions {
    angle?: number;
    spread?: number;
    startVelocity?: number;
    elementCount?: number;
    decay?: number;
    colors?: string[];
    ticks?: number;
    gravity?: number;
    drift?: number;
    scalar?: number;
    shapes?: string[];
}

export const addRealistic = (customOptions: ConfettiOptions = {}) => {
    if (!realisticInstance) return;

    const defaultOptions = {
        angle: 90,
        spread: 360,
        startVelocity: 45,
        elementCount: 200,
        decay: 0.9,
        colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
        ticks: 200,
        gravity: 1,
        drift: 0,
        scalar: 1,
        shapes: ['circle', 'square'],
    };

    realisticInstance.fire({
        ...defaultOptions,
        ...customOptions,
    });
};

export const closeAll = () => {
    if (!realisticInstance) return;
    realisticInstance.reset();
};

