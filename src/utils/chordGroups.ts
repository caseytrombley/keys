// src/utils/chordGroups.ts

interface Chord {
  id: string;
  notes: string[];
}

interface ChordSection {
  title: string;
  chords: Chord[];
}

export const chordGroups: ChordSection[] = [
  {
    title: 'Major Chords',
    chords: [
      { id: 'C', notes: ['C', 'E', 'G'] },
      { id: 'C#', notes: ['C#', 'F', 'G#'] },
      { id: 'D', notes: ['D', 'F#', 'A'] },
      { id: 'D#', notes: ['D#', 'G', 'A#'] },
      { id: 'E', notes: ['E', 'G#', 'B'] },
      { id: 'F', notes: ['F', 'A', 'C'] },
      { id: 'F#', notes: ['F#', 'A#', 'C#'] },
      { id: 'G', notes: ['G', 'B', 'D'] },
      { id: 'G#', notes: ['G#', 'C', 'D#'] },
      { id: 'A', notes: ['A', 'C#', 'E'] },
      { id: 'A#', notes: ['A#', 'D', 'F'] },
      { id: 'B', notes: ['B', 'D#', 'F#'] },
    ]
  },
  {
    title: 'Major 7th Chords',
    chords: [
      { id: 'Cmaj7', notes: ['C', 'E', 'G', 'B'] },
      { id: 'C#maj7', notes: ['C#', 'F', 'G#', 'B#'] },
      { id: 'Dmaj7', notes: ['D', 'F#', 'A', 'C#'] },
      { id: 'D#maj7', notes: ['D#', 'G', 'A#', 'D'] },
      { id: 'Emaj7', notes: ['E', 'G#', 'B', 'D#'] },
      { id: 'Fmaj7', notes: ['F', 'A', 'C', 'E'] },
      { id: 'F#maj7', notes: ['F#', 'A#', 'C#', 'E#'] },
      { id: 'Gmaj7', notes: ['G', 'B', 'D', 'F#'] },
      { id: 'G#maj7', notes: ['G#', 'C', 'D#', 'F'] },
      { id: 'Amaj7', notes: ['A', 'C#', 'E', 'G#'] },
      { id: 'A#maj7', notes: ['A#', 'D', 'F', 'A'] },
      { id: 'Bmaj7', notes: ['B', 'D#', 'F#', 'A#'] },
    ]
  },
  {
    title: 'Minor Chords',
    chords: [
      { id: 'Cm', notes: ['C', 'Eb', 'G'] },
      { id: 'C#m', notes: ['C#', 'E', 'G#'] },
      { id: 'Dm', notes: ['D', 'F', 'A'] },
      { id: 'D#m', notes: ['D#', 'F#', 'A#'] },
      { id: 'Em', notes: ['E', 'G', 'B'] },
      { id: 'Fm', notes: ['F', 'Ab', 'C'] },
      { id: 'F#m', notes: ['F#', 'A', 'C#'] },
      { id: 'Gm', notes: ['G', 'Bb', 'D'] },
      { id: 'G#m', notes: ['G#', 'B', 'D#'] },
      { id: 'Am', notes: ['A', 'C', 'E'] },
      { id: 'A#m', notes: ['A#', 'C#', 'F'] },
      { id: 'Bm', notes: ['B', 'D', 'F#'] },
    ]
  },
  {
    title: 'Minor 7th Chords',
    chords: [
      { id: 'Cm7', notes: ['C', 'Eb', 'G', 'Bb'] },
      { id: 'C#m7', notes: ['C#', 'E', 'G#', 'B'] },
      { id: 'Dm7', notes: ['D', 'F', 'A', 'C'] },
      { id: 'D#m7', notes: ['D#', 'F#', 'A#', 'C#'] },
      { id: 'Em7', notes: ['E', 'G', 'B', 'D'] },
      { id: 'Fm7', notes: ['F', 'Ab', 'C', 'Eb'] },
      { id: 'F#m7', notes: ['F#', 'A', 'C#', 'E'] },
      { id: 'Gm7', notes: ['G', 'Bb', 'D', 'F'] },
      { id: 'G#m7', notes: ['G#', 'B', 'D#', 'F#'] },
      { id: 'Am7', notes: ['A', 'C', 'E', 'G'] },
      { id: 'A#m7', notes: ['A#', 'C#', 'F', 'G#'] },
      { id: 'Bm7', notes: ['B', 'D', 'F#', 'A'] },
    ]
  },
  {
    title: 'Diminished Chords',
    chords: [
      { id: 'Cdim', notes: ['C', 'Eb', 'Gb'] },
      { id: 'C#dim', notes: ['C#', 'E', 'G'] },
      { id: 'Ddim', notes: ['D', 'F', 'Ab'] },
      { id: 'D#dim', notes: ['D#', 'F#', 'A'] },
      { id: 'Edim', notes: ['E', 'G', 'A#'] },
      { id: 'Fdim', notes: ['F', 'Ab', 'B'] },
      { id: 'F#dim', notes: ['F#', 'A', 'C'] },
      { id: 'Gdim', notes: ['G', 'Bb', 'C#'] },
      { id: 'G#dim', notes: ['G#', 'B', 'D'] },
      { id: 'Adim', notes: ['A', 'C', 'D#'] },
      { id: 'A#dim', notes: ['A#', 'C#', 'E'] },
      { id: 'Bdim', notes: ['B', 'D', 'F'] },
    ]
  },
  {
    title: 'Diminished 7th Chords',
    chords: [
      { id: 'Cdim7', notes: ['C', 'Eb', 'Gb', 'A'] },
      { id: 'C#dim7', notes: ['C#', 'E', 'G', 'A'] },
      { id: 'Ddim7', notes: ['D', 'F', 'Ab', 'B'] },
      { id: 'D#dim7', notes: ['D#', 'F#', 'A', 'B'] },
      { id: 'Edim7', notes: ['E', 'G', 'A#', 'C'] },
      { id: 'Fdim7', notes: ['F', 'Ab', 'B', 'D'] },
      { id: 'F#dim7', notes: ['F#', 'A', 'C', 'D'] },
      { id: 'Gdim7', notes: ['G', 'Bb', 'C#', 'E'] },
      { id: 'G#dim7', notes: ['G#', 'B', 'D', 'F'] },
      { id: 'Adim7', notes: ['A', 'C', 'D#', 'F'] },
      { id: 'A#dim7', notes: ['A#', 'C#', 'E', 'G'] },
      { id: 'Bdim7', notes: ['B', 'D', 'F', 'G#'] },
    ]
  },
  {
    title: 'Augmented Chords',
    chords: [
      { id: 'Caug', notes: ['C', 'E', 'G#'] },
      { id: 'C#aug', notes: ['C#', 'F', 'A'] },
      { id: 'Daug', notes: ['D', 'F#', 'A#'] },
      { id: 'D#aug', notes: ['D#', 'G', 'B'] },
      { id: 'Eaug', notes: ['E', 'G#', 'B#'] },
      { id: 'Faug', notes: ['F', 'A', 'C#'] },
      { id: 'F#aug', notes: ['F#', 'A#', 'D'] },
      { id: 'Gaug', notes: ['G', 'B', 'D#'] },
      { id: 'G#aug', notes: ['G#', 'C', 'E'] },
      { id: 'Aaug', notes: ['A', 'C#', 'F'] },
      { id: 'A#aug', notes: ['A#', 'D', 'F#'] },
      { id: 'Baug', notes: ['B', 'D#', 'F##'] },
    ]
  },
  {
    title: 'Suspended 2nd Chords',
    chords: [
      { id: 'Csus2', notes: ['C', 'D', 'G'] },
      { id: 'C#sus2', notes: ['C#', 'D#', 'G#'] },
      { id: 'Dsus2', notes: ['D', 'E', 'A'] },
      { id: 'D#sus2', notes: ['D#', 'F', 'A#'] },
      { id: 'Esus2', notes: ['E', 'F#', 'B'] },
      { id: 'Fsus2', notes: ['F', 'G', 'C'] },
      { id: 'F#sus2', notes: ['F#', 'G#', 'C#'] },
      { id: 'Gsus2', notes: ['G', 'A', 'D'] },
      { id: 'G#sus2', notes: ['G#', 'A#', 'D#'] },
      { id: 'Asus2', notes: ['A', 'B', 'E'] },
      { id: 'A#sus2', notes: ['A#', 'C', 'F'] },
      { id: 'Bsus2', notes: ['B', 'C#', 'F#'] },
    ]
  },
  {
    title: 'Suspended 4th Chords',
    chords: [
      { id: 'Csus4', notes: ['C', 'F', 'G'] },
      { id: 'C#sus4', notes: ['C#', 'F#', 'G#'] },
      { id: 'Dsus4', notes: ['D', 'G', 'A'] },
      { id: 'D#sus4', notes: ['D#', 'G#', 'A#'] },
      { id: 'Esus4', notes: ['E', 'A', 'B'] },
      { id: 'Fsus4', notes: ['F', 'Bb', 'C'] },
      { id: 'F#sus4', notes: ['F#', 'B', 'C#'] },
      { id: 'Gsus4', notes: ['G', 'C', 'D'] },
      { id: 'G#sus4', notes: ['G#', 'C#', 'D#'] },
      { id: 'Asus4', notes: ['A', 'D', 'E'] },
      { id: 'A#sus4', notes: ['A#', 'D#', 'F'] },
      { id: 'Bsus4', notes: ['B', 'E', 'F#'] },
    ]
  },
  {
    title: 'Dominant 7th Chords',
    chords: [
      { id: 'C7', notes: ['C', 'E', 'G', 'Bb'] },
      { id: 'C#7', notes: ['C#', 'F', 'G#', 'B'] },
      { id: 'D7', notes: ['D', 'F#', 'A', 'C'] },
      { id: 'D#7', notes: ['D#', 'G', 'A#', 'C#'] },
      { id: 'E7', notes: ['E', 'G#', 'B', 'D'] },
      { id: 'F7', notes: ['F', 'A', 'C', 'Eb'] },
      { id: 'F#7', notes: ['F#', 'A#', 'C#', 'E'] },
      { id: 'G7', notes: ['G', 'B', 'D', 'F'] },
      { id: 'G#7', notes: ['G#', 'C', 'D#', 'F#'] },
      { id: 'A7', notes: ['A', 'C#', 'E', 'G'] },
      { id: 'A#7', notes: ['A#', 'D', 'F', 'G#'] },
      { id: 'B7', notes: ['B', 'D#', 'F#', 'A'] },
    ]
  },
  {
    title: 'Half-Diminished (m7b5) Chords',
    chords: [
      { id: 'Cm7b5', notes: ['C', 'Eb', 'Gb', 'Bb'] },
      { id: 'C#m7b5', notes: ['C#', 'E', 'G', 'B'] },
      { id: 'Dm7b5', notes: ['D', 'F', 'Ab', 'C'] },
      { id: 'D#m7b5', notes: ['D#', 'F#', 'A', 'C#'] },
      { id: 'Em7b5', notes: ['E', 'G', 'Bb', 'D'] },
      { id: 'Fm7b5', notes: ['F', 'Ab', 'B', 'D'] },
      { id: 'F#m7b5', notes: ['F#', 'A', 'C', 'E'] },
      { id: 'Gm7b5', notes: ['G', 'Bb', 'C', 'F'] },
      { id: 'G#m7b5', notes: ['G#', 'B', 'D', 'F#'] },
      { id: 'Am7b5', notes: ['A', 'C', 'Eb', 'G'] },
      { id: 'A#m7b5', notes: ['A#', 'C#', 'E', 'G#'] },
      { id: 'Bm7b5', notes: ['B', 'D', 'F', 'A'] },
    ]
  },
  {
    title: 'Major 6th Chords',
    chords: [
      { id: 'C6', notes: ['C', 'E', 'G', 'A'] },
      { id: 'C#6', notes: ['C#', 'F', 'G#', 'A#'] },
      { id: 'D6', notes: ['D', 'F#', 'A', 'B'] },
      { id: 'D#6', notes: ['D#', 'G', 'A#', 'B#'] },
      { id: 'E6', notes: ['E', 'G#', 'B', 'C#'] },
      { id: 'F6', notes: ['F', 'A', 'C', 'D'] },
      { id: 'F#6', notes: ['F#', 'A#', 'C#', 'D#'] },
      { id: 'G6', notes: ['G', 'B', 'D', 'E'] },
      { id: 'G#6', notes: ['G#', 'C', 'D#', 'F'] },
      { id: 'A6', notes: ['A', 'C#', 'E', 'F#'] },
      { id: 'A#6', notes: ['A#', 'D', 'F', 'G'] },
      { id: 'B6', notes: ['B', 'D#', 'F#', 'G#'] },
    ]
  },
  {
    title: 'Minor 6th Chords',
    chords: [
      { id: 'Cm6', notes: ['C', 'Eb', 'G', 'A'] },
      { id: 'C#m6', notes: ['C#', 'E', 'G#', 'A#'] },
      { id: 'Dm6', notes: ['D', 'F', 'A', 'B'] },
      { id: 'D#m6', notes: ['D#', 'F#', 'A#', 'B'] },
      { id: 'Em6', notes: ['E', 'G', 'B', 'C#'] },
      { id: 'Fm6', notes: ['F', 'Ab', 'C', 'D'] },
      { id: 'F#m6', notes: ['F#', 'A', 'C#', 'D#'] },
      { id: 'Gm6', notes: ['G', 'Bb', 'D', 'E'] },
      { id: 'G#m6', notes: ['G#', 'B', 'D#', 'F#'] },
      { id: 'Am6', notes: ['A', 'C', 'E', 'F#'] },
      { id: 'A#m6', notes: ['A#', 'C#', 'F', 'G'] },
      { id: 'Bm6', notes: ['B', 'D', 'F#', 'G#'] },
    ]
  }
];
