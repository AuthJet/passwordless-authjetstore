# Passwordless-AuthJetStore

This module provides token storage for [Passwordless](https://github.com/florianheinemann/passwordless), a node.js module for express that allows website authentication without password using verification through email or other means. Visit the project's website https://passwordless.net for more details.

### Free Cloud Hosting
Tokens are stored FOR FREE in the AuthJet cloud service. [AuthJet](https://authjet.com) also provides a low-cost solution for sending tokens via SMS

## Usage

First, install the module:

`$ npm install passwordless-authjetstore --save`

Afterwards, follow the guide for [Passwordless](https://github.com/florianheinemann/passwordless). A typical implementation may look like this:

```javascript
var passwordless = require('passwordless');
var AuthJetStore = require('passwordless-authjetstore');

// register for free at https://AuthJet.com
passwordless.init(new AuthJetStore('USERNAME', 'PASSWORD', 'APP_ID'));

passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        // Send out a token
    });
    
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken());
```

## Initialization

```javascript
new AuthJetStore(username, password, appId);
```
* **username:** *(string)* username you use to login to AuthJet
* **password:** *(string)* password you use to login to AuthJet
* **appId:** *(string)* obtained at https://authjet.com/accounts/apps

## License

[MIT License](http://opensource.org/licenses/MIT)

## Author
[AuthJet](https://github.com/AuthJet)