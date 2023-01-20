import {
    Get,
    Post,
    Controller,
    Delete,
    Patch,
    UseGuards,
    Param,
    ParseIntPipe,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) {}

    @Get()
    getBookmarks(@GetUser('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId);
    }

    @Get(':id')
    getBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
    ) {
        return this.bookmarkService.getBookmarkById(userId, bookmarkId);
    }

    @Post()
    async createBookmark(
        @GetUser('id') userId: number,
        @Body() createBookmarkDto: CreateBookmarkDto,
    ) {
        return await this.bookmarkService.createBookmark(
            userId,
            createBookmarkDto,
        );
    }

    @Patch(':id')
    async editBookmark(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body() editBookmarkDto: EditBookmarkDto,
    ) {
        return await this.bookmarkService.editBookmark(
            userId,
            bookmarkId,
            editBookmarkDto,
        );
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
    ) {
        return this.bookmarkService.deleteBookmark(userId, bookmarkId);
    }
}
