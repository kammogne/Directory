var winston = require('winston'),
    mongoose = require( 'mongoose' ),
    Lookups = mongoose.model( 'Lookups' ),
    request = require('superagent'),
    queryString = require('querystring'),
    https = require('https');

exports.getAll = function ( req, res ) {
    Lookups.findOne({name: 'skills'},function ( err, skills ) {
        if(!skills || !skills.values){
            skills = { values:[]};
        }
        res.send( skills.values );
    });
};

exports.post = function(req, res){
    var skillToSave = {
        name: req.body.name,
        description: req.body.description,
        isApproved: false
    },
    postData = queryString.stringify(
        {
            grant_type: 'password',
            resource: 'https://graph.microsoft.com/',
            client_id: '15e94743-f2e0-4dcd-9695-4901a0175fc6',
            client_secret: '459rqch7iCCkaaO2gF7jbRb',
            username: req.body.consultant.email,
            password: 'K@lamar2016'
        }
    ),

    postOptions = {
        host: 'login.microsoftonline.com',
        port: '443',
        path: '/common/oauth2/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    },
    postRequest = https.request(postOptions, function (response) {
        var data = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            var accessToken = JSON.parse(data).access_token;

            Lookups.findOne( {name: 'skills'}, function(err, skills){
                winston.info('info', 'Send skill request email');

                if(!skills){
                    skills = new Lookups();
                    skills.name = "skills";
                }

                if(!skills.values){
                    skills.values = [];
                }

                if ( skills.values.filter(function(s) { return s.name === req.params.id;}).length > 0 ) {
                    res.send( 400 );
                    return;
                }

                skills.values.push(skillToSave);

                skills.save(function ( err, savedSkill ) {
                    if ( err ){
                        winston.log('error', 'error saving skill ' + savedSkill.name);
                        res.send( 500 );
                    }

                    var userFullName = req.body.consultant.firstName + ' ' + req.body.consultant.lastName;
                    var fullUrl = req.protocol + '://' + req.headers.host + '/requestSkill';

                    var mailBody =  generateMailBody(
                        userFullName,
                        req.body.consultant.manager.emailNickname + '@improving.com',
                        fullUrl,
                        null
                    );

                    sendEmail(
                        accessToken,
                        JSON.stringify(mailBody),
                        function (res) {
                            winston.log(res);
                        });

                    res.send( req.body );
                });
            });
        });
    });

    postRequest.on('error', function (e) {
        console.log('Error: ' + e.message);
        done(e);
    });

    postRequest.write(postData);
    postRequest.end();

    // The contents of the outbound email message that will be sent to the user
    const emailContent = `<html><head> <meta http-equiv='Content-Type' content='text/html; charset=us-ascii'> <title></title> </head>
        <body style='font-family:calibri'> <p>{{name}} requested for a new skill to be added!</p> <p>Please follow the link below to approve it.</p> 
        <p><a href='{{sharingLink}}'> Approve skill </a></p></body> </html>`;

    function getEmailContent(name, sharingLink) {
        let bodyContent = emailContent.replace('{{name}}', name);
        bodyContent = bodyContent.replace('{{sharingLink}}', sharingLink);
        return bodyContent;
    }

    function wrapEmail(content, recipient) {
        const emailAsPayload = {
            Message: {
                Subject: 'Request to add a new skill',
                Body: {
                    ContentType: 'HTML',
                    Content: content
                },
                ToRecipients: [
                    {
                        EmailAddress: {
                            Address: recipient
                        }
                    }
                ]
            },
            SaveToSentItems: true,
            Attachments: null
        };
        return emailAsPayload;
    }

    function generateMailBody(name, recipient, sharingLink) {
        return wrapEmail(getEmailContent(name, sharingLink), recipient);
    }

    function sendEmail(accessToken, message, callback) {
        request
            .post('https://graph.microsoft.com/v1.0/me/sendMail')
            .send(message)
            .set('Authorization', 'Bearer ' + accessToken)
            .set('Content-Type', 'application/json')
            .set('Content-Length', message.length)
            .end((err, res) => {
                winston.info(request);
                callback(err, res);
            });
    }
};

