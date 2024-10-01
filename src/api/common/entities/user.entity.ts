import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, DeleteDateColumn, CreateDateColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, unique: true })
    email: string

    @Column({ nullable: false })
    full_name: string

    @Column({ nullable: false })
    gender: string

    @Column({ length: 255 , nullable: false })
    hashed_password: string

    @Column({ default: false , nullable: false })
    is_verified: boolean

    @CreateDateColumn()
    created_at: string

    @DeleteDateColumn()
    deleted_at: string

    @UpdateDateColumn()
    updated_at: string

}
