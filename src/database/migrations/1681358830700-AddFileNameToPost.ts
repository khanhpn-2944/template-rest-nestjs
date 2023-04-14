import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileNameToPost1681358830700 implements MigrationInterface {
  name = 'AddFileNameToPost1681358830700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "file_name" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "file_name"`);
  }
}
