import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745378428932 implements MigrationInterface {
  name = 'Migration1745378428932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device_commands" DROP COLUMN "command"`);
    await queryRunner.query(`ALTER TABLE "device_commands" ADD "command" json NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device_commands" DROP COLUMN "command"`);
    await queryRunner.query(
      `ALTER TABLE "device_commands" ADD "command" character varying NOT NULL`,
    );
  }
}
