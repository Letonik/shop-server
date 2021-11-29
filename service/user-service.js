const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const {User, UserInfo, Basket} = require('../models/models');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('./../dtos/user-dto');

class UserService {
    async registration(email, password, phone, name, address, role) {
        if (!email || !password) {
            throw ApiError.badRequest('Некорректный email или пароль');
        }
        const candidate = await User.findOne({where: {email}});
        if (candidate) {
            throw ApiError.badRequest('Пользователь с таким email уже существует');
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const activationLink = uuid.v4()
        const user = await User.create({email, password: hashPassword, activationLink, role});
        const basket = await Basket.create({userId: user.id});
        const info = await UserInfo.create({userId: user.id, phone, name, address});
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`);
       /* const userDto = new UserDto(user); // id, email, role
        const tokens = tokenService.generateToken({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)*/
        return `На ваш email было отправленно письмо для подтверждения аккаунта! Мы рады видеть вас в нашем магазине!`;
    }

    async activate(activationLink, next) {
        const user = await User.findOne({where: {activationLink}})
        if (!user) {
            throw ApiError.badRequest('Некорректная ссылка активации');
        }
        user.isActivated = true;
        await user.save()
    }

    async login(email, password) {

        const user = await User.findOne({where: {email}});
        if (!user) {
            throw ApiError.badRequest('Пользователь не найден');
        }
        let comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            throw ApiError.badRequest('Указан неверный пароль');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateToken({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto};
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.unauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.unauthorizedError();
        }
        const user = await User.findOne({where: {id: userData.id}})
        const userDto = new UserDto(user);
        const tokens = tokenService.generateToken({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto};
    }

  /*  async getAllUsers() {
        const users = await User.findAll();
        return users;
    }*/
}

module.exports = new UserService();