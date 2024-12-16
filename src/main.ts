import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    app.use(cors());
    app.use(cookieParser());
    const configService = app.get(ConfigService); 
    const port = configService.get('PORT') || 3000; 
    await app.listen(port);
    console.log(`Server started successfully on port ${port}`);
}
bootstrap();