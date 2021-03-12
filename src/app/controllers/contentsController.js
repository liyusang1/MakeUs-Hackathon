const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const contentsDao = require('../dao/contentsDao');

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
            message: "코킷리스트생성성공",
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