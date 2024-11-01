import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Difficulty } from "../enum/difficulty.enum";
import { QuestionTopic } from "./question-topic.entity";
import { Review } from "./review.entity";
import { Type } from "../enum/type.enum";

@Entity('quizz')
export class Quizz {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    title: string;

    @ManyToOne(() => QuestionTopic)
    @JoinColumn({ name: 'topic_id', foreignKeyConstraintName: 'fk_topic_listening' })
    topic: QuestionTopic;

    @Column({nullable: false})
    difficulty: Difficulty;

    @Column({nullable:false, type:'text'})
    context: string;

    @Column({nullable: false, type: 'json'})
    answer: JSON;

    @Column({nullable: false})
    correct_answer: string;

    @Column({nullable: true})
    audio_link: string;

    @Column({nullable: false})
    score: number;

    @Column({nullable:false})
    acceptance: number;

    @CreateDateColumn({ nullable: false })
    created_at?: Date;
  
    @UpdateDateColumn()
    updated_at?: Date;
  
    @DeleteDateColumn()
    deleted_at?: Date;

    @OneToMany(() => Review, (review) => review.quizz)
    review: Review;

    @Column({nullable: false})
    type: Type;
}