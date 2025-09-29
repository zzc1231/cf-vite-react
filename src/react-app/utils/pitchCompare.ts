import * as Tone from 'tone';
export const getPith = (note: string) => {
    // 用一个基准八度补全：如 "C#" → "C#4"
    const baseNote = note.match(/\d/) ? note : `${note}4`;
    return Tone.Frequency(baseNote).toMidi() % 12;
}

/**
 * 对比两个音是否为同一个音高 C# = C#5 = Db3
 * @param note1 
 * @param note2 
 * @returns 
 */
export const isPitchEqual = (note1: string, note2: string) => {
    return getPith(note1) == getPith(note2);
}