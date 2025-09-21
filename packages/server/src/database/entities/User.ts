/* eslint-disable */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { IUser } from '../../Interface'

@Entity()
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index({ unique: true })
    @Column({ unique: true })
    username: string

    @Column()
    password: string

    @Column({ default: false })
    isAdmin: boolean

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date
}