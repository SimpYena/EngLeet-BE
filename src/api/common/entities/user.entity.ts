import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, DeleteDateColumn, CreateDateColumn, OneToMany } from "typeorm";
import { Review } from "./review.entity";

@Entity('users')
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

    @CreateDateColumn({ nullable: false })
    created_at?: Date;
  
    @UpdateDateColumn()
    updated_at?: Date;
  
    @DeleteDateColumn()
    deleted_at?: Date;

    @Column({ nullable: true })
    last_login?: Date;

    @OneToMany(() => Review, (review) => review.user)
    review: Review;
  }

