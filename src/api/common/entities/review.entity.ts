import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { ListeningQuizz } from "./listening-quizz.entity";
import { ReadingQuizz } from "./reading-quizz.entity";

@Entity('review')
export class Review{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_user_review' })
    user: User;

    @Column({ length: 255 })
    description: string;

    @ManyToOne(() => ListeningQuizz)
    @JoinColumn({ name: 'quizz_id', foreignKeyConstraintName: 'fk_lquizz_review' })
    lQuizz: ListeningQuizz;   

    @ManyToOne(() => ReadingQuizz)
    @JoinColumn({ name: 'quizz_id', foreignKeyConstraintName: 'fk_rquizz_review' })
    rQuizz: ListeningQuizz;   
}