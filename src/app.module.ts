import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ElectionsModule } from './elections/elections.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from './config/database.config';
import { UtilsModule } from './utils/utils.module';
import jwtConfig from './config/jwt.config';
import gmailConfig from './config/gmail.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtConfig, databaseConfig, gmailConfig],
      envFilePath: '.env', 
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('database.uri'),
        dbName: configService.get('database.dbName'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    UtilsModule,
    ElectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}