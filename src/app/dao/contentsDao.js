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
//코킷리스트삭제
async function deletecontentsInfo(userId,contentsId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const  deletecontentsQuery = `
  update ListContents
set status=-1
where contentsId = '${contentsId}' and userId='${userId}';
  `;

  const [deletecontentsrows] = await connection.query(
    deletecontentsQuery,
    
  );
  connection.release();

  return deletecontentsrows;
}
//코킷리스트조회
async function getcontentsInfo(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const  getcontentsQuery = `
  select contentsId,
       contents
      from ListContents
where status = 1 or status = 2 and userId ='${userId}';
  `;

  const [getcontentsrows] = await connection.query(
    getcontentsQuery,
    
  );
  connection.release();

  return getcontentsrows;
}
//코킷리스트공유
async function sharecontentsInfo(userId,contentsId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const  sharecontentsQuery = `
update ListContents
set status=2
where contentsId = '${contentsId}' and userID ='${userId}';
  `;

  const [sharecontentsrows] = await connection.query(
    sharecontentsQuery,
    
  );
  connection.release();

  return sharecontentsrows;
}
//공유된코킷리스트조회
async function getsharecontentsInfo() {
  const connection = await pool.getConnection(async (conn) => conn);
  const  sharecontentsQuery = `
update ListContents
set status=2
where contentsId = '${contentsId}' and userID ='${userId}';
  `;

  const [sharecontentsrows] = await connection.query(
    sharecontentsQuery,
    
  );
  connection.release();

  return sharecontentsrows;
}
module.exports = {
  insertcontentsInfo,
  deletecontentsInfo,
  getcontentsInfo,
  sharecontentsInfo,
  getsharecontentsInfo
};
