import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { QueueModule } from './queue/queue.module';
import { BoardsModule } from './boards/boards.module';
import { LeadsModule } from './leads/leads.module';
import { CompaniesModule } from './companies/companies.module';
import { OutreachModule } from './outreach/outreach.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL'),
        },
      }),
    }),
    QueueModule,
    BoardsModule,
    LeadsModule,
    CompaniesModule,
    OutreachModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
