module.exports = function(app){
    const contents = require('../controllers/contentsController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/contents',jwtMiddleware,contents.insertcontents);//코킷리스트생성
    app.patch('/contents/:contentsId',jwtMiddleware,contents.deletecontents);//코킷리스트삭제
    app.get('/contents',jwtMiddleware,contents.getcontents);//코킷리스트조회
    app.post('/contents/:contentsId/share',jwtMiddleware,contents.sharecontents); //코킷리스트공유
    app.get('/contents/share',jwtMiddleware,contents.getsharecontents);//사람들이공유한코킷리스트조회
    

};
