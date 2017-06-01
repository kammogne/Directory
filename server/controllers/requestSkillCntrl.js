var winston = require('winston'),
    mongoose = require( 'mongoose' ),
    Lookups = mongoose.model( 'Lookups' ),
    request = require('superagent'),
    queryString = require('querystring'),
    https = require('https');

var accessToken;
var postData;
var postOptions;
var postRequest;


postData = queryString.stringify(
    {
        grant_type: 'password',
        resource: 'https://graph.microsoft.com/',
        client_id: '15e94743-f2e0-4dcd-9695-4901a0175fc6',
        client_secret: '459rqch7iCCkaaO2gF7jbRb',
        username: 'landry.kammogne@improving.com',
        password: 'K@lamar2016'
    }
);

postOptions = {
    host: 'login.microsoftonline.com',
    port: '443',
    path: '/common/oauth2/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

postRequest = https.request(postOptions, function (res) {
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
        accessToken = JSON.parse(data).access_token;
    });
});

exports.getAll = function ( req, res ) {
    Lookups.findOne({name: 'skills'},function ( err, skills ) {
        if(!skills || !skills.values){
            skills = { values:[]};
        }
        res.send( skills.values );
    });
};


postRequest.on('error', function (e) {
    console.log('Error: ' + e.message);
    done(e);
});

postRequest.write(postData);
postRequest.end();

exports.post = function(req, res){
        Lookups.findOne( {name: 'skills'}, function(err, skills){
        winston.log('info', 'send skill request email');

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

        var skillToSave = req.body;

        skillToSave.isApproved = false;

        skills.values.push(skillToSave);

        skills.save(function ( err, savedSkill ) {
            if ( err ){
                winston.log('error', 'error saving skill ' + savedSkill.name);
                res.send( 500 );
            }
            res.send( req.body );

            var mailBody =  generateMailBody(
                'Landry Kammogne',
                'landry.kammogne@improving.com',
                'https://www.google.com/imgres?imgurl=http%3A%2F%2Fdallas-csharp-sig.com%2Fimg%2FImproving-logo-lg.jpg&imgrefurl=http%3A%2F%2Fdallas-csharp-sig.com%2F&docid=lM5AABxCY6yqIM&tbnid=ScqTq1XJT1DB-M%3A&vet=10ahUKEwi05-DzkonUAhUQ84MKHVKnC5wQMwglKAAwAA..i&w=2708&h=849&bih=885&biw=1745&q=improving%20enterprises&ved=0ahUKEwi05-DzkonUAhUQ84MKHVKnC5wQMwglKAAwAA&iact=mrc&uact=8',
                null
            );

            sendEmail(
                accessToken,
                JSON.stringify(mailBody),
                function (error) {
                    assert(error === null, '\nThe sample failed to send an email');
                    done();
                });
        });
    });

    // The contents of the outbound email message that will be sent to the user
    const emailContent = `<html><head> <meta http-equiv='Content-Type' content='text/html; charset=us-ascii'> <title></title> </head>
    <body style='font-family:calibri'> <p>Congratulations {{name}}!</p> <p>This is a message from Landry Kammogne</p> </body> </html>`;


function getEmailContent(name, sharingLink) {
    let bodyContent = emailContent.replace('{{name}}', name);
    bodyContent = bodyContent.replace('{{sharingLink}}', sharingLink);
    return bodyContent;
}

function wrapEmail(content, recipient, file) {
    const attachments = [{
        '@odata.type': '#microsoft.graph.fileAttachment',
        ContentBytes: file,
        Name: 'mypic.jpg'
    }];
    const emailAsPayload = {
        Message: {
            Subject: 'Welcome to Microsoft Graph development with Node.js and the Microsoft Graph Connect sample',
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
        Attachments: attachments
    };
    return emailAsPayload;
}

function generateMailBody(name, recipient, sharingLink, file) {
    return wrapEmail(getEmailContent(name, sharingLink), recipient, file);
}

function sendEmail(accessToken, message, callback) {
    request
        .post('https://graph.microsoft.com/v1.0/me/sendMail')
        .send(message)
        .set('Authorization', 'Bearer ' + accessToken)
        .set('Content-Type', 'application/json')
        .set('Content-Length', message.length)
        .end((err, res) => {
         winston.log(request);
         callback(err, res);
        });
}
};

