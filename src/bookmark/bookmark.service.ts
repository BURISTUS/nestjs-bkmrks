import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) {}

    getBookmarks(userId: number) {
        return this.prisma.bookmark.findMany({
            where: {
                userId,
            },
        });
    }

    getBookmarkById(userId: number, bookmarkId: number) {
        return this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
                userId,
            },
        });
    }

    async createBookmark(userId: number, createBookmarkDto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId,
                ...createBookmarkDto,
            },
        });

        return bookmark;
    }

    async editBookmark(
        userId: number,
        bookmarkId: number,
        editBookmarkDto: EditBookmarkDto,
    ) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId,
            },
        });

        if (!bookmark || bookmark.userId != userId) {
            throw new ForbiddenException('Access denied');
        }

        return this.prisma.bookmark.update({
            where: {
                id: bookmarkId,
            },
            data: {
                ...editBookmarkDto,
            },
        });
    }

    async deleteBookmark(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId,
            },
        });

        // check if user owns the bookmark
        if (!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException('Access to resources denied');

        await this.prisma.bookmark.delete({
            where: {
                id: bookmarkId,
            },
        });
    }
}
