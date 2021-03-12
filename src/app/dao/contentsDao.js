const { pool } = require("../../../config/database");

// 코킷리스트생성
async function insertcontentsInfo(insertcontentsParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertcontentsQuery = `
  insert into ListContents(userId, contents, createdAt, updatedAt, status)
values (?,?,default,default,default);
  `;

  const [insertcontentsrows] = await connection.query(
    insertcontentsQuery,
    insertcontentsParams
  );
  connection.release();

  return insertcontentsrows;
}
module.exports = {
  insertcontentsInfo
};
