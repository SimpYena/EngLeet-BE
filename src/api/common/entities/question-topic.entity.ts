import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ListeningQuizz } from "./listening-quizz.entity";
import { ReadingQuizz } from "./reading-quizz.entity";

@Entity('question_topic')
export class QuestionTopic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    topic: string;

    @OneToMany(() => ListeningQuizz, (Lquziz) => Lquziz.topic)
    lQuizzes: ListeningQuizz[];

    @OneToMany(() => ReadingQuizz, (Lquziz) => Lquziz.topic)
    rQuizzes: ReadingQuizz[];
}