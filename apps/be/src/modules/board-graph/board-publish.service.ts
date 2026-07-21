import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Board } from '../../entities/board.entity';
import {
  BoardPublishJob,
  BoardPublishJobStatus,
} from '../../entities/board-publish-job.entity';
import { BoardDocumentSerializeError } from './board-document.serializer';
import { BoardDocumentService } from './board-document.service';

const ACTIVE_STATUSES = [
  BoardPublishJobStatus.Pending,
  BoardPublishJobStatus.Running,
];

@Injectable()
export class BoardPublishService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BoardPublishService.name);
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private processing = false;

  constructor(
    @InjectRepository(Board)
    private readonly boards: Repository<Board>,
    @InjectRepository(BoardPublishJob)
    private readonly jobs: Repository<BoardPublishJob>,
    private readonly documents: BoardDocumentService,
  ) {}

  onModuleInit() {
    this.pollTimer = setInterval(() => {
      void this.drainPending();
    }, 2000);
  }

  onModuleDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  async enqueue(boardId: string, createdById: string | null = null) {
    const board = await this.boards.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }

    const active = await this.jobs.findOne({
      where: { boardId, status: In(ACTIVE_STATUSES) },
    });
    if (active) {
      throw new ConflictException(
        `Board ${boardId} already has an active publish job ${active.id}`,
      );
    }

    const job = this.jobs.create({
      boardId,
      status: BoardPublishJobStatus.Pending,
      boardDocumentId: null,
      error: null,
      attemptCount: 0,
      startedAt: null,
      finishedAt: null,
      createdById,
      updatedById: createdById,
    });
    const saved = await this.jobs.save(job);

    // Kick processing without blocking the HTTP response.
    setImmediate(() => {
      void this.processJob(saved.id);
    });

    return saved;
  }

  async findJob(boardId: string, jobId: string) {
    const job = await this.jobs.findOne({ where: { id: jobId, boardId } });
    if (!job) {
      throw new NotFoundException(
        `Publish job ${jobId} not found on board ${boardId}`,
      );
    }
    return job;
  }

  async listJobs(boardId: string) {
    const exists = await this.boards.exist({ where: { id: boardId } });
    if (!exists) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }
    return this.jobs.find({
      where: { boardId },
      order: { id: 'DESC' },
      take: 50,
    });
  }

  private async drainPending() {
    if (this.processing) return;
    const pending = await this.jobs.find({
      where: { status: BoardPublishJobStatus.Pending },
      order: { id: 'ASC' },
      take: 5,
    });
    for (const job of pending) {
      await this.processJob(job.id);
    }
  }

  async processJob(jobId: string) {
    if (this.processing) {
      // Another tick will pick it up; avoid overlapping work on one instance.
    }
    this.processing = true;
    try {
      const job = await this.jobs.findOne({ where: { id: jobId } });
      if (!job || job.status !== BoardPublishJobStatus.Pending) {
        return;
      }

      job.status = BoardPublishJobStatus.Running;
      job.startedAt = new Date();
      job.attemptCount += 1;
      await this.jobs.save(job);

      try {
        const doc = await this.documents.createPublishedVersion(
          job.boardId,
          job.createdById,
        );
        job.status = BoardPublishJobStatus.Completed;
        job.boardDocumentId = doc.id;
        job.error = null;
        job.finishedAt = new Date();
        await this.jobs.save(job);
      } catch (err) {
        const message =
          err instanceof BoardDocumentSerializeError
            ? err.message
            : err instanceof Error
              ? err.message
              : String(err);
        this.logger.warn(`Publish job ${jobId} failed: ${message}`);
        job.status = BoardPublishJobStatus.Failed;
        job.error = message;
        job.finishedAt = new Date();
        await this.jobs.save(job);
      }
    } finally {
      this.processing = false;
    }
  }
}
