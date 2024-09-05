import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CalculatorModule } from './calculator/calculator.module';
import { NormalizationModule } from './normalization/normalization.module';
import { UserMiddleware } from './auth/user-middleware/user.middleware';
import { CutSectionModule } from './cut-section/cut-section.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: ':memory:',  // Base de datos en memoria
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,     // Sincronización automática
      }),
    }),
    UserModule,
    AuthModule,
    CalculatorModule,
    NormalizationModule,
    CutSectionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
