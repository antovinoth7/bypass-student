-- Database: BypassPortal
-- This script provisions the SQL Server schema required by the Bypass Portal API.
-- Run the CREATE DATABASE statement if the database does not yet exist; otherwise skip it
-- and execute only the USE statement plus the table/index definitions.

IF DB_ID(N'BypassPortal') IS NULL
BEGIN
    CREATE DATABASE [BypassPortal];
END
GO

USE [BypassPortal];
GO

-- Drop tables if you need a clean redeploy. Comment out these lines in production.
-- DROP TABLE IF EXISTS [dbo].[CleanupRuns];
-- DROP TABLE IF EXISTS [dbo].[SystemSettings];
-- DROP TABLE IF EXISTS [dbo].[AuditLogEntries];
-- DROP TABLE IF EXISTS [dbo].[StudentBypasses];
-- DROP TABLE IF EXISTS [dbo].[StaffUsers];
-- GO

CREATE TABLE [dbo].[StaffUsers]
(
    [Id]                UNIQUEIDENTIFIER    NOT NULL CONSTRAINT [DF_StaffUsers_Id] DEFAULT NEWSEQUENTIALID(),
    [Email]             NVARCHAR(256)       NOT NULL,
    [DisplayName]       NVARCHAR(256)       NOT NULL CONSTRAINT [DF_StaffUsers_DisplayName] DEFAULT (N''),
    [Role]              NVARCHAR(32)        NOT NULL CONSTRAINT [DF_StaffUsers_Role] DEFAULT (N'invigilator'),
    [Department]        NVARCHAR(128)       NOT NULL CONSTRAINT [DF_StaffUsers_Department] DEFAULT (N''),
    [LastLoginUtc]      DATETIMEOFFSET(7)   NOT NULL CONSTRAINT [DF_StaffUsers_LastLoginUtc] DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_StaffUsers] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UQ_StaffUsers_Email] UNIQUE ([Email])
);
GO

