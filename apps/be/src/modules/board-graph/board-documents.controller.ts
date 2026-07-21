import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiAcceptedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiOkEntity,
} from '../../common/swagger/api-responses.decorator';
import { ApiEntityIdParam } from '../../common/swagger/entity-id.decorator';
import {
  BoardDocument as BoardDocumentSchema,
  BoardPublishJob as BoardPublishJobSchema,
} from '../../common/swagger/schemas';
import { BoardDocumentService } from './board-document.service';
import { BoardPublishService } from './board-publish.service';

@ApiTags('Board documents')
@Controller('boards/:boardId')
export class BoardDocumentsController {
  constructor(
    private readonly documents: BoardDocumentService,
    private readonly publish: BoardPublishService,
  ) {}

  @Post('publish')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiEntityIdParam('boardId')
  @ApiOperation({
    summary: 'Enqueue async board document publish (202 + job id)',
  })
  @ApiAcceptedResponse({ type: BoardPublishJobSchema })
  enqueuePublish(@Param('boardId') boardId: string) {
    return this.publish.enqueue(boardId);
  }

  @Get('publish-jobs')
  @ApiEntityIdParam('boardId')
  @ApiOperation({ summary: 'List recent publish jobs for a board' })
  listJobs(@Param('boardId') boardId: string) {
    return this.publish.listJobs(boardId);
  }

  @Get('publish-jobs/:jobId')
  @ApiEntityIdParam('boardId')
  @ApiEntityIdParam('jobId')
  @ApiOperation({ summary: 'Get publish job status' })
  @ApiOkEntity(BoardPublishJobSchema)
  getJob(
    @Param('boardId') boardId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.publish.findJob(boardId, jobId);
  }

  @Get('document')
  @ApiEntityIdParam('boardId')
  @ApiOperation({ summary: 'Get currently published board document' })
  @ApiOkEntity(BoardDocumentSchema)
  getPublished(@Param('boardId') boardId: string) {
    return this.documents.findPublished(boardId);
  }

  @Get('documents')
  @ApiEntityIdParam('boardId')
  @ApiOperation({ summary: 'List published document versions' })
  listDocuments(@Param('boardId') boardId: string) {
    return this.documents.listDocuments(boardId);
  }

  @Get('documents/:documentId')
  @ApiEntityIdParam('boardId')
  @ApiEntityIdParam('documentId')
  @ApiOperation({ summary: 'Get a specific published document version' })
  @ApiOkEntity(BoardDocumentSchema)
  getDocument(
    @Param('boardId') boardId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documents.findDocument(boardId, documentId);
  }
}
