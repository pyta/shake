import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCatalogNodePropertyName1783424725899 implements MigrationInterface {
    name = 'AddCatalogNodePropertyName1783424725899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "catalog_node_properties" ADD "name" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "catalog_node_properties" DROP COLUMN "name"`);
    }

}
