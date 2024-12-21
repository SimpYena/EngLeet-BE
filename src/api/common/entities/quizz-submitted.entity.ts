import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Quizz } from "./quizz.entity";

@Entity('quizz_submitted')
export class QuizzSubmitted {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_user_submit' })
    user: User;
    
    @ManyToOne(() => Quizz)
    @JoinColumn({ name: 'quizz_id', foreignKeyConstraintName: 'fk_quizz_submit' })
    quizz: Quizz;

    @Column()
    score: number;

    @Column()
    attempt: number;

    @CreateDateColumn({ nullable: false })
    created_at: Date;
}