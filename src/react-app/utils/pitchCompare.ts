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


/**
 * 通过范围给出 区间内音列表
 * @param start C2
 * @param end  E5
 * @returns 
 */
export const getNotesByMidiRange = (start: string, end: string) => {
    const startMidi = Tone.Frequency(start).toMidi();
    const endMidi = Tone.Frequency(end).toMidi();
    const notes = [];
    for (let midi = startMidi; midi <= endMidi; midi++) {
        notes.push(Tone.Frequency(midi, "midi").toNote());
    }
    return notes;
}

export const getDefaultNoteRange = () => getNotesByMidiRange("c2", "c6")