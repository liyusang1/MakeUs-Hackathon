module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/sign-up').post(user.signUp);
    app.route('/sign-in').post(user.signIn);

    app.post('/d-day', jwtMiddleware, user.setDday);

    app.post('/email',user.sendEmail);

    app.post('/key',user.checkKey);

    app.patch('/password',user.updatePassword);

    app.post('/report/:contentsId',jwtMiddleware,user.addReport);

    app.patch('/contents/:contentsId/like',jwtMiddleware,user.like);


   // app.get('/check', jwtMiddleware, user.check);
};