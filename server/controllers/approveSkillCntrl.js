var winston = require('winston'),
    mongoose = require( 'mongoose' ),
    lookups = mongoose.model( 'Lookups' ),
    request = require('superagent'),
    queryString = require('querystring'),
    https = require('https');

exports.get = function ( req, res ) {
    lookups.findSkill( 'skills', function ( err, skills ) {
        if ( err ) {
            winston.error("Error No skill found", err);
            res.send( 500 );
            return;
        }

        var result;
        for(var i = 0; i < skills.values.length; i++) {
            if (skills.values[i].name  === req.params.id) {
                result = skills.values[i];
            }
        }

        res.send(result);
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
                username: req.body.currentUser.email,
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

                lookups.findOne( {name: 'skills'}, function(err, skills){
                    winston.info('info', 'Send skill request email');

                    if(!skills){
                        skills = new lookups();
                        skills.name = "skills";
                    }

                    if(!skills.values){
                        skills.values = [];
                    }
                    //TODO: Landry, Update the Filter to return the skill. Or just loop through to find the skill to be updated
                    if ( skills.values.filter(function(s) { return s._id === req.body._id;}).length > 0 ) {
                        skills.update(function ( s, err ) {
                            if ( err ){
                                winston.log('error', 'error saving skill ' + req.body.name);
                                res.send( 500 );
                            }

                            var userFullName = req.body.currentUser.firstName + ' ' + req.body.currentUser.lastName;
                            var fullUrl = req.protocol + '://' + req.headers.host + '/consultants/' + req.body.currentUser.emailNickname;
                            var skillWithLevel =  req.body.name;

                            if (skillWithLevel !== null) {
                                skillWithLevel = req.body.name + '. Level : ' +  req.body.level;
                            }

                            var mailBody =  generateMailBody(
                                userFullName,
                                req.body.currentUser.email,
                                fullUrl,
                                skillWithLevel,
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
                    }
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
        <body style='font-family:calibri'> <p>{{requesterName}} approve this : {{skill}} you requested to be added and it is ready to use.</p> <p>Please follow the link below to add it to your profile.</p> 
        <p><a href='{{sharingLink}}'> Go to your profile </a></p></body> </html>`;

    function getEmailContent(requesterName, sharingLink, skill) {
        let bodyContent = emailContent.replace('{{requesterName}}', requesterName);
        bodyContent = bodyContent.replace('{{sharingLink}}', sharingLink);
        bodyContent = bodyContent.replace('{{skill}}', skill);
        return bodyContent;
    }

    function wrapEmail(content, recipient) {
        const emailAsPayload = {
            Message: {
                Subject: 'Your Skill Was Approved',
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

    function generateMailBody(requesterName, recipient, sharingLink, skill) {
        return wrapEmail(getEmailContent(requesterName, sharingLink, skill), recipient);
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