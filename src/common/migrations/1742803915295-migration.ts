import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1742803915295 implements MigrationInterface {
  name = 'Migration1742803915295';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_profiles" ADD "given_name" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "given_name"`);
  }
}
