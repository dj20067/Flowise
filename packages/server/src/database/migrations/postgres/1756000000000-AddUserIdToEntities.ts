import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserIdToEntities1756000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if userId column exists in assistant table
        const assistantColumnExists = await queryRunner.hasColumn('assistant', 'userId')
        if (!assistantColumnExists) {
            await queryRunner.query(`ALTER TABLE "assistant" ADD COLUMN "userId" TEXT;`)
        }

        // Check if userId column exists in tool table
        const toolColumnExists = await queryRunner.hasColumn('tool', 'userId')
        if (!toolColumnExists) {
            await queryRunner.query(`ALTER TABLE "tool" ADD COLUMN "userId" TEXT;`)
        }

        // Check if userId column exists in variable table
        const variableColumnExists = await queryRunner.hasColumn('variable', 'userId')
        if (!variableColumnExists) {
            await queryRunner.query(`ALTER TABLE "variable" ADD COLUMN "userId" TEXT;`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove userId column from assistant table
        const assistantColumnExists = await queryRunner.hasColumn('assistant', 'userId')
        if (assistantColumnExists) {
            await queryRunner.query(`ALTER TABLE "assistant" DROP COLUMN "userId";`)
        }

        // Remove userId column from tool table
        const toolColumnExists = await queryRunner.hasColumn('tool', 'userId')
        if (toolColumnExists) {
            await queryRunner.query(`ALTER TABLE "tool" DROP COLUMN "userId";`)
        }

        // Remove userId column from variable table
        const variableColumnExists = await queryRunner.hasColumn('variable', 'userId')
        if (variableColumnExists) {
            await queryRunner.query(`ALTER TABLE "variable" DROP COLUMN "userId";`)
        }
    }
}