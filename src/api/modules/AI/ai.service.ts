import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { TestOptionDTO } from './dto/test-option.dto';
import { ElevenLabsClient } from 'elevenlabs/Client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentTest } from 'src/api/common/entities/assessment-test.entity';
import { AwnswerDTO } from './dto/answer.dto';
import { GeneratedTest } from 'src/api/common/entities/generated-test.entity';
import { Type } from 'src/api/common/enum/type.enum';
import { plainToInstance } from 'class-transformer';
import { TestListDTO } from './dto/test-list.dto';
import { User } from 'src/api/common/entities/user.entity';
import { Result } from './interface/result.interface';
import { ChatDTO } from './dto/chat.dto';
import { ChatGroq } from '@langchain/groq';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
@Injectable()
export class AiService {
  constructor(
    private readonly groq: Groq,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
    @InjectRepository(AssessmentTest)
    private readonly testAssessmentRepository: Repository<AssessmentTest>,
    @InjectRepository(GeneratedTest)
    private readonly generatedTestRepository: Repository<GeneratedTest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly genAI: GoogleGenerativeAI
  ) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }

  async generateReadingSection(testOptionDTO: TestOptionDTO, userInfo: any): Promise<JSON> {
    const chatCompetion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
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

                        Please ensure all questions are relevant to their respective passages and that the difficulty matches the given level (easy, medium, hard).`,
        },
        {
          role: 'user',
          content: `Difficulty: ${testOptionDTO.difficulty}, Topic: ${testOptionDTO.topic}`,
        },
      ],
      model: 'gemma2-9b-it',
      max_tokens: 5000,
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    const response = chatCompetion.choices[0].message.content;
    await this.generatedTestRepository.save({
      content: JSON.parse(response),
      title: `Reading Test generated by AI`,
      type: Type.Reading,
      user: {id: userInfo.userId}
    })
    return JSON.parse(response);
  }

  async generateListeningSection(testOptionDTO: TestOptionDTO, userInfo: any): Promise<JSON> {
    try {
      const elevenlabs = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
      });

      const chatCompetion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Generate an English passage based on the following parameters: Difficutly and Topic. 
                    When I request a Topic, Difficulty, you have to generate for me the passage for this, the passage must have below 100 words, and must relate to the topic I give.
                    And also the complexity of passage must be match with the difficulty I give.`,
          },
          {
            role: 'user',
            content: `Difficulty: ${testOptionDTO.difficulty}, Topic: ${testOptionDTO.topic}`,
          },
        ],
        model: 'gemma2-9b-it',
        max_tokens: 1000,
        temperature: 0.8,
      });
      const passage = chatCompetion.choices[0].message.content;

      const request = {
        model_id: 'eleven_turbo_v2',
        text: passage,
      };

      const audio = await elevenlabs.textToSpeech.convert(
        'CwhRBWXzGAHq8TQ4Fs17',
        request,
      );

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
            role: 'system',
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

                        Please ensure all questions are relevant to their respective passages and that the difficulty matches the given level (easy, medium, hard).`,
          },
          {
            role: 'user',
            content: `Passage: ${passage}, Audio link: ${s3Url}`,
          },
        ],
        model: 'gemma2-9b-it',
        max_tokens: 4000,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const response = chatCompetion2.choices[0].message.content;

      await this.generatedTestRepository.save({
        content: JSON.parse(response),
        title: `Listening Test generated by AI`,
        type: Type.Listening,
        user: {id: userInfo.userId}
      })

      return JSON.parse(response);
    } catch (error) {
      console.log(error);
    }
  }

  async generateAssessmentTest(userInfo: any) {
    try {
      const chatCompetion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Generate for me an assessment English Test, this is multiple choice question, include 20 question. You can choose any kind of topic, the difficulty will go ascending. Just include the question and 4 answer only. Also include the correct answer. The output must be returned as a JSON format. Here is the sample output:
[
            {
                "question": [
                    {
                        "id": 1,
                        "question": "What is the main cause of anthropogenic climate change?",
                        "answer": [
                            "Volcanic eruptions",
                            "Deforestation",
                            "Rampant greenhouse gas emissions",
                            "Solar flares"
                        ],
                        "correct answer": "Rampant greenhouse gas emissions"
                    },
                    {
                        "id": 2,
                        "question": "Which of the following is NOT a consequence of climate change mentioned in the passage?",
                        "answer": [
                            "Rising sea levels",
                            "Increased volcanic activity",
                            "Extreme weather events",
                            "Biodiversity loss"
                        ],
                        "correct answer": "Increased volcanic activity"
                    },
                    {
                        "id": 3,
                        "question": "What does the phrase 'cascading disruptions' refer to?",
                        "answer": [
                            "The gradual melting of glaciers",
                            "The interconnected effects of climate change on ecosystems",
                            "The spread of invasive species",
                            "The depletion of the ozone layer"
                        ],
                        "correct answer": "The interconnected effects of climate change on ecosystems"
                    }
]`,
          },
        ],
        model: 'gemma2-9b-it',
        max_tokens: 5000,
        temperature: 0.6,
        response_format: { type: 'json_object' },
      });
      const response = chatCompetion.choices[0].message.content;

      const assessment = JSON.parse(response);

      const user = await this.testAssessmentRepository.findOneBy({
        user: { id: userInfo.userId },
      });

      if (user) {
        await this.testAssessmentRepository.delete({user:{id: userInfo.userId}});
      }

      await this.testAssessmentRepository.save({
        test: assessment,
        user: { id: userInfo.userId },
      });

      return assessment;
    } catch (error) {
      console.log(error);
    }
  }
  async submitAssessment(user: any, answerDTO: AwnswerDTO) {
    try {
      const assessment = await this.testAssessmentRepository.findOneBy({
        user: { id: user.userId },
      });

      const combined = { ...assessment.test, answers: answerDTO.answer };

      const chatCompetion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an automated scoring AI. Your task is to evaluate a user's English language proficiency based on their answers to a set of questions. You must calculate the score, and determine the user's proficiency level based on predefined criteria. 

            Here is the sample input and output for your reference:

            Input:
             {
                questions: [
                    {
                    id: 1,
                    answer: [Array],
                    question: "Which of these words means the opposite of 'happy'?",
                    'correct answer': 'Sad'
                    },
                    {
                    id: 2,
                    answer: [Array],
                    question: "Choose the correct plural form of the word 'child':",
                    'correct answer': 'Children'
                    },
                    {
                    id: 3,
                    answer: [Array],
                    question: "Identify the noun in the following sentence: 'The cat sat on the mat.'",
                    'correct answer': 'Cat'
                    },
                    {
                    id: 4,
                    answer: [Array],
                    question: 'Which sentence uses correct grammar?',
                    'correct answer': 'My friends and I went to the park.'
                    },
                    {
                    id: 5,
                    answer: [Array],
                    question: "What is the past tense of the verb 'go'? ",
                    'correct answer': 'Went'
                    }
                ],
                answers: [
                    'Angry',
                    'Warm',
                    'I eat breakfast this morning.',
                    'Childs',
                    'Table',
                ]
            }
        Suppose the user gives the above answers. Your output should be return as a JSON:
            {
                "score" : "3/20",
                "level": 2
            }


        Please follow the steps below to generate your response:
        1. Extract questions, correct answers, and user's answers from the input.
        2. Compare each user's answer with the corresponding correct answer to calculate the score.
        3. Determine the user's level based on the score, using the following criteria:
        - 0-3 correct answers: Level 1 (Beginner)
        - 4-8 correct answers: Level 2 (Amateur)
        - 9-14 correct answers: Level 3 (Intermediate)
        - 15-19 correct answers: Level 4 (Advanced)
        - 20 correct answers: Level 5 (Expert)
        4. Return the score and user level in the format "Score: x/20. Level: y.`,
          },
          {
            role: 'user',
            content: JSON.stringify(combined),
          },
        ],
        model: 'llama3-8b-8192',
        max_tokens: 2810,
        temperature: 0.48,
        response_format: { type: 'json_object' },
      });

      const response = chatCompetion.choices[0].message.content;

      const result:Result = JSON.parse(response);

      const existUser = this.userRepository.findOneBy({
        id: user.userId
      })

      await this.userRepository.update({id: user.userId},{level: result.level})

      return JSON.parse(response);
    } catch (error) {
      console.log(error);
    }
  }
  async getListTest(user:any){
    const tests = await this.generatedTestRepository.find({
      where: {
        user: {id: user.userId}
      }
    })
  return plainToInstance(TestListDTO, tests);
  }
  async getTest(user:any, id: number){
    const test = await this.generatedTestRepository.findOneBy({
      user: {id: user.userId},
      id: id
    })
    if(!test){
      throw new BadRequestException('SYS-0006');
    }
    return test;
  }
  async chatWithAI(chatDTO: ChatDTO){
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pinecone.Index('engleet-chatbot')
    
    try { 
      const queryEmbedding = await this.createEmbedding(chatDTO.message);

    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    const context = searchResults.matches
    .map((match: any) => match.metadata.text)
    .join("\n");

    const prompt = `
    Use the following pieces of information to answer the user's question.
    If you don't know the answer, just say that you don't know. don't try to make up an answer.
    Context: ${context}

    User Question: ${chatDTO.message}

    Only return the helpful answer below and nothing else.
    Helpful answer:
  `;

    const llm = new ChatGroq({
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      maxTokens: 10000,
      maxRetries: 2,
    });

    const aiMsg = await llm.invoke([
      {
        role: "system",
        content:
          "You are a helpful assistant.",
      },
      { role: "user", content: prompt },
    ]);
    
    return aiMsg.content;
    } catch (error) {
      console.log(error);
    }
  }

  async createEmbedding(text: string): Promise<number[]>{
    const model = this.genAI.getGenerativeModel({model:"text-embedding-004"})
    const response = await model.embedContent(text)
    return response.embedding.values.slice(0, 384);
  }
}
