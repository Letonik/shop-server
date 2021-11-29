const jwt = require('jsonwebtoken');
const {RefreshToken} = require('../models/models')

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '195m'});
        const refreshToken = jwt.sign(payload, process.env.SECRET_KEY_REFRESH, {expiresIn: '45d'});
        return {
            accessToken,
            refreshToken
        }
    }
    
    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.SECRET_KEY);
            return userData
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.SECRET_KEY_REFRESH);
            return userData
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await RefreshToken.findOne(({where: {userId}}))
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await RefreshToken.create({userId, refreshToken});
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await RefreshToken.destroy(({where: {refreshToken}}));
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await RefreshToken.findOne(({where: {refreshToken}}));
        return tokenData;
    }
}

module.exports = new TokenService();