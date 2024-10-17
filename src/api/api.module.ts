import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseConfig } from "src/config/database.config";
import { UsersModule } from "./modules/users/users.module";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ResponseInterceptor } from "./common/interceptors/response.interceptors";
import { I18nModule } from "nestjs-i18n";
import { I18nConfig } from "src/config/i18.config";


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
        TypeOrmModule.forRootAsync({
            useFactory: () => DatabaseConfig()
        }),
        I18nModule.forRoot(I18nConfig),
        UsersModule
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        }
    ],
    controllers: [],
})
export class ApiModule { }