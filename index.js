require('dotenv').config();

var express = require('express')
  , session = require('express-session')
  , jwt = require('jsonwebtoken')
  , request = require('superagent')
  , morgan = require('morgan')
var Grant = require('grant-express')
  , port = process.env.PORT || 3001
  , oauthConsumer= process.env.OAUTH_CONSUMER || `http://localhost`
  , oauthProvider = process.env.OAUTH_PROVIDER_URL || 'http://localhost'
  , grant = new Grant({
    defaults: {
      protocol: 'https',
      host: oauthConsumer,
      transport: 'session',
      state: true
    },
    eko: {
      key: process.env.CLIENT_ID || 'test',
      secret: process.env.CLIENT_SECRET || 'secret',
      redirect_uri: `${oauthConsumer}/connect/eko/callback`,
      authorize_url: `${oauthProvider}/oauth/authorize`,
      access_url: `${oauthProvider}/oauth/token`,
      oauth: 2,
      scope: ['openid', 'profile'],
      callback: '/done',
      scope_delimiter: ' ',
      custom_params: { deviceId: 'abcd', appId: 'com.pud' }
    }
  })

var app = express()

app.use(morgan('dev'))

// REQUIRED: (any session store - see ./examples/express-session)
app.use(session({secret: 'grant'}))

// mount grant
app.use(grant)

app.get('/done', (req, res) => {
  if (req.session.grant.response.error) {
    res.status(500).json(req.session.grant.response.error);
  } else {
    res.json(req.session.grant);
  }
  // request
  //   .get(`${oauthProvider}/userinfo`)
  //   .set('Authorization', `Bearer ${req.session.grant.response.access_token}`)
  //   .end((err, result) => {
  //     if (err) {
  //       return res.status(400).send(err.message);
  //     }

  //     res.end(`User data =>  ${JSON.stringify(result.body)}`);
  //   })
})

app.listen(port, () => {
  console.log(`READY port ${port}`)
})