import { Inject, Injectable } from '@nestjs/common';
import Groq from "groq-sdk";
import { TestOptionDTO } from './dto/test-option.dto';
import { ElevenLabsClient } from 'elevenlabs/Client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
@Injectable()
export class AiService {
    constructor(
        private readonly groq : Groq,
        @Inject('S3_CLIENT') private readonly s3: S3Client,
    ){
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        })
    }

    async generateReadingSection(testOptionDTO: TestOptionDTO){
        const chatCompetion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Generate an English reading comprehension test based on the following parameters:
                            Difficulty: Difficulty(Easy-Medium-Hard),
                            Topic: Topic,
                            Type: Reading.

                        Instructions:

                            Create a detailed reading passage related to the given topic. Each passage should be approximately 300-500 words in length.
                            The complexity of the reading passages and questions should match the specified difficulty level.
                            Generate 10 multiple-choice questions for this passage.
                            Questions should vary in type, including factual, inferential, and vocabulary-based questions.
                            Include the correct answer for each question.
                        Sample Input:
                            Difficulty: Hard
                            Topic: Environment

                        The output should be in JSON format as shown in the example below:

                    {
                                    "sectionContext": [
                                        {
                                            "id": 1,
                                            "passage": "The humble bee, often overlooked in favor of the more flamboyant butterfly, plays a vital role in our ecosystem. These fuzzy insects are not only fascinating creatures but also essential pollinators, contributing significantly to the production of fruits, vegetables, and seeds.\n\nBees are social insects, living in colonies with a complex social structure. Within a colony, there are three types of bees: the queen bee, the worker bees, and the drones. The queen bee is the largest bee in the colony and is responsible for laying eggs. Worker bees, which are all female, perform various tasks such as foraging for nectar and pollen, building and maintaining the hive, and caring for the young. Drones, the male bees, have only one purpose: to mate with the queen.\n\nThe life cycle of a honeybee begins with an egg laid by the queen. The egg hatches into a larva, which is fed by worker bees. The larva then pupates, transforming into an adult bee. The entire process takes about 21 days.\n\nBees are excellent pollinators due to their unique anatomy. Their hairy bodies collect pollen grains as they move from flower to flower, transferring the pollen to other flowers and enabling fertilization. Without bees, many plant species would struggle to reproduce, leading to a decline in biodiversity.\n\nWhile bee populations have been declining in recent years due to factors such as habitat loss, pesticide use, and climate change, there are steps we can take to protect these important pollinators. Planting bee-friendly flowers, reducing pesticide use, and supporting local beekeepers are all ways to help ensure the survival of bees and the health of our planet.",
                                            "question": [
                                                {
                                                    "id": 1,
                                                    "question": "What is the main topic of the passage?",
                                                    "answer": [
                                                        "The importance of bees in pollination",
                                                        "The life cycle of a honeybee",
                                                        "The different types of bees in a colony",
                                                        "The threats facing bee populations"
                                                    ],
                                                    "correct answer": "The different types of bees in a colony"
                                                }
                                            ]
                                        }
                                    ]
                                }

                        Please ensure all questions are relevant to their respective passages and that the difficulty matches the given level (easy, medium, hard).`
                },
                {
                    role: "user",
                    content: `Difficulty: ${testOptionDTO.difficulty}, Topic: ${testOptionDTO.topic}`
                },
            ],
            model: "gemma2-9b-it",
            max_tokens: 5000,
            temperature: 0.6,
            response_format: {type: 'json_object'}
        })
        const response = chatCompetion.choices[0].message.content;

        return JSON.parse(response);
    }

    async generateListeningSection(testOptionDTO: TestOptionDTO){
        try {
        const elevenlabs = new ElevenLabsClient({
            apiKey: process.env.ELEVENLABS_API_KEY
        })

        const chatCompetion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Generate an English passage based on the following parameters: Difficutly and Topic. 
                    When I request a Topic, Difficulty, you have to generate for me the passage for this, the passage must have below 100 words, and must relate to the topic I give.
                    And also the complexity of passage must be match with the difficulty I give.`
                },
                {
                    role: "user",
                    content: `Difficulty: ${testOptionDTO.difficulty}, Topic: ${testOptionDTO.topic}`
                },
            ],
            model: "gemma2-9b-it",
            max_tokens: 1000,
            temperature: 0.8,
        })
        const passage = chatCompetion.choices[0].message.content;
        console.log(passage);
        
        const request = {
            model_id: "eleven_turbo_v2",
            text: passage
        }

        const audio = await elevenlabs.textToSpeech.convert("CwhRBWXzGAHq8TQ4Fs17", request)
        
        const chunks: Buffer[] = [];
        for await (const chunk of audio) {
          chunks.push(chunk);
        }
      
        const content = Buffer.concat(chunks);

        const fileKey = uuid();
        const bucketName = process.env.S3_BUCKET;
        
        await this.s3.send(
            new PutObjectCommand({
              Bucket: bucketName,
              Key: fileKey,
              Body: content,
              ACL: 'public-read',
            }),
          );
      
        const s3Url = `${process.env.S3_BASE_URL}/${fileKey}`;
        
        const chatCompetion2 = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are the English test generator, when I send you the passage, you have to generate for me 10 multiple-choice questions related to that passage, each one must include the correct answer too. Also I will give the audio link for this, so you need to attach the link in the output too.
                        Sample Input:
                            Passage: "The humble bee, often overlooked in favor of the more flamboyant butterfly, plays a vital role in our ecosystem. These fuzzy insects are not only fascinating creatures but also essential pollinators, contributing significantly to the production of fruits, vegetables, and seeds.\n\nBees are social insects, living in colonies with a complex social structure. Within a colony, there are three types of bees: the queen bee, the worker bees, and the drones. The queen bee is the largest bee in the colony and is responsible for laying eggs. Worker bees, which are all female, perform various tasks such as foraging for nectar and pollen, building and maintaining the hive, and caring for the young. Drones, the male bees, have only one purpose: to mate with the queen.\n\nThe life cycle of a honeybee begins with an egg laid by the queen. The egg hatches into a larva, which is fed by worker bees. The larva then pupates, transforming into an adult bee. The entire process takes about 21 days.\n\nBees are excellent pollinators due to their unique anatomy. Their hairy bodies collect pollen grains as they move from flower to flower, transferring the pollen to other flowers and enabling fertilization. Without bees, many plant species would struggle to reproduce, leading to a decline in biodiversity.\n\nWhile bee populations have been declining in recent years due to factors such as habitat loss, pesticide use, and climate change, there are steps we can take to protect these important pollinators. Planting bee-friendly flowers, reducing pesticide use, and supporting local beekeepers are all ways to help ensure the survival of bees and the health of our planet.",
                            Audio link: "https://engleet-audio.s3.amazonaws.com/1556781f-f1a5-4bfa-bfd4-03f4700a6180"

                        The output should be in JSON format as shown in the example below:

                    {
                                    "sectionContext": [
                                        {
                                            "id": 1,
                                            "audio_link": "https://engleet-audio.s3.amazonaws.com/1556781f-f1a5-4bfa-bfd4-03f4700a6180"
                                            "question": [
                                                {
                                                    "id": 1,
                                                    "question": "What is the main topic of the passage?",
                                                    "answer": [
                                                        "The importance of bees in pollination",
                                                        "The life cycle of a honeybee",
                                                        "The different types of bees in a colony",
                                                        "The threats facing bee populations"
                                                    ],
                                                    "correct answer": "The different types of bees in a colony"
                                                }
                                            ]
                                        }
                                    ]
                                }

                        Please ensure all questions are relevant to their respective passages and that the difficulty matches the given level (easy, medium, hard).`
                },
                {
                    role: "user",
                    content: `Passage: ${passage}, Audio link: ${s3Url}`
                },
            ],
            model: "gemma2-9b-it",
            max_tokens: 4000,
            temperature: 0.8,
            response_format: {type: 'json_object'}
        })

        const response = chatCompetion2.choices[0].message.content;

        return JSON.parse(response);
    } catch (error) {
            console.log(error);
            
    }
    }
}
