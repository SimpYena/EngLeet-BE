import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Quizz } from "./quizz.entity";

@Entity('question_topic')
export class QuestionTopic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    topic: string;

    @OneToMany(() => Quizz, (quizz) => quizz.topic)
    quizzes: Quizz[];
}