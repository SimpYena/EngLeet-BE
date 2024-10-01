import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseConfig } from "src/config/database.config";

@Module({
    imports:[
        TypeOrmModule.forRootAsync({
            useFactory: () => DatabaseConfig()
        })
    ],
    providers:[],
})
export class ApiModule {}