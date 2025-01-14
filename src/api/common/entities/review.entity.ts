import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Quizz } from "./quizz.entity";

@Entity('review')
export class Review{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_user_review' })
    user: User;

    @Column({ length: 255 })
    description: string;

    @ManyToOne(() => Quizz)
    @JoinColumn({ name: 'quizz_id', foreignKeyConstraintName: 'fk_quizz_review' })
    quizz: Quizz;   
}