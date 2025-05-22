import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747906353767 implements MigrationInterface {
  name = 'Migration1747906353767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_sessions" ADD "duration_secs" numeric`);
    await queryRunner.query(`ALTER TABLE "user_sessions" ADD "start_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "user_sessions" ADD "played_secs" numeric`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "played_secs"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "start_at"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "duration_secs"`);
  }
}
