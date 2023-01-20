import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
            }),
        );

        await app.init();
        await app.listen(3333);

        prisma = await app.get(PrismaService);
        await prisma.cleanDb();
        pactum.request.setBaseUrl('http://localhost:3333');
    });

    afterAll(() => {
        app.close();
    });

    describe('Auth', () => {
        describe('Signup', () => {
            it('should throw an error with empty email', () => {
                const authdto: AuthDto = {
                    email: '',
                    password: '123',
                };
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody(authdto)
                    .expectStatus(400);
            });

            it('should throw an error with empty password', () => {
                const authdto: AuthDto = {
                    email: 'klindzhev@gmail.com',
                    password: '',
                };
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody(authdto)
                    .expectStatus(400);
            });
            it('body is not provided', () => {
                return pactum.spec().post('/auth/signup').expectStatus(400);
            });

            it('should signup', () => {
                const authdto: AuthDto = {
                    email: 'klindzhev@gmail.com',
                    password: '123',
                };
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody(authdto)
                    .expectStatus(201);
            });
        });

        describe('Signin', () => {
            it('should throw an error with empty email', () => {
                const authdto: AuthDto = {
                    email: '',
                    password: '123',
                };
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody(authdto)
                    .expectStatus(400);
            });

            it('should throw an error with empty password', () => {
                const authdto: AuthDto = {
                    email: 'klindzhev@gmail.com',
                    password: '',
                };
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody(authdto)
                    .expectStatus(400);
            });

            it('body is not provided', () => {
                return pactum.spec().post('/auth/signin').expectStatus(400);
            });

            it('should signin', () => {
                const authdto: AuthDto = {
                    email: 'klindzhev@gmail.com',
                    password: '123',
                };
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody(authdto)
                    .expectStatus(200)
                    .stores('accessToken', 'access_token');
            });
        });
    });

    describe('User', () => {
        describe('Get self', () => {
            it('should get current user', () => {
                return pactum
                    .spec()
                    .get('/users/get-self')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}',
                    })
                    .expectStatus(200);
            });
        });

        describe('Edit user', () => {
            it('should edit user', () => {
                const editUserDto: EditUserDto = {
                    firstName: 'Rinus',
                    email: 'klindzhevr7@gmail.com',
                };

                return pactum
                    .spec()
                    .patch('/users/edit')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}',
                    })
                    .withBody(editUserDto)
                    .expectStatus(200)
                    .expectBodyContains(editUserDto.firstName)
                    .expectBodyContains(editUserDto.email);
            });
        });
    });

    describe('Bookmark', () => {
        describe('Get empty bookmarks', () => {
            it('Should get bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}',
                    })
                    .expectStatus(200)
                    .expectBody([]);
            });
        });
        describe('Create bookmarks', () => {
            const createBookmarkDto: CreateBookmarkDto = {
                title: 'Rust Tokio',
                description: 'Rust tokio documentation',
                link: 'https://docs.rs/tokio/1.24.1/tokio/io/trait.AsyncWriteExt.html#method.write_u8',
            };
            it('Should get bookmarks', () => {
                return pactum
                    .spec()
                    .post('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}',
                    })
                    .withBody(createBookmarkDto)
                    .expectStatus(201)
                    .stores('bookmarkId', 'id');
            });
        });

        describe('Get bookmarks', () => {
            it('should get bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}',
                    })
                    .expectStatus(200)
                    .expectJsonLength(1);
            });
        });

        describe('Get bookmark by id', () => {
            it('should get bookmark by id', () => {
                return pactum
                    .spec()
                    .get('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}',
                    })
                    .expectStatus(200)
                    .expectBodyContains('$S{bookmarkId}');
            });
        });

        describe('Edit bookmark', () => {
            const editBookmarkDto: EditBookmarkDto = {
                title: 'This is the tokio docs',
            };
            it('should update bookmark by id', () => {
                return pactum
                    .spec()
                    .patch('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}',
                    })
                    .withBody(editBookmarkDto)
                    .expectStatus(200)
                    .expectBodyContains(editBookmarkDto.title);
            });
        });

        describe('Delete bookmark', () => {
            it('should delete bookmark by id', () => {
                return pactum
                    .spec()
                    .delete('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}',
                    })
                    .expectStatus(204);
            });

            it('should get bookmark by id', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{accessToken}',
                    })
                    .expectStatus(200)
                    .expectJsonLength(0);
            });
        });
    });
});
