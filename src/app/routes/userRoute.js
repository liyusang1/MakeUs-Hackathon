module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/sign-up').post(user.signUp);
    app.route('/sign-in').post(user.signIn);

    //app.post('/d-day', jwtMiddleware, user.setDday);

   // app.get('/check', jwtMiddleware, user.check);
};