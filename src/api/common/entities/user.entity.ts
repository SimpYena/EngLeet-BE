import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, DeleteDateColumn, CreateDateColumn, OneToMany } from "typeorm";
import { Review } from "./review.entity";
import { QuizzSubmitted } from "./quizz-submitted.entity";
import { AssessmentTest } from "./assessment-test.entity";
import { TestSubmitted } from "./test-submitted.entity";
import { GeneratedTest } from "./generated-test.entity";

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

    @Column({ nullable: true })
    image_link: string;

    @Column({ nullable: true })
    level: number;

    @OneToMany(() => Review, (review) => review.user)
    review: Review;

    @OneToMany(() => QuizzSubmitted, (quizzSubmit) => quizzSubmit.user)
    quizzSubmit: QuizzSubmitted;

    @OneToMany(() => AssessmentTest, (assessment) => assessment.user)
    assessment: AssessmentTest;

    @OneToMany(() => TestSubmitted, (testSubmitted) => testSubmitted.user)
    testSubmitted: TestSubmitted;

    @OneToMany(() => GeneratedTest, (generatedTest) => generatedTest.user)
    generatedTest: GeneratedTest;
  }

