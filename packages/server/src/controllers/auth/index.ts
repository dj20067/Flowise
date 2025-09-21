import { Request, Response, NextFunction } from 'express'
import { DataSource } from 'typeorm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User as BasicUser } from '../../database/entities/User'

interface AuthRequest extends Request {
    body: {
        username: string
        password: string
    }
}

const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const appDataSource: DataSource = req.app.get('appDataSource')
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' })
        }

        // 检查用户是否已存在
        const userRepository = appDataSource.getRepository(BasicUser)
        const existingUser = await userRepository.findOne({ where: { username } })

        if (existingUser) {
            return res.status(409).json({ message: '用户名已存在' })
        }

        // 加密密码
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // 创建新用户
        const newUser = new BasicUser()
        newUser.username = username
        newUser.password = hashedPassword
        newUser.isAdmin = false // 默认不是管理员

        const savedUser = await userRepository.save(newUser)

        // 返回用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = savedUser
        return res.status(201).json({
            message: '用户注册成功',
            user: userWithoutPassword
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const appDataSource: DataSource = req.app.get('appDataSource')
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' })
        }

        // 查找用户
        const userRepository = appDataSource.getRepository(BasicUser)
        const user = await userRepository.findOne({ where: { username } })

        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' })
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: '用户名或密码错误' })
        }

        // 生成JWT token
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                isAdmin: user.isAdmin
            },
            jwtSecret,
            { expiresIn: '24h' }
        )

        // 返回token和用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user
        return res.status(200).json({
            message: '登录成功',
            token,
            user: userWithoutPassword
        })
    } catch (error) {
        next(error)
    }
}

const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '未提供认证token' })
        }

        const token = authHeader.substring(7)
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'

        try {
            const decoded = jwt.verify(token, jwtSecret) as any
            const appDataSource: DataSource = req.app.get('appDataSource')
            const userRepository = appDataSource.getRepository(BasicUser)
            const user = await userRepository.findOne({ where: { id: decoded.userId } })

            if (!user) {
                return res.status(401).json({ message: '用户不存在' })
            }

            // 返回当前用户信息（不包含密码）
            const { password: _, ...userWithoutPassword } = user
            return res.status(200).json({
                user: userWithoutPassword
            })
        } catch (jwtError) {
            return res.status(401).json({ message: 'token无效' })
        }
    } catch (error) {
        next(error)
    }
}

export default {
    register,
    login,
    me
}
