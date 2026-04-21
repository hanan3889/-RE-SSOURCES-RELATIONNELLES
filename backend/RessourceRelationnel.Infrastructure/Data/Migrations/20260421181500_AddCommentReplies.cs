using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using RessourceRelationnel.Infrastructure.Data;

#nullable disable

namespace RessourceRelationnel.Infrastructure.Data.Migrations
{
    [DbContext(typeof(RRDbContext))]
    [Migration("20260421181500_AddCommentReplies")]
    public partial class AddCommentReplies : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
SET @col_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'commentaire'
      AND COLUMN_NAME = 'id_commentaire_parent'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE commentaire ADD COLUMN id_commentaire_parent BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'commentaire'
      AND INDEX_NAME = 'IX_commentaire_id_commentaire_parent'
);
SET @sql := IF(@idx_exists = 0,
    'CREATE INDEX IX_commentaire_id_commentaire_parent ON commentaire(id_commentaire_parent)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND CONSTRAINT_NAME = 'FK_commentaire_commentaire_id_commentaire_parent'
);
SET @sql := IF(@fk_exists = 0,
    'ALTER TABLE commentaire ADD CONSTRAINT FK_commentaire_commentaire_id_commentaire_parent FOREIGN KEY (id_commentaire_parent) REFERENCES commentaire(IdCommentaire) ON DELETE CASCADE',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
SET @fk_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND CONSTRAINT_NAME = 'FK_commentaire_commentaire_id_commentaire_parent'
);
SET @sql := IF(@fk_exists > 0,
    'ALTER TABLE commentaire DROP FOREIGN KEY FK_commentaire_commentaire_id_commentaire_parent',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'commentaire'
      AND INDEX_NAME = 'IX_commentaire_id_commentaire_parent'
);
SET @sql := IF(@idx_exists > 0,
    'DROP INDEX IX_commentaire_id_commentaire_parent ON commentaire',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'commentaire'
      AND COLUMN_NAME = 'id_commentaire_parent'
);
SET @sql := IF(@col_exists > 0,
    'ALTER TABLE commentaire DROP COLUMN id_commentaire_parent',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
");
        }
    }
}
