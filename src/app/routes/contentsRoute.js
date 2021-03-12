module.exports = function(app){
    const contents = require('../controllers/contentsController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/contents', jwtMiddleware,contents.insertcontents);
};
