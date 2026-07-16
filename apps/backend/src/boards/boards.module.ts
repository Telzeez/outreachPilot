import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BoardsService } from './boards.service';
import { BOARD_SOURCE } from './interfaces/board-source.interface';
import { RemoteOkSource } from './sources/remoteok.source';
import { BoardIngestProcessor } from './jobs/board-ingest.processor';
import { BoardsController } from './boards.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'boards-ingest',
    }),
  ],
  controllers: [BoardsController],
  providers: [
    BoardsService,
    BoardIngestProcessor,
    {
      provide: BOARD_SOURCE,
      useClass: RemoteOkSource,
      multi: true, // Allows us to inject an array of BoardSources
    },
  ],
})
export class BoardsModule {}
