import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { QueueModule } from './queue/queue.module';
import { BoardsModule } from './boards/boards.module';
import { LeadsModule } from './leads/leads.module';
import { CompaniesModule } from './companies/companies.module';
import { OutreachModule } from './outreach/outreach.module';
import { SettingsModule } from './settings/settings.module';
import { BrokenSitesModule } from './broken-sites/broken-sites.module';

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
    ScheduleModule.forRoot(),
    QueueModule,
    BoardsModule,
    LeadsModule,
    CompaniesModule,
    OutreachModule,
    SettingsModule,
    BrokenSitesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
