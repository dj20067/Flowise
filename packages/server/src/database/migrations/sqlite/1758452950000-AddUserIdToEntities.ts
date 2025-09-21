import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserIdToEntities1758452950000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add userId column to chat_flow table
        await queryRunner.query(`ALTER TABLE "chat_flow" ADD COLUMN "userId" TEXT;`)

        // Add userId column to chat_message table
        await queryRunner.query(`ALTER TABLE "chat_message" ADD COLUMN "userId" TEXT;`)

        // Add userId column to document_store table
        await queryRunner.query(`ALTER TABLE "document_store" ADD COLUMN "userId" TEXT;`)

        // Add userId column to apikey table
        await queryRunner.query(`ALTER TABLE "apikey" ADD COLUMN "userId" TEXT;`)

        // Add userId column to credential table
        await queryRunner.query(`ALTER TABLE "credential" ADD COLUMN "userId" TEXT;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove userId column from chat_flow table
        await queryRunner.query(`ALTER TABLE "chat_flow" DROP COLUMN "userId";`)

        // Remove userId column from chat_message table
        await queryRunner.query(`ALTER TABLE "chat_message" DROP COLUMN "userId";`)

        // Remove userId column from document_store table
        await queryRunner.query(`ALTER TABLE "document_store" DROP COLUMN "userId";`)

        // Remove userId column from apikey table
        await queryRunner.query(`ALTER TABLE "apikey" DROP COLUMN "userId";`)

        // Remove userId column from credential table
        await queryRunner.query(`ALTER TABLE "credential" DROP COLUMN "userId";`)
    }
}
