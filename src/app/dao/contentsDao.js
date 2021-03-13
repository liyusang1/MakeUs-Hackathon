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
where userId ='${userId}';
  `;

  const [getcontentsrows] = await connection.query(
    getcontentsQuery,
    
  );
  connection.release();

  return getcontentsrows;
}
//유저디데이조회
async function getuserddayInfo(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const  getuserddayQuery = `
  select userId,
       userName,
       concat((to_days(userDday)-to_days(current_date())),'일 뒤에는...!') as'userdday'
from Users
where userId = '${userId}';
  `;

  const [getuserddayrows] = await connection.query(
    getuserddayQuery,
    
  );
  connection.release();

  return getuserddayrows;
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
//정렬기준변수설정
async function setSort(sort){
  const connection = await pool.getConnection(async (conn) => conn);
  const  setSortQuery = `
    set @sort := ?;
  `;

  const [setSortrows] = await connection.query(
    setSortQuery,
    sort
  );
  connection.release();
  return setSortrows;
}
//공유된코킷리스트조회
async function getsharecontentsInfo(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const  sharecontentsQuery = `
  select ListContents.userId,
       userName,
       ListContents.contentsId,
       contents,
       likeCount,
       date_format(ListContents.createdAt, '%Y.%m.%d') as 'time',
       ifnull(isLike,0) as isLike
from ListContents
inner join Users on Users.userId = ListContents.userId
left join (select count(ListLike.contentsId) as likeCount,
                  status,ListLike.contentsId
from ListLike where status= 1 group by ListLike.contentsId)좋아요 on ListContents.contentsId = 좋아요.contentsId
left outer join (select contentsId, count(*) as isLike from ListLike where userId ='${userId}'  and status = 1
        group by contentsId) BookMark
        on BookMark.contentsId = ListContents.contentsId
where ListContents.status=2
order by case
    when @sort = 1 then likeCount
    when @sort = 2 then ListContents.createdAt
    end
 desc;
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
  getsharecontentsInfo,
  getuserddayInfo,
  setSort
  
};
