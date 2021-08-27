const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const logger = require('morgan');
const config = require('./config/config.json');

const app = express();
const port = 3000;
const router = express.Router();

app.use(bodyparser.urlencoded({extended: false}));
app.use(logger('dev'));

const pool = mysql.createPool(config);

// http://127.0.0.1:3000/regist (post)
router.route('/modify').post((req, res) => {
    const userid = req.body.userid;
    const userpw = req.body.userpw;
    const name = req.body.name;
    const hp = req.body.hp;
    const email = req.body.email;
    const hobby = req.body.hobby;
    const ssn1 = req.body.ssn1;
    const ssn2 = req.body.ssn2;
    const zipcode = req.body.zipcode;
    const address1 = req.body.address1;
    const address2 = req.body.address2;
    const address3 = req.body.address3;

    console.log(`userid:${userid}, userpw:${userpw}, name:${name}, hp:${hp}, email:${email}, hobby:${hobby}, ssn1:${ssn1}, ssn2:${ssn2}, zipcode:${zipcode}, address1:${address1}, address2:${address2}, address3:${address3}, idxuserid:${idxuserid}`);
    
    if(pool){
        ModifyMember(userid, userpw, name, hp, email, hobby, ssn1, ssn2, zipcode, address1, address2, address3, idxuserid,(err, result) => {
            if(err){
                res.writeHead('200', {'content-type':'text/html;charset=utf8'});
                res.write('<h2>정보 수정 실패!</h2>');
                res.end();
            }else{
                res.writeHead('200', {'content-type':'text/html;charset=utf8'});
                res.write('<h2>정보수정  성공! 변경하기 전의 아이디를 인덱스로 사용했습니다!!</h2>');
                res.end();
            }
        });
    }else{
        res.writeHead('200', {'content-type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결실패!</h2>');
        res.end();
    }
});


// http://127.0.0.1:3000/delete (post)
router.route('/delete').post((req, res) => {
    const userid = req.body.userid;
    const userpw = req.body.userpw;

    console.log(`userid:${userid}, userpw:${userpw}`);
    if(pool){
        DeleteMember(userid, userpw, (err, result) => {
            if(err){
                res.writeHead('200', {'content-type':'text/html;charset=utf8'});
                res.write('<h2>삭제 실패!</h2>');
                res.end();
            }else{
                // mem_idx, mem_userid, mem_name
                const mem_idx = result[0].mem_idx;
                const mem_userid = result[0].mem_userid;
                const mem_name = result[0].mem_name;

                res.writeHead('200', {'content-type':'text/html;charset=utf8'});
                res.write('<h2>삭제 성공</h2>');
              
                res.end();
            }
        });
    }else{
            res.writeHead('200', {'content-type':'text/html;charset=utf8'});
            res.write('<h2>데이터베이스 연결실패!</h2>');
            res.end();
    }
});





const DeleteMember = function(userid, userpw, callback){
    pool.getConnection((err, conn) => {
        if(err){
            console.log(err);
            return;
        }else{
            const sql = conn.query('delete  from tb_member where mem_userid=? and mem_userpw=?', [userid, userpw], (err, result) => {
                if(err){
                    callback(err, null);
                    return;
                }else{
                    if(result.length > 0){
                        console.log('삭제하겠습니다');
                        callback(null, result);
                    }else{
                        console.log('일치하는 사용자가 없음');
                        callback(null, null);
                    }
                    return;
                }
            });
        }
    });
}

const ModifyMember = function(userid, userpw, name, hp, email, hobby, ssn1, ssn2, zipcode, address1, address2, address3,idxuserid, callback){
    pool.getConnection((err, conn) => {
        if(err){
            console.log(err);
        }else{
            const sql = conn.query('update tb_member set mem_userid=?, mem_userpw=?, mem_name=?,mem_hp=?, mem_email=?, mem_hobby=?, mem_ssn1=?, mem_ssn2=?, mem_zipcode=?, mem_address1=?, mem_address2=?, mem_address3=? where  mem_userid=?', 
            [userid, userpw, name, hp, email, hobby, ssn1, ssn2, zipcode, address1, address2, address3,idxuserid], (err, result) => {
                conn.release();
//                console.log(sql);
                if(err){
                    callback(err, null);
                    return;
                }else{
                    console.log('변경하기전 아이디를 인덱스 삼아 정보를 변경하였습니다.!');
                    callback(null, result);
                }
            });
        }
    });
}

app.use('/', router);

app.listen(port, () => {
    console.log(`${port}포트로 서버 동작중 ...`);
});
