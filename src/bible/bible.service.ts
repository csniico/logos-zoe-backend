/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'path';
import Nedb from 'nedb';
import { newTestamentSorted, oldTestamentSorted } from './utils/testaments';

const kjvBibleDB = new Nedb({
  filename: path.join(__dirname, '../data/en_kjv.db'),
  autoload: true,
});

@Injectable()
export class BibleService {
  async getBooks(key: 'all' | 'new' | 'old') {
    const doc: any = await new Promise((resolve, reject) => {
      kjvBibleDB.find({}, (err, docs) => {
        if (err) {
          console.log('Error ocurred while fetching books: ', err);
          reject(err);
        }
        try {
          let books = docs.map((doc) => doc.name);
          switch (key) {
            case 'old':
              books = books
                .filter((book) => oldTestamentSorted.includes(book))
                .sort(
                  (a, b) =>
                    oldTestamentSorted.indexOf(a) -
                    oldTestamentSorted.indexOf(b),
                );
              break;
            case 'new':
              books = books
                .filter((book) => newTestamentSorted.includes(book))
                .sort(
                  (a, b) =>
                    newTestamentSorted.indexOf(a) -
                    newTestamentSorted.indexOf(b),
                );
              break;
            case 'all':
              break;

            default:
              break;
          }
          resolve(books);
        } catch (error) {
          console.error('Error while processing books: ', error);
          reject(error);
        }
      });
    });
    return doc;
  }

  async getBook(book_name: string) {
    const doc: any = await new Promise((resolve, reject) => {
      kjvBibleDB.findOne({ name: book_name }, (err, docs) => {
        if (err) {
          console.log('Error ocurred while fetching book: ', err);
          reject(err);
        }
        try {
          const payload = {
            name: docs.name,
            abbrev: docs.abbrev,
            chapters: docs.chapters.length,
            _id: docs._id,
          };
          resolve(payload);
        } catch (error) {
          console.error('Error while processing book: ', error);
          reject(error);
        }
      });
    });
    return doc;
  }

  async getChapter(book_name: string, chapter: number) {
    const doc: any = await new Promise((resolve, reject) => {
      kjvBibleDB.findOne({ name: book_name.trim() }, (err, docs) => {
        if (err) {
          console.log('Error ocurred while fetching chapter: ', err);
          reject(err);
        }
        try {
          const payload = {
            name: docs.name,
            abbrev: docs.abbrev,
            chapter: Number(chapter),
            verses: docs.chapters[chapter - 1],
          };
          resolve(payload);
        } catch (error) {
          console.error('Error while processing chapter: ', error);
          reject(error);
        }
      });
    });
    return doc;
  }
}
