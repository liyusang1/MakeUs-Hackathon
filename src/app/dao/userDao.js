const { pool } = require("../../../config/database");

// 로그인 이메일 체크
async function userEmailCheck(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `
                SELECT userEmail, userName
                FROM Users 
                WHERE userEmail = ?;
                `;
  const selectEmailParams = [email];
  const [emailRows] = await connection.query(
    selectEmailQuery,
    selectEmailParams
  );
  connection.release();

  return emailRows;
}

//닉네임 중복 체크
async function userNicknameCheck(nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectNicknameQuery = `
                SELECT userEmail, userName 
                FROM Users 
                WHERE userName = ?;
                `;
  const selectNicknameParams = [nickname];
  const [nicknameRows] = await connection.query(
    selectNicknameQuery,
    selectNicknameParams
  );
  connection.release();
  return nicknameRows;
}

//유저정보 insert query
async function insertUserInfo(insertUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertUserInfoQuery = `
        INSERT INTO Users(userEmail, userPassword, userName)
        VALUES (?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );
  connection.release();
  return insertUserInfoRow;
}

//로그인
async function selectUserInfo(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
                SELECT userId, userEmail , userPassword, userName, status 
                FROM Users
                WHERE userEmail = ?;
                `;

  let selectUserInfoParams = [email];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [userInfoRows];
}

//유저 디데이 설정
async function setDday(setDdayParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const setDdayQuery = `

  update Users set userDday = ? where userId = ?;
  
                `;

  const [setDdayRows] = await connection.query(
    setDdayQuery,
    setDdayParams
  );
  connection.release();
  return [setDdayRows];
}

//임시키를 db에 저장
async function updateUserPasswordInfo(newInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateUserPasswordInfoQuery = `

  update Users
       set findKey = ? where userId = ?;
  
                `;

  const [updateUserPasswordRows] = await connection.query(
    updateUserPasswordInfoQuery,
    newInfoParams
  );
  connection.release();
  return updateUserPasswordRows;
}

//같은키가 있는지 체크
async function findSameKey(randomPassword) {
  const connection = await pool.getConnection(async (conn) => conn);
  const findSameKeyQuery = `

  select userId from Users where findKey = ?
  
                `;

  const [findSameKeyRows] = await connection.query(
    findSameKeyQuery,
    randomPassword
  );
  connection.release();
  return findSameKeyRows;
}

module.exports = {
  userEmailCheck,
  userNicknameCheck,
  insertUserInfo,
  selectUserInfo,
  setDday,
  updateUserPasswordInfo,
  findSameKey,
};
