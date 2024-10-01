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
    controllers:[],
})
export class ApiModule {}