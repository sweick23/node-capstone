const faker = require('faker');
const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');


const {
    DATBASE_URL
} = require('../config');
const {
    app,
    runServer,
    closeServer
} = require('../server');
const {
    BlogPost
} = require('../model');
const {
    TEST_DATABASE_URL
} = require('../config');

const should = chai.should();

chai.use(chaiHttp);


function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn('Deleting Database');
        mongoose.connection.dropDatabase()
            .then(result => resolve(result))
            .catch(err => reject(err))

    });
}


function addBlogPostData() {
    console.info('Adding data to blog post');
    const addData = [];
    for (let i = 0; i < 10; i++) {
        addData.push({
            author: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName()
            },
            title: faker.lorem.sentence(),
            content: faker.lorem.text()
        });
    }
    return BlogPost.insertMany(addData);
}









describe('BlogPost', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return addBlogPostData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('Get endpoint', function() {

        it('should return all existing data', function() {

            return chai.request(app)
                .get('/blogpost')
                .then(res => {

                    res.should.have.status(200);
                    res.body.blogposts.should.have.length.of.at.least(1);
                    BlogPost.count()
                        .then(count => {

                            res.body.should.have.length.of(count);
                        });
                });
        });

        it('should return posts with right fields', function() {


            let resPost;
						BlogPost
						.find()
						.exec()
						.then(function(_blogposts){
							resPost = _blogposts[0];
							return chai.request(app).get('/blogpost/${resPost.id}')
						})

                .then(function(res) {

                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.forEach(function(res) {
                        res.should.be.a('array');
                        res.should.include.keys('id', 'title', 'content', 'author', 'created');
                    });

                    resPost = res.body[0];
                    return BlogPost.findById(resPost.id).exec();
                })
                .then(post => {
                    resPost.title.should.equal(post.title);
                    resPost.content.should.equal(post.content);
                    resPost.author.should.equal(post.authorName);
                });
        });
    });

    describe('POST endpoint', function() {

        it('should add a new blog post', function() {

            const addPost = {
                title: faker.lorem.sentence(),
                author: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                },
                content: faker.lorem.text()
            };

            return chai.request(app)
                .post('/blogpost')
                .send(addPost)
                .then(function(res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys(
                        'id', 'title', 'content', 'author', 'created');
                    res.body.title.should.equal(addPost.title);

                    res.body.id.should.not.be.null;
                    res.body.author.should.equal(
                        `${addPost.author.firstName} ${addPost.author.lastName}`);
                    res.body.content.should.equal(addPost.content);
                    return BlogPost.findById(res.body.id).exec();
                })
                .then(function(add) {
                    add.title.should.equal(addPost.title);
                    add.content.should.equal(addPost.content);
                    add.author.firstName.should.equal(addPost.author.firstName);
                    add.author.lastName.should.equal(addPost.author.lastName);
                });
        });
    });

    describe('PUT endpoint', function() {


        it('should update fields when new content is added', function() {
            const addingNewPost = {
                title: 'One sunny day',
                content: 'I took my kids to the zoo on a sunny day.',
                author: {
                    firstName: 'Tayten',
                    lastName: 'Weickum'
                }
            };
						let resPost;
            BlogPost
                .findOne()
                .exec()
                .then(function(_blogpost) {
                  resPost  = _blogpost[0];
								return chai.request(app)
                	.put(`/blogpost/${resPost.id}`)
                	.send(addingNewPost);
                })
                .then(function(res){
                    res.should.have.status(204);
										res.should.be.json;
										res.body.should.be.a('object');
                    return BlogPost.findById(res.body.id).exec();
                })
                .then(function(blogpost) {
                    blogpost.title.should.equal(addingNewPost.title);
                    blogpost.content.should.equal(addingNewPost.content);
                    blogpost.author.firstName.should.equal(addingNewPost.author.firstName);
                    blogpost.author.lastName.should.equal(addingNewPost.author.lastName);
                });
        });
    });

    describe('DELETE endpoint', function() {

        it('should delete a post by id', function() {

            let remove;

            return BlogPost
                .findOne()
                .exec()
                .then(_remove => {
                    remove = _remove;
                    return chai.request(app).delete(`/blogpost/${remove.id}`);
                })
                .then(res => {
                    res.should.have.status(204);
                    return BlogPost.findById(remove.id);
                })
                .then(_post => {

                    should.not.exist(_post);
                });
        });
    });
});
