const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const nodemailer = require('nodemailer');

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

    const{userDay} = req.body;

    //유저인덱스
    const {userId} = req.verifiedToken;

    if (!userDay) return res.json({isSuccess: false, code: 2000, message: "userDay를 입력해주세요."});

    if(!/^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/.test(userDay))
    return res.json({isSuccess: false, code:2001, 
        message: "올바른 날짜가 아닙니다. 유효한 날짜를 입력해 주세요."});

         try {
           
           const setDdayParams = [userDay,userId]
           const [setDdayRows] = await userDao.setDday(setDdayParams);

             return res.json({
                 isSuccess: true,
                 code: 1000,
                 message: "코로나 디데이 등록 성공"
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

//비밀 번호 찾기
exports.sendEmail= async function (req, res) {

    //클라이언트로 부터 찾고자 하는 이메일을 입력 받음
    const {email} = req.body;

    if (!email) return res.json({
        isSuccess: false,
        code: 2000,
        message: "이메일을 입력해 주세요."
    });

    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 2003, message: "이메일 형식을 정확하게 입력해주세요"});

    //DB에 존재하는 유저의 이메일인지 검토
    const [userInfoRows] = await userDao.selectUserInfo(email)
        
    if (userInfoRows.length == 0) return res.json({
        isSuccess: false,
        code: 3001,
        message: "가입되지 않은 이메일 입니다."
    });

    //임시키를 랜덤 생성 할 변수
    let variable = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(",");

    //임시키를 랜덤 생성해서 db에 임시적으로 저장
    let randomPassword = createRandomPassword(variable, 8);

    //비밀번호 랜덤 생성 함수
    function createRandomPassword(variable, passwordLength) {
        let randomString = "";
          for (let j=0; j<passwordLength; j++) 
            randomString += variable[Math.floor(Math.random()*variable.length)];
            return randomString
        }

    try {
        if (userInfoRows.length != 0){

        let userId = userInfoRows[0].userId
     
        //임시 키를 db에 저장
        const newInfoParams = [randomPassword,userId]; 
        const newUserInfoRows = await userDao.updateUserPasswordInfo(newInfoParams)

        const findSameKeyRows = await userDao.findSameKey(randomPassword)
        if(findSameKeyRows.length != 0){
            randomPassword = createRandomPassword(variable, 8);
        }

        //유저에게 메일 전송
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            // 이메일을 보낼 계정 데이터 값 입력
            auth: { 
              user: 'coketlist@gmail.com',
              pass: secret_config.gmailPassword,
            },
          });
        // 옵션값 설정
         const emailOptions = { 
              from: 'coketlist@gmail.com',
              to:email,
              subject: '코킷리스트에서 ' + userInfoRows[0].userName+ '님께 임시번호를 알려드립니다.',
              html: 
              "<h1 >'코킷리스트'에서 임시 번호를 알려드립니다.</h1> <h2> 임시번호 : " + randomPassword + "</h2>"
              +'<h3 style="color: crimson;">임시번호를 통해서 비밀번호를 꼭 재설정 해 주세요.</h3>'
              //+'<img src="https://firebasestorage.googleapis.com/v0/b/mangoplate-a1a46.appspot.com/o/mailImg.png?alt=media&token=75e07db2-5aa6-4cb2-809d-776ba037fdec">'		
              ,
            };
            //전송
            transporter.sendMail(emailOptions, res); 
        
        return res.json({
            isSuccess: true,
            code: 1000,
            message: "임시번호를 "+email+"으로 발송했습니다. 확인해 주세요."
        });
    }
     
    return res.json({
        isSuccess: false,
        code: 3000,
        message: "에러 발생"
    });
        
    } catch (err) {
        logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
        return res.status(2010).send(`Error: ${err.message}`);
    }
};

//임시번호 확인
exports.checkKey = async function (req, res) {

    const{key} = req.body;

    if (!key) return res.json({isSuccess: false, code: 2000, message: "key를 입력해주세요."});

         try {

            let randomPassword = key;
            
            const findSameKeyRows = await userDao.findSameKey(randomPassword)

            if(findSameKeyRows.length == 0)
            return res.json({
                isSuccess: false,
                code: 3000,
                message: "올바르지 않은 키 입니다."
            });

            else
             return res.json({
                 isSuccess: true,
                 code: 1000,
                 userId : findSameKeyRows[0].userId,
                 message: "임시번호 확인 성공"
             });
         } catch (err) {
             logger.error(`App - setDday Query error\n: ${err.message}`);
             return res.status(2010).send(`Error: ${err.message}`);
         }
 };

