

const mongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const static = require('serve-static');
const multer = require('multer');
const path = require('path');
const logger = require('morgan');
const app = express();
const router = express.Router();
const port = 3000;



let database;   // 몽고디비 연결 객체 전역변수




app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));
app.use(logger('dev'));

app.use(bodyParser.urlencoded({extended: false}));



// 몽고디비 연결 함수
function connectDB(){
    const databaseURL = "mongodb://127.0.0.1:27017";
    mongoClient.connect(databaseURL, {useUnifiedTopology: true}, (err, success) => {
        if(err){
            console.log(err);
        }else{
            database = success.db('frontend');
            console.log('mongodb 데이터베이스 연결 성공!');
        }
    });
}


app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));
app.use(logger('dev'));

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads');
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);
        callback(null, basename + "_" + Date.now() + extension);
    }
});

const upload = multer({
    storage: storage,
    limit: {
        files: 1,
        fileSize: 1024 * 1024 * 100
    }
});

router.route('/mail').post(upload.array('photo', 1), (req, res) => {
    try{
        let tomail = req.body.tomail;
        let toname = req.body.toname;
        let title = req.body.title;
        let content = req.body.content;
        
        
        let date = req.body.createDate

        let files = req.files;
        console.dir(req.files[0]);

        let originalname = '';
        let filename = '';
        let mimetype = '';
        let size = 0;

        if(Array.isArray(files)){
            console.log(`클라이언트에서 받아온 파일 개수 : ${files.length}`);
            for(let i=0; i<files.length; i++){
                originalname = files[i].originalname;
                filename = files[i].filename;
                mimetype = files[i].mimetype;
                size = files[i].size;
            }
        }

        fs.readFile('uploads/'+filename, (err, data) => {
            if(err){
                console.log(err);
            }else{
            

                const fmtfrom = '박수빈<soobgg773@gmail.com>';
                const fmtto = `${toname}<${tomail}>`;

                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: '사용자 이메일 입력@gmail.com',
                        pass: '비밀번호입력!!'
                    },
                    host: 'smtp.mail.com',
                    port: '465'
                });

                const mailOptions = {
                    from: fmtfrom,
                    to: fmtto,
                    subject: title,
                    text: content,
                    attachments: [{'filename':filename, 'content': data}]
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log(info);
                        res.writeHead('200', {'Content-type':'text/html;charset=utf8'});
                        res.write('<h2>메일보내기 성공</h2>');
                        res.write('<hr/>')
                        res.write(`<p>제목 : ${title}</p>`);
                        res.write(`<p>내용 : ${content}</p>`);
                        res.write(`<p>현재파일명 : ${filename}</p>`);
                        res.write(`<p><img src='/uploads/${filename}' width=200></p>`);
                        res.end();
                    }
                })
                
            }
        });

        //(받는사람, 받는사람이메일, 제목, 내용, 파일이름, 날짜시간)



    console.log(`toname:${toname}, tomail:${tomail}, title:${title}, content:${content},
    filename:${filename},date:${date}`);

    if(database){
        joinMember(database, toname, tomail, title, content,filename,date, (err, result) => {
            if(err){
                res.writeHead('200', {'content-type':'text/html;charset=utf8'});
                res.write('<h2>저장 실패</h2>');
                res.end();
            }else{
                if(result.insertedCount > 0){
                    res.writeHead('200', {'content-type':'text/html;charset=utf8'});
                    res.write('<h2>메일 정보 저장 성공</h2>');
                    res.end();
                }else{
                    res.writeHead('200', {'content-type':'text/html;charset=utf8'});
                    res.write('<h2>저장 실패</h2>');
                    res.end();
                }
            }
        });
    }else{
        res.writeHead('200', {'content-type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<p>mongodb 데이터베이스에 연결하지 못했습니다</p>');
        res.end();
    }
    }catch(e){
        console.log(e);
    }


});

app.use('/', router);

app.listen(port, () => {
    console.log(`${port}포트로 서버 동작중 ...`);
});