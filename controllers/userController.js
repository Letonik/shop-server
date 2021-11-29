const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User, UserInfo, Basket} = require('../models/models');
const userService = require('../service/user-service');

class UserController {
    async registration(req, res, next) {
        try {
            const {email, password, phone, name, address} = req.body;
            const message = await userService.registration(email, password, phone, name, address, 'USER');
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 45*24*60*60*1000, httpOnly: true, sameSite: 'none', secure: true})
            return res.json(message)
        } catch (e) {
            next(e)
        }
    }

    async registrationAdmin(req, res, next) {
        try {
            const {email, password, phone, name, address} = req.body;
            const message = await userService.registration(email, password, phone, name, address, 'ADMIN');
            return res.json(message);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            if (userData.user.isActivated) {
                res.cookie('refreshToken', userData.refreshToken, {maxAge: 45 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true});
                return res.json(userData);
            }
            return res.json({user: userData.user});
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token)
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 45 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role);
        return res.json({token});
    }

    async showInfo(req, res) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const info = await UserInfo.findOne({
            where: {userId: decoded.id}});
        return res.json(info);

    }

    async changeInfo(req, res) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const updateValue = await UserInfo.update(
            {...req.body},
            {where: {userId: decoded.id}});
        const info = await UserInfo.findOne({
            where: {userId: decoded.id}});
        return res.json(info)
    }

    async changePassword(req, res, next) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const {password, newPassword} = req.body;
        const user = await User.findOne({where: {id: decoded.id}});
        let comparePassword = bcrypt.compareSync(password, user.password);
        if(!comparePassword) {
            return next(ApiError.internal('Указан неверный пароль'));
        }
        const hashPassword = await bcrypt.hash(newPassword, 5);
        const updatePassword = await UserInfo.update(
            {password: hashPassword},
            {where: {userId: decoded.id}});
        return res.json("Пароль успешно изменен")
    }
}

module.exports = new UserController();