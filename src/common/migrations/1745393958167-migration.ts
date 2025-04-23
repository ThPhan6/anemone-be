import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745393958167 implements MigrationInterface {
  name = 'Migration1745393066362';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_cc9e89897e336172fd06367735d"`,
    );
    await queryRunner.query(`ALTER TABLE "devices" ALTER COLUMN "serial_number" DROP NOT NULL`);

    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_cc9e89897e336172fd06367735d" FOREIGN KEY ("serial_number") REFERENCES "products"("serial_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_cc9e89897e336172fd06367735d"`,
    );
    await queryRunner.query(`ALTER TABLE "devices" ALTER COLUMN "serial_number" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_cc9e89897e336172fd06367735d" FOREIGN KEY ("serial_number") REFERENCES "products"("serial_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