//비밀번호 재설정
exports.updatePassword = async function (req, res) {
    const {
        userId,password,passwordCheck
    } = req.body;

    if (!userId) return res.json({isSuccess: false, code: 2002, message: "userId를 입력해 주세요."});

    if (!password) return res.json({isSuccess: false, code: 2003, message: "비밀번호를 입력 해주세요"});

    if (password.length < 4 || password.length > 16) return res.json({
        isSuccess: false,
        code: 2004,
        message: "비밀번호는 4자 이상 16자 이하로 입력해주세요"
    });

    if (!passwordCheck) return res.json({isSuccess: false, code: 2005, message: "비밀번호를 한번 더 입력해주세요"});

    if (passwordCheck !== password) return res.json({isSuccess: false, code: 2006, message: "비밀번호가 맞지 않습니다"});

        try {
    
            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            const insertUserInfoParams = [hashedPassword,userId];
            
            const updatePasswordRows = await userDao.updatePassword(insertUserInfoParams);

            return res.json({
                isSuccess: true,
                code: 1000,
                message: "비밀번호 변경 성공"
            });
        } catch (err) {
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(2010).send(`Error: ${err.message}`);
        }
};

//신고하기
exports.addReport = async function (req, res) {

    const{contentsId} = req.params;

    //유저인덱스
    const {userId} = req.verifiedToken;
    
    if(!contentsId)
    return res.json({
        isSuccess: false,
        code: 2000,
        message: "contentsId를 입력해주세요."
    });

    const checkContentRows = await userDao.checkContent(contentsId);
    if(checkContentRows.length ==0)
    return res.json({
        isSuccess: false,
        code: 3000,
        message: "해당하는 인덱스의 글이 없습니다."
    });
    else
    var targetUserId = checkContentRows[0].userId 

        try {
            const reportInfoParams = [contentsId,userId,targetUserId]
            const checkReportRows = await userDao.checkReport(reportInfoParams);
            if(checkReportRows.length !=0 )
               return res.json({
                    isSuccess: false,
                    code: 3001,
                    message: "이미 신고한 글입니다."
                   });
            
            const reportRows = await userDao.report(reportInfoParams);

            return res.json({
                isSuccess: true,
                code: 1000,
                message: "신고성공"
            });
        } catch (err) {
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(2010).send(`Error: ${err.message}`);
        }
};

//좋아요 상태 수정
exports.like = async function (req, res) {
    
    const { contentsId } = req.params;
  
    //유저인덱스
    const {userId} = req.verifiedToken;
      
      if (!/^([0-9]).{0,10}$/.test(contentsId))
      return res.json({
        isSuccess: false,
        code: 2001,
        message: "contentsId는 숫자로 입력해야 합니다.",
      });
  
      //인덱스 유효체크
      const listIdCheckRows = await userDao.listIdCheck(contentsId)
      if (listIdCheckRows.length == 0) 
        return res.json({
          isSuccess: false,
          code: 3000,
          message: "해당하는 인덱스의 글이 존재하지 않습니다.",
        });
  
      try {
  
        const likeParams = [userId,contentsId];
  
        // DB 체크
        const likeCheckRows = await userDao.likeCheck(likeParams)
  
        //등록되어 있지 않다면 status값을 1로 DB에 새로 생성
        if(likeCheckRows.length == 0){
  
          const postLikeRows = await userDao.postLike(likeParams)
          return res.json({
            isSuccess: true,
            code: 1000,
            message: "좋아요 생성 완료",
          });
        }
  
        //이미 등록되어 있는 경우라면 상태값을 0또는 1로 값에 따라 변경 
        else{
  
          const patchLikeRows = await userDao.patchLike(likeParams)
  
           if(likeCheckRows[0].status == 0){
             return res.json({
             isSuccess: true,
             code: 1001,
             message: "좋아요 ON",
           });
         }
  
           else if(likeCheckRows[0].status == 1){
            return res.json({
            isSuccess: true,
            code: 1002,
            message: "좋아요 OFF",
           });
         }     
  
        }
        return res.json({
          isSuccess: false,
          code: 3001,
          message: "에러 발생.",
        });
  
      } catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - SignUp Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
      }
    }