CREATE TABLE [dbo].[StudentBypasses]
(
    [Id]             UNIQUEIDENTIFIER    NOT NULL CONSTRAINT [DF_StudentBypasses_Id] DEFAULT NEWSEQUENTIALID(),
    [NusId]          NVARCHAR(16)        NOT NULL,
    [Name]           NVARCHAR(256)       NULL,
    [Reason]         NVARCHAR(512)       NOT NULL CONSTRAINT [DF_StudentBypasses_Reason] DEFAULT (N''),
    [AddedByUserId]  UNIQUEIDENTIFIER    NOT NULL,
    [AddedAtUtc]     DATETIMEOFFSET(7)   NOT NULL CONSTRAINT [DF_StudentBypasses_AddedAtUtc] DEFAULT SYSUTCDATETIME(),
    [ExpiresAtUtc]   DATETIMEOFFSET(7)   NULL,
    [Source]         NVARCHAR(16)        NOT NULL CONSTRAINT [DF_StudentBypasses_Source] DEFAULT (N'Manual'),
    [RemovedAtUtc]   DATETIMEOFFSET(7)   NULL,
    CONSTRAINT [PK_StudentBypasses] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UQ_StudentBypasses_NusId] UNIQUE ([NusId]),
    CONSTRAINT [FK_StudentBypasses_StaffUsers] FOREIGN KEY ([AddedByUserId]) REFERENCES [dbo].[StaffUsers] ([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

CREATE TABLE [dbo].[AuditLogEntries]
(
    [Id]            UNIQUEIDENTIFIER    NOT NULL CONSTRAINT [DF_AuditLogEntries_Id] DEFAULT NEWSEQUENTIALID(),
    [TimestampUtc]  DATETIMEOFFSET(7)   NOT NULL CONSTRAINT [DF_AuditLogEntries_TimestampUtc] DEFAULT SYSUTCDATETIME(),
    [Action]        NVARCHAR(64)        NOT NULL,
    [ActorUserId]   UNIQUEIDENTIFIER    NULL,
    [Details]       NVARCHAR(1024)      NOT NULL CONSTRAINT [DF_AuditLogEntries_Details] DEFAULT (N''),
    [Success]       BIT                 NOT NULL,
    [MetadataJson]  NVARCHAR(MAX)       NULL,
    CONSTRAINT [PK_AuditLogEntries] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_AuditLogEntries_StaffUsers] FOREIGN KEY ([ActorUserId]) REFERENCES [dbo].[StaffUsers] ([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

CREATE TABLE [dbo].[SystemSettings]
(
    [Id]                     UNIQUEIDENTIFIER    NOT NULL CONSTRAINT [DF_SystemSettings_Id] DEFAULT NEWSEQUENTIALID(),
    [AutoCleanupEnabled]     BIT                 NOT NULL CONSTRAINT [DF_SystemSettings_AutoCleanupEnabled] DEFAULT (1),
    [CleanupTimeUtc]         TIME(0)             NOT NULL CONSTRAINT [DF_SystemSettings_CleanupTimeUtc] DEFAULT ('02:00:00'),
    [LogRetentionDays]       INT                 NOT NULL CONSTRAINT [DF_SystemSettings_LogRetentionDays] DEFAULT (30),
    [AllowBatchUpload]       BIT                 NOT NULL CONSTRAINT [DF_SystemSettings_AllowBatchUpload] DEFAULT (1),
    [GraphApiEndpoint]       NVARCHAR(256)       NOT NULL CONSTRAINT [DF_SystemSettings_GraphApiEndpoint] DEFAULT (N''),
    [SecurityGroupId]        NVARCHAR(128)       NOT NULL CONSTRAINT [DF_SystemSettings_SecurityGroupId] DEFAULT (N''),
    [MaxBypassDurationHours] INT                 NOT NULL CONSTRAINT [DF_SystemSettings_MaxBypassDurationHours] DEFAULT (168),
    [UpdatedAtUtc]           DATETIMEOFFSET(7)   NOT NULL CONSTRAINT [DF_SystemSettings_UpdatedAtUtc] DEFAULT SYSUTCDATETIME(),
    [UpdatedByUserId]        UNIQUEIDENTIFIER    NOT NULL,
    CONSTRAINT [PK_SystemSettings] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_SystemSettings_StaffUsers] FOREIGN KEY ([UpdatedByUserId]) REFERENCES [dbo].[StaffUsers] ([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX [IX_SystemSettings_SecurityGroupId]
    ON [dbo].[SystemSettings] ([SecurityGroupId]);
GO

CREATE TABLE [dbo].[CleanupRuns]
(
    [Id]           UNIQUEIDENTIFIER    NOT NULL CONSTRAINT [DF_CleanupRuns_Id] DEFAULT NEWSEQUENTIALID(),
    [RunAtUtc]     DATETIMEOFFSET(7)   NOT NULL CONSTRAINT [DF_CleanupRuns_RunAtUtc] DEFAULT SYSUTCDATETIME(),
    [Trigger]      NVARCHAR(16)        NOT NULL CONSTRAINT [DF_CleanupRuns_Trigger] DEFAULT (N'Manual'),
    [RemovedCount] INT                 NOT NULL CONSTRAINT [DF_CleanupRuns_RemovedCount] DEFAULT (0),
    [Succeeded]    BIT                 NOT NULL,
    [Notes]        NVARCHAR(1024)      NOT NULL CONSTRAINT [DF_CleanupRuns_Notes] DEFAULT (N''),
    CONSTRAINT [PK_CleanupRuns] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- Optional seed: create a placeholder admin settings row so the API has defaults.
-- Replace the GUIDs and configuration values with environment-specific data.
/*
DECLARE @AdminUserId UNIQUEIDENTIFIER = NEWSEQUENTIALID();

INSERT INTO [dbo].[StaffUsers] ([Id], [Email], [DisplayName], [Role], [Department], [LastLoginUtc])
VALUES (@AdminUserId, N'admin@example.com', N'Admin User', N'admin', N'Operations', SYSUTCDATETIME());

INSERT INTO [dbo].[SystemSettings]
    ([Id], [AutoCleanupEnabled], [CleanupTimeUtc], [LogRetentionDays], [AllowBatchUpload], [GraphApiEndpoint], [SecurityGroupId], [MaxBypassDurationHours], [UpdatedAtUtc], [UpdatedByUserId])
VALUES
    (NEWSEQUENTIALID(), 1, '02:00:00', 30, 1, N'https://graph.microsoft.com/v1.0', N'00000000-0000-0000-0000-000000000000', 168, SYSUTCDATETIME(), @AdminUserId);
*/
