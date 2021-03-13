const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const contentsDao = require('../dao/contentsDao');

//코킷리스트생성
exports.insertcontents = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const contents = req.body.contents;
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const insertcontentsParams = [userId,contents];
        const insertcontentsRows = await contentsDao.insertcontentsInfo(insertcontentsParams);
        
        res.json({
            isSuccess: true,
            code: 100,
            message: userId+"번 유저 코킷리스트생성성공",
            data : "생성된 코킷리스트 번호 : "+ insertcontentsRows.insertId
        });
        connection.release();

        } catch (err) {
            // await connection.rollback(); // ROLLBACK
            connection.release();
            logger.error(`코킷리스트생성 에러\n: ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
        }
};
//코킷리스트삭제
exports.deletecontents = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const contentsId = req.params.contentsId;
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const deletecontentsRows = await contentsDao.deletecontentsInfo(userId,contentsId);
        res.json({
            isSuccess: true,
            code: 100,
            message: "코킷리스트삭제성공",
        });
        connection.release();

        } catch (err) {
            // await connection.rollback(); // ROLLBACK
        //connection.release();
            logger.error(`코킷리스트삭제 에러\n: ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
        }
};
//코킷리스트조회
exports.getcontents = async function (req, res) {
    const userId = req.verifiedToken.userId;
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getcontentsRows = await contentsDao.getcontentsInfo(userId);
        
        res.json({
            isSuccess: true,
            code: 100,
            message: userId +"번유저 코킷리스트조회성공",
            data : getcontentsRows
            
        });
        connection.release();

        } catch (err) {
            // await connection.rollback(); // ROLLBACK
            connection.release();
            logger.error(`코킷리스트조회 에러\n: ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
        }
};
//코킷리스트공유
exports.sharecontents = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const contentsId = req.params.contentsId;
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const sharecontentsRows = await contentsDao.sharecontentsInfo(userId,contentsId);
        
        res.json({
            isSuccess: true,
            code: 100,
            message: "코킷리스트공유성공",
            
        });
        connection.release();

        } catch (err) {
            // await connection.rollback(); // ROLLBACK
            connection.release();
            logger.error(`코킷리스트공유 에러\n: ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
        }
};
//사용자들이공유한코킷리스트조회
exports.getsharecontents = async function (req, res) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getsharecontentsRows = await contentsDao.getsharecontentsInfo();
        
        res.json({
            isSuccess: true,
            code: 100,
            message: "공유된 코킷리스트조회성공",
            data : getsharecontentsRows
            
        });
        connection.release();

        } catch (err) {
            // await connection.rollback(); // ROLLBACK
            connection.release();
            logger.error(`공유된 코킷리스트조회 에러\n: ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
        }
};
