import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { DataSource } from 'typeorm'
import { User as BasicUser } from '../database/entities/User'

// 扩展Request接口，添加自定义属性
declare global {
    namespace Express {
        interface Request {
            userId?: string
            basicUser?: BasicUser
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: '访问被拒绝，需要认证token' })
        }

        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'

        try {
            const decoded = jwt.verify(token, jwtSecret) as any
            const appDataSource: DataSource = req.app.get('appDataSource')
            const userRepository = appDataSource.getRepository(BasicUser)

            // 验证用户是否仍然存在
            const user = await userRepository.findOne({ where: { id: decoded.userId } })
            if (!user) {
                return res.status(401).json({ message: '用户不存在' })
            }

            // 将用户信息添加到请求对象中
            req.userId = decoded.userId
            req.basicUser = user
            next()
        } catch (jwtError) {
            return res.status(403).json({ message: 'token无效或已过期' })
        }
    } catch (error) {
        return res.status(500).json({ message: '服务器内部错误' })
    }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.basicUser) {
        return res.status(401).json({ message: '未认证' })
    }

    if (!req.basicUser.isAdmin) {
        return res.status(403).json({ message: '需要管理员权限' })
    }

    next()
}

// 可选的认证中间件 - 如果有token则验证，没有token也允许通过
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            // 没有token，继续执行但不设置用户信息
            return next()
        }

        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'

        try {
            const decoded = jwt.verify(token, jwtSecret) as any
            const appDataSource: DataSource = req.app.get('appDataSource')
            const userRepository = appDataSource.getRepository(BasicUser)

            const user = await userRepository.findOne({ where: { id: decoded.userId } })
            if (user) {
                req.userId = decoded.userId
                req.basicUser = user
            }
        } catch (jwtError) {
            // token无效，但不阻止请求继续
        }

        next()
    } catch (error) {
        next()
    }
}