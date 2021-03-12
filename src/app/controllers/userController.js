const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const userDao = require('../dao/userDao');
const { constants } = require('buffer');

///회원가입 API
exports.signUp = async function (req, res) {
    const {
        email, password,passwordCheck,userName
    } = req.body;

    if (!email) return res.json({isSuccess: false, code: 2000, message: "이메일을 입력해주세요"});

    if (email.length > 30) return res.json({
        isSuccess: false,
        code: 2001,
        message: "이메일은 30자리 미만으로 입력해주세요"
    });

    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 2002, message: "이메일을 형식을 정확하게 입력해주세요"});

    if (!password) return res.json({isSuccess: false, code: 2003, message: "비밀번호를 입력 해주세요"});

    if (password.length < 4 || password.length > 16) return res.json({
        isSuccess: false,
        code: 2004,
        message: "비밀번호는 4자 이상 16자 이하로 입력해주세요"
    });

    if (!passwordCheck) return res.json({isSuccess: false, code: 2005, message: "비밀번호를 한번 더 입력해주세요"});

    if (passwordCheck !== password) return res.json({isSuccess: false, code: 2006, message: "비밀번호가 맞지 않습니다"});

    if (!userName) return res.json({isSuccess: false, code: 2007, message: "닉네임을 입력 해주세요"});

    if (!/^([a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]).{0,7}$/.test(userName))
    return res.json({
      isSuccess: false,
      code: 2009,
      message: "닉네임은 1~8자로 구성되어야 합니다.",
    });

    //특수문자 또는 공백 Validation
    var checkSpc = /[~!@#$%^&*()_+|<>?:{}]/gi;

    if (userName.search(/\s/) != -1 ||checkSpc.test(userName) ==true )
    return res.json({
        isSuccess: false,
        code: 2010,
        message: "닉네임에는 공백 또는 특수문자를 입력할 수 없습니다.",
      });

        try {
            // 이메일 중복 확인
            const emailRows = await userDao.userEmailCheck(email);
            if (emailRows.length > 0) {

                return res.json({
                    isSuccess: false,
                    code: 3000,
                    message: "사용 불가능한 이메일입니다"
                });
            }

            // 닉네임 중복 확인
            const nicknameRows = await userDao.userNicknameCheck(userName);
            if (nicknameRows.length > 0) {
                return res.json({
                    isSuccess: false,
                    code: 3001,
                    message: "이미 사용중인 닉네임입니다"
                });
            }

            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            const insertUserInfoParams = [email, hashedPassword, userName];
            
            const insertUserRows = await userDao.insertUserInfo(insertUserInfoParams);

            return res.json({
                isSuccess: true,
                code: 1000,
                message: "회원가입 성공"
            });
        } catch (err) {
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(2010).send(`Error: ${err.message}`);
        }
};

//로그인
exports.signIn = async function (req, res) {
    const {
        email, password
    } = req.body;

    if (!email) return res.json({isSuccess: false, code: 2000, message: "이메일을 입력해주세요."});

    if (email.length > 30) return res.json({
        isSuccess: false,
        code: 2001,
        message: "이메일은 30자리 미만으로 입력해주세요."
    });

    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 2002, message: "이메일을 형식을 정확하게 입력해주세요"});

    if (!password) return res.json({isSuccess: false, code: 2003, message: "비밀번호를 입력 해주세요."});

        try {
            const [userInfoRows] = await userDao.selectUserInfo(email)

            if (userInfoRows.length < 1) {
               
                return res.json({
                    isSuccess: false,
                    code: 3000,
                    message: "존재하지 않는 아이디 입니다."
                });
            }

            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            if (userInfoRows[0].userPassword !== hashedPassword) {
            
                return res.json({
                    isSuccess: false,
                    code: 3001,
                    message: "비밀번호를 확인해주세요."
                });
            }
            if (userInfoRows[0].status === 0) {
             
                return res.json({
                    isSuccess: false,
                    code: 3002,
                    message: "비활성화 된 계정입니다. 고객센터에 문의해주세요."
                });
            } 
            //토큰 생성
            let token = await jwt.sign({
                    userId: userInfoRows[0].userId,
                    userName: userInfoRows[0].userName,
                    //userEmail: userInfoRows[0].userEmail,
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
            );

            res.json({
                jwt: token,
                isSuccess: true,
                code: 1000,
                message: "로그인 성공 : "+userInfoRows[0].userName
            });
            
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            return res.status(2010).send(`Error: ${err.message}`);
        }
};

//디데이 설정
exports.setDday = async function (req, res) {

    const{userDday} = req.body;

    //유저인덱스
    const {userId} = req.verifiedToken;

    if (!userDday) return res.json({isSuccess: false, code: 2000, message: "userDday를 입력해주세요."});

         try {
           
           const setDdayParams = [userDday,userId]
           const [setDdayRows] = await userDao.setDday(setDdayParams);

             return res.json({
                 isSuccess: true,
                 code: 1000,
                 message: "user Dday 등록 성공"
             });
         } catch (err) {
             logger.error(`App - setDday Query error\n: ${err.message}`);
             return res.status(2010).send(`Error: ${err.message}`);
         }
 };

// 토큰 검증
exports.check = async function (req, res) {
    res.json({
        isSuccess: true,
        code: 1000,
        message: "검증 성공",
        info: req.verifiedToken
    })
};
