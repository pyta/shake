import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBoardDocumentsAndPublishJobs1784620000941 implements MigrationInterface {
    name = 'AddBoardDocumentsAndPublishJobs1784620000941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "board_documents" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdById" bigint, "updatedById" bigint, "deletedAt" TIMESTAMP WITH TIME ZONE, "boardId" bigint NOT NULL, "version" integer NOT NULL, "payload" jsonb NOT NULL, CONSTRAINT "UQ_02f8d4bfd3ea89df26b4dadbfa6" UNIQUE ("boardId", "version"), CONSTRAINT "PK_d774f9aef09f3f145caae8f81a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "board_publish_jobs" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdById" bigint, "updatedById" bigint, "deletedAt" TIMESTAMP WITH TIME ZONE, "boardId" bigint NOT NULL, "status" character varying(32) NOT NULL DEFAULT 'pending', "boardDocumentId" bigint, "error" text, "attemptCount" integer NOT NULL DEFAULT '0', "startedAt" TIMESTAMP WITH TIME ZONE, "finishedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_3ca8bc81f6719084a89f11c917a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "publishedDocumentId" bigint`);
        await queryRunner.query(`ALTER TABLE "board_documents" ADD CONSTRAINT "FK_e54edc1fb359225242b5f3b285e" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "board_publish_jobs" ADD CONSTRAINT "FK_d1fe854694e56048ef984a69667" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "board_publish_jobs" ADD CONSTRAINT "FK_76d6deb84cab8a13d22859f0727" FOREIGN KEY ("boardDocumentId") REFERENCES "board_documents"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boards" ADD CONSTRAINT "FK_88770011056fd66f28755f86ff0" FOREIGN KEY ("publishedDocumentId") REFERENCES "board_documents"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT "FK_88770011056fd66f28755f86ff0"`);
        await queryRunner.query(`ALTER TABLE "board_publish_jobs" DROP CONSTRAINT "FK_76d6deb84cab8a13d22859f0727"`);
        await queryRunner.query(`ALTER TABLE "board_publish_jobs" DROP CONSTRAINT "FK_d1fe854694e56048ef984a69667"`);
        await queryRunner.query(`ALTER TABLE "board_documents" DROP CONSTRAINT "FK_e54edc1fb359225242b5f3b285e"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "publishedDocumentId"`);
        await queryRunner.query(`DROP TABLE "board_publish_jobs"`);
        await queryRunner.query(`DROP TABLE "board_documents"`);
    }

}
