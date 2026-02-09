export interface BibleBook {
  _id: string;
  name: string;
  abbrev: string;
  chapters: string[][]; // Array of chapters, each chapter is an array of verses (strings)
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleReference {
  book: string;
  chapter: number;
  verse?: number;
}
