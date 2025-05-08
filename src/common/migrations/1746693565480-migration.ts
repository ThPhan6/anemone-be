import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746693565480 implements MigrationInterface {
  name = 'Migration1746693565480';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD "onboarded" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "questionnaire" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "questionnaire"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "onboarded"`);
  }
}
