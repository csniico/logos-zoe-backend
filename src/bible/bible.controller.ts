import { Controller, Get, Param, Query } from '@nestjs/common';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import { BibleService } from './bible.service';
import { GetBooksDto } from './dto/getbooks.dto';
import { PublicRoute } from 'src/auth/decorators/public.decorator';

@PublicRoute()
@Controller(`${API_VERSION_SCHEME}/bible`)
@Controller('bible')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @Get('/books')
  getBooks(@Query() query: GetBooksDto) {
    return this.bibleService.getBooks(query.key);
  }

  @Get('/book/')
  getBook(@Query('book_name') book_name: string) {
    return this.bibleService.getBook(book_name);
  }

  @Get('/books/:book_name/chapter')
  getChapter(
    @Param('book_name') book_name: string,
    @Query('chapter') chapter: number,
  ) {
    return this.bibleService.getChapter(book_name, chapter);
  }
}
