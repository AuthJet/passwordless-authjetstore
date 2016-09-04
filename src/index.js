const https = require('https');
const url = require('url');
const {promisify} = require('bluebird');

function AuthJetTokenStore(username, password, appId){
	if (!(this instanceof AuthJetTokenStore)){
		return new AuthJetTokenStore(username, password, appId);
	}
	if (!username || !password || !appId){
		throw new Error('AuthJet TokenStore must be provided a username, password, and appId');
	}
	this.baseUrl = `https://${username}:${password}@authjet.com/api`;
	this.appUrl = `${this.baseUrl}/passwordless/${appId}`;
	this._checkAuth()
		.then(({authenticated}) => {
			if (authenticated){
				this._appExists()
					.then(status => {
						if (status != 'OK'){
							console.log(`No AuthJet app found with appId "${appId}"\nPlease check appId or create a new app at https://authjet.com/account/apps`);
						}
					})
					.catch(() => {
						console.log(`No AuthJet app found with appId "${appId}"\nPlease check appId or create a new app at https://authjet.com/account/apps`);
					});
			} else {
				console.log(`${username} is NOT properly authenticated to AuthJet\nPlease check your username and password.`);
			}
		})
		.error(err => console.log('Error authenticating to AuthJet\n', err));
}

const request = (href, cb) => {
	let out = '';
	let statusCode;
	const req = https.get(url.parse(href), res => {
		statusCode = res.statusCode;
		res.on('data', data => out += data);
	});
	req.on('close', () => {
		if (statusCode == 200){
			try {
				return cb(null, JSON.parse(out));
			} catch (e){
				return cb(null, out);
			}
		} else if (statusCode == 401){
			return cb(new Error('AuthJet Not Authenticated'));
		} else if (statusCode == 500){
			return cb(new Error('Internal AuthJet Server Error'));
		} else {
			return cb(statusCode);
		}
	});
	req.on('error', cb);
};


AuthJetTokenStore.prototype.authenticate = function(token, uid, cb) {
	const sendUrl = `${this.appUrl}/authenticate?token=${token}&uid=${uid}`;
	return request(sendUrl, (err, {valid, referrer} = {}) => cb(err, valid, referrer));
};

AuthJetTokenStore.prototype.storeOrUpdate = function(token, uid, msToLive, originUrl, cb) {
	const sendUrl = `${this.appUrl}/storeOrUpdate?token=${token}&uid=${uid}&msToLive=${msToLive}&originUrl=${originUrl}`;
	request(sendUrl, cb);
};

AuthJetTokenStore.prototype.invalidateUser = function(uid, cb) {
	const sendUrl = `${this.appUrl}/invalidateUser?uid=${uid}`;
	request(sendUrl, cb);
};

AuthJetTokenStore.prototype.clear = function(cb) {
	const sendUrl = `${this.appUrl}/clear`;
	request(sendUrl, cb);
};

AuthJetTokenStore.prototype.length = function(cb) {
	const sendUrl = `${this.appUrl}/length`;
	request(sendUrl, (err, {length}) => cb(err, length));
};



AuthJetTokenStore.prototype._checkAuth = promisify(function(cb){
	const sendUrl = `${this.baseUrl}/check-auth`;
	return request(sendUrl, cb);
});

AuthJetTokenStore.prototype._appExists = promisify(function(cb){
	const sendUrl = `${this.appUrl}/exists`;
	return request(sendUrl, cb);
});

module.exports = AuthJetTokenStore;